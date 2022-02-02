from scripts.helpful_scripts import get_account, get_contract
from brownie import MSCToken, CardGame, network, config
from web3 import Web3

KEPT_BALANCE = Web3.toWei(100, "ether")


def deploy_card_game_and_msc_token():
    account = get_account()
    msc_token = MSCToken.deploy({'from':account})
    card_game = CardGame.deploy(
        get_contract("vrf_coordinator").address,
        get_contract("link_token").address,
        config["networks"][network.show_active()]["fee"],
        config["networks"][network.show_active()]["keyhash"],
        msc_token.address,
        {'from':account},
        publish_source = config["networks"][network.show_active()].get("verify", False)
        )
    tx = msc_token.transfer(card_game.address, msc_token.totalSupply() - KEPT_BALANCE, {"from":account}) # card_game gets 999900MSCToken(decimals: 18)
    tx.wait(1)
    # msc_token, weth_token, fau_token(fau pretends to be DAI token)
    weth_token = get_contract("weth_token")
    fau_token = get_contract("fau_token")
    dict_of_allowed_tokens = {
        msc_token: get_contract("dai_usd_price_feed"), #dai
        fau_token: get_contract("dai_usd_price_feed"), #dai
        weth_token: get_contract("eth_usd_price_feed") #eth
    }
    add_allowed_tokens(card_game, dict_of_allowed_tokens,account)
    return card_game, msc_token

def add_allowed_tokens(card_game, dict_of_allowed_tokens, account):
    for token in dict_of_allowed_tokens:
        add_tx = card_game.allowToken(token.address, {'from':account})
        add_tx.wait(1)
        set_tx = card_game.setPriceFeedContract(token.address, dict_of_allowed_tokens[token], {"from":account})
        set_tx.wait(1)
    return card_game
def main():
    deploy_card_game_and_msc_token()
