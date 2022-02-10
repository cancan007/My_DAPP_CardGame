import { useEthers, useContractFunction, TransactionStatus } from '@usedapp/core'
import CardGame from "../chain-info/contracts/CardGame.json"
import ERC20 from "../chain-info/contracts/MockERC20.json"  // why Mock? I think IERC20 is useful. : Maybe, we needs justs the function, so if the the token name is different, it doesn't matter
import networkMapping from "../chain-info/deployments/map.json"
import { constants, utils } from "ethers"
import { Contract } from "@ethersproject/contracts"
import React, { useState, useEffect } from "react"

export const useOwnerFunctions = (tokenAddress: string) => {
    const { chainId } = useEthers()
    const { abi } = CardGame
    const cardGameAddress = chainId ? networkMapping[String(chainId)]["CardGame"][0] : constants.AddressZero
    const cardGameInterface = new utils.Interface(abi)
    const cardGameContract = new Contract(cardGameAddress, cardGameInterface)

    const { send: drawCardsSend, state: drawCardsState } =
        useContractFunction(cardGameContract, "drawCards", {
            transactionName: "Draw cards"
        })

    const drawCards = () => {
        return drawCardsSend(tokenAddress)
    }

    const { send: getWinnerSend, state: getWinnerState } =
        useContractFunction(cardGameContract, "getWinner", {
            transactionName: "Caliculate Winner"
        })

    const getWinner = () => {
        return getWinnerSend()
    }

    const { send: endGameSend, state: endGameState } =
        useContractFunction(cardGameContract, "endgame", {
            transactionName: "End Game"
        })

    const endGame = () => {
        return endGameSend()
    }

    const [state, setState] = useState<string>("")

    useEffect(() => {
        if (drawCardsState.status === "Success") {
            setState(getWinnerState.status)
        } else {
            setState(drawCardsState.status)
        }
    }, [drawCardsState, getWinnerState])

    return ({ drawCards, getWinner, endGame, state, endGameState })
}