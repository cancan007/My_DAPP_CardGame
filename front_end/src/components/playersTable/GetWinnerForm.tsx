import { Token } from "../Main"
import { useOwnerFunctions, useVariablesContracts } from "../../hooks";
import { Button, Input, CircularProgress, Snackbar } from "@material-ui/core";

interface GetWinnerFormProps {
    token: Token
}

export const GetWinnerForm = ({ token }: GetWinnerFormProps) => {
    const { image, address: tokenAddress, name } = token
    const { gameState } = useVariablesContracts()
    const { getWinner, getWinnerState } = useOwnerFunctions(tokenAddress)

    const flag = gameState === 0 || 1
    const dflag = gameState === 1
    const isMining = getWinnerState.status === "Mining"

    return (
        <>
            <div>
                {flag ? <Button disabled={dflag} color="primary" onClick={getWinner}>{isMining ? <CircularProgress size={26} /> : "Calculate Winner!"}</Button> : <Button color="secondary" disabled={true}>Calculating winner...</Button>}
            </div>
        </>
    )
}