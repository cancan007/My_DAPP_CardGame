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


    //const players = new Array()

    const [players] = useContractCall({
        abi: cardGameInterface,
        address: cardGameAddress,
        method: "players",
        args: [tokenAddress, 0]
    }) ?? []


    const [cards] = useContractCall({
        abi: cardGameInterface,
        address: cardGameAddress,
        method: "playersCardNumber",
        args: [tokenAddress, players]
    }) ?? []
    /*
    async function useGetPlayers() {
        const [pl1] = await useContractCall({
            abi: cardGameInterface,
            address: cardGameAddress,
            method: "players",
            args: [tokenAddress, 0]
        }) ?? []

        const [pl2] = await useContractCall({
            abi: cardGameInterface,
            address: cardGameAddress,
            method: "players",
            args: [tokenAddress, 1]
        }) ?? []

        const [pl3] = await useContractCall({
            abi: cardGameInterface,
            address: cardGameAddress,
            method: "players",
            args: [tokenAddress, 2]
        }) ?? []

        const [pl4] = await useContractCall({
            abi: cardGameInterface,
            address: cardGameAddress,
            method: "players",
            args: [tokenAddress, 3]
        }) ?? []

        const players = [pl1, pl2, pl3, pl4];

        return players;
    } */

    //const players = pl1;
    /*
    async function useGetCards() {
        const players = useGetPlayers();
        const [c1] = await useContractCall({
            abi: cardGameInterface,
            address: cardGameAddress,
            method: "playersCardNumber",
            args: [tokenAddress, pl1]
        }) ?? []

        const [c2] = await useContractCall({
            abi: cardGameInterface,
            address: cardGameAddress,
            method: "playersCardNumber",
            args: [tokenAddress, pl2]
        }) ?? []

        const [c3] = await useContractCall({
            abi: cardGameInterface,
            address: cardGameAddress,
            method: "playersCardNumber",
            args: [tokenAddress, pl3]
        }) ?? []

        const [c4] = await useContractCall({
            abi: cardGameInterface,
            address: cardGameAddress,
            method: "playersCardNumber",
            args: [tokenAddress, pl4]
        }) ?? []

        const cards = [c1, c2, c3, c4];

        return cards;
    } */

    const [totalPot] = useContractCall({
        abi: cardGameInterface,
        address: cardGameAddress,
        method: "totalPot",
        args: [tokenAddress]
    }) ?? []

    const [winner] = useContractCall({
        abi: cardGameInterface,
        address: cardGameAddress,
        method: "winner",
        args: [tokenAddress]
    }) ?? []

    return { wagerOfPlayer, players, totalPot, winner }
}