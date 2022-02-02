from scripts.helpful_scripts import LOCAL_BLOCKCHAIN_ENVIRONMENTS, get_account, get_contract, INITIAL_PRICE_FEED_VALUE, fund_with_link
from brownie import network, exceptions
import pytest
from scripts.deploy import deploy_card_game_and_msc_token


def test_set_price_feed_contract():
    #Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip('Only for local testing!')
    account = get_account()
    non_owner = get_account(index=1)
    card_game, msc_token = deploy_card_game_and_msc_token()
    #Act
    card_game.setPriceFeedContract(msc_token.address, get_contract("dai_usd_price_feed"), {"from":account})
    #Assert
    price_feed_address = get_contract('dai_usd_price_feed')
    assert card_game.tokenPriceFeeds(msc_token.address) == price_feed_address
    with pytest.raises(exceptions.VirtualMachineError):  # try to work onlyOwner function
        card_game.setPriceFeedContract(msc_token.address, price_feed_address, {'from':non_owner})


def test_bet_money(amount_staked):
    #Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip('Only for local testing!')
    account = get_account()
    p1 = get_account(index=1)
    p2 = get_account(index=2)
    p3 = get_account(index=3)
    p4 = get_account(index=4)
    card_game, msc_token = deploy_card_game_and_msc_token()
    #Act
    # https://blog.smartdec.net/erc20-approve-issue-in-simple-words-a41aaf47bca6
    owner_balance = msc_token.balanceOf(account.address) #100 * amount_staked
    print(f"owner_balance_before:{owner_balance}")
    card_game_msc_balance = msc_token.balanceOf(card_game.address) #999900 * amount_staked
    print(f"card_game_msc_balance_before:{card_game_msc_balance}")
    msc_token.approve(card_game.address, amount_staked*20, {'from':account})  #it gives the right spender to use approvedvalue on your behalf(instead of who deploy MSCToken).: approve(spender, allowance)
    allowance = msc_token.allowance(account.address, card_game.address) # get allowance of card_game which my account give
    print(f"card_game_msc_allowance_before:{allowance}")
    msc_token.approve(p2.address, amount_staked*5, {'from':account}) # p2 has just the right to handle amount_staked*2 value of MSCToken of account, not actual tokens
    p2_allowance = msc_token.allowance(account.address, p2.address)
    print(f"p2_msc_allowance_before:{p2_allowance}")
    msc_token.transferFrom(account.address, p2.address, amount_staked*3, {'from':card_game})  #transferFrom(fromAddress, toAddress, value).  Before use this, you have to use approve function and give the right third party(card_game.address) to use yourtoken on your behalf(who deploy MSCToken). The third party can be called transferFrom function till the allowance
    msc_token.transfer(p2.address, amount_staked, {'from':account}) # msg.sender sends the amount to p2.address
    msc_token.transferFrom(account.address, p2.address, amount_staked*4,{'from':p2}) # ps can call this func as third party, cause p2 was approved
    msc_token.transfer(card_game.address, amount_staked, {'from':p2})
    #card_game.sendMSCToken(amount_staked, {'from':account})
    p2_balance_before = msc_token.balanceOf(p2.address)
    print(f"p2_msc_balance_before:{p2_balance_before}")
    card_game.startGame({'from':account})
    card_game.betMoney(amount_staked*0.9, msc_token.address, {'from':account})
    owner_after_balance = msc_token.balanceOf(account.address)
    print(f"owner_balance_after:{owner_after_balance}")
    card_game_balance_after = msc_token.balanceOf(card_game.address)
    
    
    #card_game.betMoney(amount_staked*0.3, msc_token.address, {'from':p1})
    #print(amount_staked)
    msc_token.approve(card_game.address, msc_token.balanceOf(p2.address), {'from':p2.address})  # Basically, if user have to give the right(approve) this contract to join.(transferFrom require it)
    card_game.betMoney(amount_staked*0.6, msc_token.address, {'from':p2})
    p2_after_balance = msc_token.balanceOf(p2.address)
    print(f"p2_balance_after:{p2_after_balance}")
    card_game_total_balance = msc_token.balanceOf(card_game.address)
    print(f"card_game_total_balance:{card_game_total_balance}")
    #card_game.betMoney(amount_staked*0.9, msc_token.address, {'from':p3})
    #Assert
    assert card_game.wagerOfPlayer(msc_token.address, account.address) == 0.9*amount_staked  #success
    #assert card_game.wagerOfPlayer(msc_token.address, p1.address) == amount_staked*0.3
    assert card_game.wagerOfPlayer(msc_token.address, p2.address) == amount_staked*0.6
    #assert card_game.wagerOfPlayer(msc_token.address, p3.address) == amount_staked*0.9
    assert card_game.players(0) == account.address
    assert card_game.players(1) == p2.address
    a_c_allowance = msc_token.allowance(account.address, card_game.address)
    n = 16100000000000000000 #(20 - 3 - 0.9) * amount_staked
    assert a_c_allowance == n  # the rest amount of MSCToken owner which card_game can handle 
    t = 6.4*amount_staked  #(7 - 0.6)*amount_staked
    assert msc_token.allowance(p2.address, card_game.address) == t
    #assert msc_token.balanceOf(card_game.address) == (1 + 0.6)*amount_staked # acutual amount of token which card_game has
    m = 6.4 * amount_staked  # (3 + 1 + 4 -1 - 0.6)*amount_staked
    assert msc_token.balanceOf(p2.address) == m
    return card_game, msc_token
    

def test_issue_tokens(amount_staked):
    #Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip('Only for local testing!')
    account = get_account()
    p2 = get_account(index=2)
    card_game, msc_token = test_bet_money(amount_staked)
    starting_balance = msc_token.balanceOf(account.address)  # This value was given when you deploy MSCToken.(_mint)
    print(""*30)
    print(f"owner_balance_before:{starting_balance}")
    p2_starting_balance = msc_token.balanceOf(p2.address)
    print(f"p2_balance_before:{p2_starting_balance}")
    
    #Act
    card_game.issueTokens(msc_token.address ,{'from':account})
    print(f"owner_balance_after:{msc_token.balanceOf(account.address)}")
    print(f"p2_balance_after:{msc_token.balanceOf(p2.address)}")
    #Assert
    # we are betting 1 msc_token == in price to 1 ETH
    # so we should get 2,000 msc_tokens in reward (deploy_mock(INITIAL_PRICE_FEED_VALUE=2000))
    # since the price of eth is $2,000
    assert msc_token.balanceOf(account.address) == starting_balance + 0.9*INITIAL_PRICE_FEED_VALUE
    assert msc_token.balanceOf(p2.address) == p2_starting_balance + 0.6*INITIAL_PRICE_FEED_VALUE
    return card_game, msc_token

def test_get_winner(amount_staked):
    #Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip('Only for local testing!')
    account = get_account()
    p2 = get_account(index=2)
    card_game, msc_token = test_issue_tokens(amount_staked)
    fund_with_link(card_game)  # you have to pay to get the right to use requestRandomness in other server
    tx = card_game.drawCards({'from':account})
    tx.wait(1)
    print(f"owner_card_number:{card_game.playersCardNumber(account.address)}")
    print(f"p2_card_number:{card_game.playersCardNumber(p2.address)}")
    print(f"Winner_before:{card_game.winner()}")
    winner = card_game.getWinner({'from':account})  # this returns transaction, not winner address
    print(f"Winner_after:{card_game.winner()}")
    assert card_game.winner() == p2.address
    total = card_game.totalPot()
    print(f"{total}")
    p2_balance_before = msc_token.balanceOf(p2.address)
    print(f"p2_balance_before:{p2_balance_before}")
    card_game.endGame(msc_token.address,{'from':account})
    p2_balance_after = msc_token.balanceOf(p2.address)
    print(f"p2_balance_after:{p2_balance_after}")
    assert p2_balance_after == p2_balance_before + total
