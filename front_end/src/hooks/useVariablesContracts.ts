import { useEthers, useContractFunction, TransactionStatus, useContractCall } from '@usedapp/core'
import CardGame from "../chain-info/contracts/CardGame.json"
import ERC20 from "../chain-info/contracts/MockERC20.json"  // why Mock? I think IERC20 is useful. : Maybe, we needs justs the function, so if the the token name is different, it doesn't matter
import networkMapping from "../chain-info/deployments/map.json"
import { constants, utils } from "ethers"
import { Contract } from "@ethersproject/contracts"
import React, { useState, useEffect } from "react"


export const useVariablesContracts = () => {
    const { account, chainId } = useEthers()
    const { abi } = CardGame
    const cardGameAddress = chainId ? networkMapping[String(chainId)]["CardGame"][0] : constants.AddressZero
    const cardGameInterface = new utils.Interface(abi)
    const cardGameContract = new Contract(cardGameAddress, cardGameInterface)

    //const erc20ABI = ERC20.abi  // or {abi} = ERC20
    //const erc20Interface = new utils.Interface(erc20ABI)
    //const erc20Contract = new Contract(tokenAddress, erc20Interface)

    const call = {
        //contract: cardGameContract,
        abi: cardGameInterface,
        address: cardGameAddress,
        method: "game_state",
        args: [account]
    }

    const [gameState] = useContractCall({
        abi: cardGameInterface,
        address: cardGameAddress,
        method: "game_state",
        args: []
    }) ?? []  // useContractCall is not valid, you gets empty list

    //const { gameState } = useContractFunction(cardGameContract, "game_state", {
    //transactionName: "View GAME_STATE"
    //})

    return { gameState }
}