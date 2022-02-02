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
    address[] public players;
    address[] public allowedTokens;
    uint256 public totalPot = 0;
    // player address > card number
    mapping(address => uint256) public playersCardNumber;
    uint256 public playerCounter = 0;
    uint256[] public cardsNumber;
    address public winner = address(0); // you can't use 'null' in solidity

    //function showMSCTokenAddress() public returns (address) {
    //return mscTokenAddress;
    //}

    function sendMSCToken(uint256 _amount) public onlyOwner {
        mscToken.transfer(msg.sender, _amount); // from contract_address to owner_address
    }

    function issueTokens(address _token) public onlyOwner {
        for (uint256 index = 0; index < players.length; index++) {
            address recipient = players[index];
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
            players.length < 5,
            "Sorry, this game is already full. Please wait next game."
        );
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
        players.push(msg.sender);
        totalPot = totalPot + _amount;
    }

    function drawCards() public onlyOwner {
        game_state = GAME_STATE.CALCULATING_WINNER;

        for (uint256 i; i < players.length; i++) {
            bytes32 requestId = requestRandomness(keyHash, fee); // let fulfillRandomness do
            emit RequestedRandomness(requestId);
            playerCounter += 1;
        }
        //bytes32 requestId = requestRandomness(keyHash, fee);
        playerCounter = 0;
        game_state = GAME_STATE.CLOSED;
    }

    function fulfillRandomness(bytes32 _requestId, uint256 _randomness)
        internal
        override
    {
        require(
            game_state == GAME_STATE.CALCULATING_WINNER,
            "You aren't there yet!"
        );
        require(_randomness > 0, "random-not-found");
        uint256 cardNumber = _randomness % 14;
        address player = players[playerCounter];
        playersCardNumber[player] = cardNumber;
    }

    function getWinner() public onlyOwner returns (address) {
        require(game_state == GAME_STATE.CLOSED, "Game is not over yet!");

        for (uint256 i = 0; i < players.length; i++) {
            uint256 cardNumber = playersCardNumber[players[i]];
            cardsNumber.push(cardNumber);
        }
        uint256 max = 0;

        for (uint256 c = 0; c < cardsNumber.length; c++) {
            if (cardsNumber[c] > max) {
                max = cardsNumber[c];
                winner = players[c];
            } else if (cardsNumber[c] == max) {
                uint256 judge = max % 2;
                if (judge == 0) {
                    winner = players[c];
                } else if (judge == 1) {
                    continue;
                }
            }
        }
        return winner;
    }

    function endGame(address _token) public onlyOwner {
        require(game_state == GAME_STATE.CLOSED, "You aren't there yet!");
        require(tokenIsAllowed(_token), "This token is not allowed");
        require(
            winner != address(0),
            "Still doesn't know which player is winner"
        );
        //IERC20(_token).transfer(msg.sender, totalPot);
        IERC20(_token).transferFrom(msg.sender, winner, totalPot); // You can use transferFrom only when you sends tokens to user. It's impossibel the reverse
        totalPot = 0;
        //players = new address[];
        for (uint256 index = 0; index < players.length; index++) {
            address player = players[index];
            wagerOfPlayer[_token][player] = 0;
            playersCardNumber[player] = 0;
        }
        players = new address[](0);
        cardsNumber = new uint256[](0);
        winner = address(0);
    }
}