// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // to create my own token or make available the token on smart contract
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol"; // to get current rate of currencies
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol"; // to get randomness function

contract CardGame is VRFConsumerBase, Ownable {
    bytes32 public keyHash;
    uint256 public fee;
    event RequestedRandomness(bytes32 requestId);

    enum GAME_STATE {
        OPEN,
        CLOSED,
        CALCULATING_WINNER
    }
    GAME_STATE public game_state;
    address public mscTokenAddress;
    IERC20 public mscToken;

    constructor(
        address _vrfCoordinator,
        address _link,
        uint256 _fee,
        bytes32 _keyHash,
        address _mscTokenAddress
    ) public VRFConsumerBase(_vrfCoordinator, _link) {
        keyHash = _keyHash;
        fee = _fee;
        game_state = GAME_STATE.CLOSED;
        mscTokenAddress = _mscTokenAddress;
        mscToken = IERC20(_mscTokenAddress);
    }

    // token address > player address > amount
    mapping(address => mapping(address => uint256)) public wagerOfPlayer;

    // token address > priceFeed address
    mapping(address => address) public tokenPriceFeeds;
    //address[] public players;
    // token address > player address list
    mapping(address => address[]) public players;
    address[] public allowedTokens;
    //uint256 public totalPot = 0;
    // token address > totalBetValue
    mapping(address => uint256) public totalPot;
    // token address > player address > card number
    mapping(address => mapping(address => uint256)) public playersCardNumber;
    // token > number of players
    mapping(address => uint256) public playerCounter;
    //uint256[] public cardsNumber;
    mapping(address => uint256[]) public cardNumbers;
    //address public winner = address(0); // you can't use 'null' in solidity
    // token > winner
    mapping(address => address) public winner;
    //address public tokenToRandomness = address(0);
    //player address => token addrss (to prevent to make not to people confuse when require randomness)
    address public tokenToRandomness = address(0);
    address public competedToken = address(0);
    uint256 public randomness;

    //function showMSCTokenAddress() public returns (address) {
    //return mscTokenAddress;
    //}
    //function returnPublicVariables() public view returns () {
    //return (game_state);
    //}

    function sendMSCToken(uint256 _amount) public onlyOwner {
        mscToken.transfer(msg.sender, _amount); // from contract_address to owner_address
    }

    function issueTokens(address _token) public onlyOwner {
        for (uint256 index = 0; index < players[_token].length; index++) {
            address recipient = players[_token][index];
            uint256 userTotalValue = getUserSingleTokenValue(recipient, _token);
            mscToken.transfer(recipient, userTotalValue); // send players MSCToken as a reward
        }
    }

    function allowToken(address _token) public onlyOwner {
        allowedTokens.push(_token);
    }

    function tokenIsAllowed(address _token) public returns (bool) {
        for (uint256 index = 0; index < allowedTokens.length; index += 1) {
            if (allowedTokens[index] == _token) {
                return true;
            }
            return false;
        }
    }

    function playerIsAllowed(address _token) internal returns (bool) {
        for (uint256 index = 0; index < players[_token].length; index++) {
            address player = players[_token][index];
            if (playersCardNumber[_token][player] != 0) {
                return true;
            } else {
                return false;
            }
        }
    }

    function setPriceFeedContract(address _token, address _priceFeed)
        public
        onlyOwner
    {
        tokenPriceFeeds[_token] = _priceFeed;
    }

    function getTokenValue(address _token)
        public
        view
        returns (uint256, uint256)
    {
        address priceFeedAddress = tokenPriceFeeds[_token];
        // AggregatorV3Interface is for getting current rate of currencies
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            priceFeedAddress
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        uint256 decimals = uint256(priceFeed.decimals());
        return (uint256(price), decimals);
    }

    // this func is for just calculating prices to send MSCToken to players as a reward.
    function getUserSingleTokenValue(address _user, address _token)
        internal
        returns (uint256)
    {
        if (wagerOfPlayer[_token][_user] < 0) {
            return 0;
        }

        (uint256 price, uint256 decimals) = getTokenValue(_token);
        return ((wagerOfPlayer[_token][_user] * price) / (10**decimals));
    }

    // this func is for UI which each user use
    function getPlayerSingleTokenValue(address _token)
        public
        view
        returns (uint256)
    {
        if (wagerOfPlayer[_token][msg.sender] < 0) {
            return 0;
        }

        (uint256 price, uint256 decimals) = getTokenValue(_token);
        // 10 ETH (100000000000000000000)
        // ETH/USD -> 100 (10000000000)
        // 10 * 100 = 1,000
        return ((wagerOfPlayer[_token][msg.sender] * price) / (10**decimals));
    }

    //function balanceOfCG() public view returns (uint256) {
    //return address(this).balance;
    //}

    function removeFromPlayers(address _token, address _user) internal {
        uint256 index;
        for (uint256 i = 0; i < players[_token].length; i++) {
            if (players[_token][i] == _user) {
                index = i;
                break;
            }
        }
        for (uint256 e = index; e < players[_token].length - 1; e++) {
            players[_token][e] = players[_token][e + 1];
        }
        //playerCounter -= 1;
    }

    function repayBetToken(uint256 _amount, address _token) public {
        require(
            game_state == GAME_STATE.OPEN || game_state == GAME_STATE.CLOSED,
            "You can't get the refund after game started!"
        );
        require(
            wagerOfPlayer[_token][msg.sender] >= _amount,
            "You didn't bet token of the amount!"
        );
        require(
            playersCardNumber[_token][msg.sender] == 0,
            "You drew your card, you can't refund!"
        );
        IERC20(_token).transfer(msg.sender, _amount);
        wagerOfPlayer[_token][msg.sender] =
            wagerOfPlayer[_token][msg.sender] -
            _amount;
        totalPot[_token] = totalPot[_token] - _amount;
        if (wagerOfPlayer[_token][msg.sender] <= 0) {
            removeFromPlayers(_token, msg.sender);
        }
    }

    function startGame() public onlyOwner {
        require(
            game_state == GAME_STATE.CLOSED,
            "Can't start new game state yet!"
        );

        game_state = GAME_STATE.OPEN;
    }

    function betMoney(uint256 _amount, address _token) public {
        require(_amount > 0, "A bet must be more than 0");
        require(tokenIsAllowed(_token), "This token is not allowed");
        require(
            players[_token].length < 5,
            "Sorry, this game is already full. Please wait next game."
        );
        require(game_state == GAME_STATE.OPEN, "You can't bet money while ");
        //require(
        //IERC20(_token).balanceOf(msg.sender) > 0,
        //"You don't have this token!"
        //);
        //msg.sender.transfer(_amount);
        //IERC20(_token).approve(address(this), _amount);

        if (_token == mscTokenAddress) {
            mscToken.transferFrom(msg.sender, address(this), _amount); // this 'msg.sender' must be owner of MSCToken, not third party address
            //mscToken.transfer(address(this), _amount); // transfer(toAddress, amount);  sender(who call this func(this contact)) sends amount of token to toAddress
        } else {
            //IERC20(_token).transferFrom(msg.sender, address(this), _amount); // this function is avaiable only when owner of the token who gived the right this contract to handle allowance with approve function gives token to users.
            IERC20(_token).transferFrom(msg.sender, address(this), _amount); // you can't use transferFrom when user send token to this contract.
        }
        wagerOfPlayer[_token][msg.sender] =
            wagerOfPlayer[_token][msg.sender] +
            _amount;
        if (players[_token].length <= 0) {
            totalPot[_token] = _amount;
        } else {
            totalPot[_token] = totalPot[_token] + _amount;
        }
        players[_token].push(msg.sender);
        playersCardNumber[_token][msg.sender] = 0;
        //playerCounter += 1;
    }

    function drawCards(address _token) public {
        game_state = GAME_STATE.CALCULATING_WINNER;
        tokenToRandomness = _token;

        bytes32 requestId = requestRandomness(keyHash, fee);
        emit RequestedRandomness(requestId);

        //for (uint256 i = 0; i < players[competedToken].length; i++) {
        //bytes32 requestId = requestRandomness(keyHash, fee); // let fulfillRandomness do
        //emit RequestedRandomness(requestId);
        //playerCounter += 1;
        //}
        //bytes32 requestId = requestRandomness(keyHash, fee);
        //playerCounter = 0;
    }

    // Don't use 'msg.sender' in fulfillRandomness, cause user of this function is contract
    function fulfillRandomness(bytes32 _requestId, uint256 _randomness)
        internal
        override
    {
        require(
            game_state == GAME_STATE.CALCULATING_WINNER,
            "You aren't there yet!"
        );
        require(_randomness > 0, "random-not-found");
        randomness = _randomness;
        uint256 cardNumber = _randomness % 14;
        if (cardNumber == 0) {
            cardNumber = 1;
        }
        address player = players[tokenToRandomness][
            playerCounter[tokenToRandomness]
        ];
        playersCardNumber[tokenToRandomness][player] = cardNumber;
        cardNumbers[tokenToRandomness].push(cardNumber);
        playerCounter[tokenToRandomness] += 1;
        //address player = players[competedToken][playerCounter];
        //playersCardNumber[player] = cardNumber;
    }

    function getWinner(address _token) public onlyOwner returns (address) {
        require(
            game_state == GAME_STATE.CALCULATING_WINNER,
            "Game is not over yet!"
        );
        require(
            competedToken == address(0),
            "Before game is not over yet, owner have to pay reward to winner!"
        );
        require(
            playerIsAllowed(_token),
            "All participants needs to draw a card!"
        );

        //for (uint256 i = 0; i < players[competedToken].length; i++) {
        //uint256 cardNumber = playersCardNumber[players[competedToken][i]];
        //cardsNumber.push(cardNumber);
        //}
        uint256 max = 0;

        for (uint256 c = 0; c < cardNumbers[_token].length; c++) {
            if (cardNumbers[_token][c] > max) {
                max = cardNumbers[_token][c];
                winner[_token] = players[_token][c];
            } else if (cardNumbers[_token][c] == max) {
                uint256 judge = max % 2;
                if (judge == 0) {
                    winner[_token] = players[_token][c];
                } else if (judge == 1) {
                    continue;
                }
            }
        }
        competedToken = _token;
        return winner[_token];
    }

    function endGame() public onlyOwner {
        require(
            game_state == GAME_STATE.CALCULATING_WINNER,
            "You aren't there yet!"
        );
        require(tokenIsAllowed(competedToken), "This token is not allowed");
        require(
            winner[competedToken] != address(0),
            "Still doesn't know which player is winner"
        );
        //IERC20(_token).transfer(msg.sender, totalPot);
        IERC20(competedToken).transferFrom(
            msg.sender,
            winner[competedToken],
            totalPot[competedToken]
        ); // You can use transferFrom only when you sends tokens to user. It's impossibel the reverse
        totalPot[competedToken] = 0;
        //players = new address[];
        for (
            uint256 index = 0;
            index < players[competedToken].length;
            index++
        ) {
            address player = players[competedToken][index];
            wagerOfPlayer[competedToken][player] = 0;
            playersCardNumber[competedToken][player] = 0;
        }
        tokenToRandomness = address(0);
        playerCounter[competedToken] = 0;
        players[competedToken] = new address[](0);
        cardNumbers[competedToken] = new uint256[](0);
        winner[competedToken] = address(0);
        competedToken = address(0);
        game_state = GAME_STATE.CLOSED;
    }
}
