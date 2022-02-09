import { Token } from "../Main"
import { useEthers, useTokenBalance } from "@usedapp/core"
import { formatUnits } from "@ethersproject/units"
import { BalanceMsg } from "../BalanceMsg"
import { useVariablesOfToken } from "../../hooks"

interface YourBetBalanceProps {
    token: Token
}

export const YourBetBalance = ({ token }: YourBetBalanceProps) => {
    const { image, address: tokenAddress, name } = token
    const { account } = useEthers()
    const { wagerOfPlayer } = useVariablesOfToken(tokenAddress)
    const formattedBetBalance = wagerOfPlayer ? parseFloat(formatUnits(wagerOfPlayer, 18)) : 0
    console.log(formattedBetBalance.toString())

    return (<BalanceMsg label={`Your bet ${name} balance`} tokenImgSrc={image} amount={formattedBetBalance} />)
}