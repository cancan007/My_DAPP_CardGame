import { useEthers, useContractFunction, TransactionStatus } from '@usedapp/core'
import CardGame from "../chain-info/contracts/CardGame.json"
import ERC20 from "../chain-info/contracts/MockERC20.json"  // why Mock? I think IERC20 is useful. : Maybe, we needs justs the function, so if the the token name is different, it doesn't matter
import networkMapping from "../chain-info/deployments/map.json"
import { constants, utils } from "ethers"
import { Contract } from "@ethersproject/contracts"
import React, { useState, useEffect } from "react"


export type Tx = {
    send: Promise<void>,
    state: TransactionStatus
}


export const useBetTokens = (tokenAddress: string) => {
    // approve : (needed address, abi and chainId)
    const { chainId } = useEthers()
    const { abi } = CardGame
    const cardGameAddress = chainId ? networkMapping[String(chainId)]["CardGame"][0] : constants.AddressZero
    const cardGameInterface = new utils.Interface(abi)
    const cardGameContract = new Contract(cardGameAddress, cardGameInterface)

    const erc20ABI = ERC20.abi  // or {abi} = ERC20
    const erc20Interface = new utils.Interface(erc20ABI)
    const erc20Contract = new Contract(tokenAddress, erc20Interface)

    const { send: startSend, state: startState } =
        useContractFunction(cardGameContract, "startGame", {
            transactionName: "Start Game!"
        })

    const start = () => {
        return startSend()
    }

    const { send: approveErc20Send, state: approveErc20State } =
        useContractFunction(erc20Contract, "approve", {
            transactionName: "Approve ERC20 transfer"
        })

    const approve = (amount: string) => {
        setAmountToBet(amount)
        return approveErc20Send(cardGameAddress, amount)
    }

    const { send: betSend, state: betState } = useContractFunction(cardGameContract, "betMoney", {
        transactionName: "Bet ERC20 transfer"
    })

    const [amountToBet, setAmountToBet] = useState("0")

    //useEffect
    useEffect(() => {
        if (approveErc20State.status === "Success") {
            // bet func
            betSend(amountToBet, tokenAddress)
        }
    }, [approveErc20State])



    return { start, startState, approve, approveErc20State }
}