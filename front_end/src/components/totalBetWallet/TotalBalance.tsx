import { Token } from "../Main"
import { useEthers, useTokenBalance } from "@usedapp/core"
import { formatUnits } from "@ethersproject/units"
import { BalanceMsg } from "../BalanceMsg"
import { useVariablesOfToken } from "../../hooks"

interface TotalBalanceProps {
    token: Token
}

export const TotalBalance = ({ token }: TotalBalanceProps) => {
    const { image, address, name } = token
    const { account } = useEthers()
    const { totalPot } = useVariablesOfToken(address)
    const formattedTokenBalance: number = totalPot ? parseFloat(formatUnits(totalPot, 18)) : 0

    return (
        <BalanceMsg label={`Total ${name} bet balance`}
            tokenImgSrc={image}
            amount={formattedTokenBalance} />
    )
}