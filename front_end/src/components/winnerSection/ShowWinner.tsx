import { Token } from "../Main"
import { useEthers, useTokenBalance } from "@usedapp/core"
import { formatUnits } from "@ethersproject/units"
import { BalanceMsg } from "../BalanceMsg"
import { useVariablesContracts, useVariablesOfToken } from "../../hooks"
import { makeStyles } from "@material-ui/core"

interface ShowWinnerProps {
    token: Token
}



export const ShowWinner = ({ token }: ShowWinnerProps) => {
    const { image, address: tokenAddress, name } = token
    const { competedToken } = useVariablesContracts()
    const { totalPot, winner } = useVariablesOfToken(tokenAddress)
    const formattedTokenBalance: number = totalPot ? parseFloat(formatUnits(totalPot, 18)) : 0
    const flag = competedToken === tokenAddress


    if (flag) {
        return (<BalanceMsg
            label={`${winner} gets total ${name} pots`}
            tokenImgSrc={image}
            amount={formattedTokenBalance} />)
    }
    else {
        return (
            <BalanceMsg
                label={`No winner`}
                tokenImgSrc={image}
                amount={0} />)
    }

}