import { Token } from "../Main"
import { useOwnerFunctions, useVariablesContracts } from "../../hooks";
import { Button, Input, CircularProgress, Snackbar } from "@material-ui/core"

interface DrawCardsFormProps {
    token: Token
}

export const DrawCardsForm = ({ token }: DrawCardsFormProps) => {
    const { image, address: tokenAddress, name } = token
    const { gameState } = useVariablesContracts()
    const { drawCards, getWinner, state } = useOwnerFunctions(tokenAddress)

    const calculateWinner = () => {
        drawCards()
        return getWinner()
    }
    const flag = gameState === 0 || 1
    const dflag = gameState === 1
    const isMining = state === "Mining"

    return (
        <>
            <div>
                {flag ? <Button disabled={dflag} color="primary" onClick={calculateWinner}>{isMining ? <CircularProgress size={26} /> : "Draw cards!"}</Button> : <Button color="secondary" disabled={true}>Calculating winner...</Button>}
            </div>
        </>
    )
}