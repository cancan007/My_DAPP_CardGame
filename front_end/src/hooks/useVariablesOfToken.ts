import { useEthers, useContractFunction, TransactionStatus, useContractCall } from '@usedapp/core'
import CardGame from "../chain-info/contracts/CardGame.json"
import ERC20 from "../chain-info/contracts/MockERC20.json"  // why Mock? I think IERC20 is useful. : Maybe, we needs justs the function, so if the the token name is different, it doesn't matter
import networkMapping from "../chain-info/deployments/map.json"
import { constants, utils } from "ethers"
import { Contract } from "@ethersproject/contracts"
import React, { useState, useEffect } from "react"


export const useVariablesOfToken = (tokenAddress: string) => {
    const { account, chainId } = useEthers()
    const { abi } = CardGame
    const cardGameAddress = chainId ? networkMapping[String(chainId)]["CardGame"][0] : constants.AddressZero
    const cardGameInterface = new utils.Interface(abi)
    const cardGameContract = new Contract(cardGameAddress, cardGameInterface)

    const [wagerOfPlayer] = useContractCall({
        abi: cardGameInterface,
        address: cardGameAddress,
        method: "wagerOfPlayer",
        args: [tokenAddress, account]
    }) ?? []

    return { wagerOfPlayer }
}