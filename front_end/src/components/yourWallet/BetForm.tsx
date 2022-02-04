import { Token } from "../Main"
import { useEthers, useTokenBalance } from "@usedapp/core"
import { formatUnits } from "@ethersproject/units"
import { Button, Input } from "@material-ui/core"
import React, { useState } from 'react'
import { useBetTokens } from "../../hooks"
import { utils } from "ethers"

interface BetFormProps {
    token: Token
}

export const BetForm = ({ token }: BetFormProps) => {
    const { address: tokenAddress, name } = token  // use address as tokenAddress
    const { account } = useEthers()
    const tokenBalance = useTokenBalance(tokenAddress, account)
    const formattedTokenBalance: number = tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)) : 0

    const [amount, setAmount] = useState<number | string | Array<number | string>>(0)
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = event.target.value === "" ? "" : Number(event.target.value)
        setAmount(newAmount)
        console.log(newAmount)
    }

    const { approveSetBet, approveErc20State } = useBetTokens(tokenAddress)
    const handleBetSubmit = () => {
        const amountAsWei = utils.parseEther(amount.toString())
        return approveSetBet(amountAsWei.toString())
    }

    return (
        <>
            <Input
                onChange={handleInputChange}></Input>
            <Button color='primary' size="large" onClick={handleBetSubmit}>Bet!!</Button>
        </>
    )
}