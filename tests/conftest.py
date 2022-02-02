import pytest
from web3 import Web3

@pytest.fixture  # @pytest.fixture: it can be used as a database of some objects of a certain class and behavior static variable
def amount_staked():
    return Web3.toWei(1, 'ether')