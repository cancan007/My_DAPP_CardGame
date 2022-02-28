import { Token } from "../Main"
import { useOwnerFunctions, useVariablesContracts } from "../../hooks";
import { Button, Input, CircularProgress, Snackbar } from "@material-ui/core"

interface DrawCardsFormProps {
    token: Token
}

export const DrawCardsForm = ({ token }: DrawCardsFormProps) => {
    const { image, address: tokenAddress, name } = token
    const { gameState } = useVariablesContracts()
    const { drawCards, drawCardsState } = useOwnerFunctions(tokenAddress)

    const calculateWinner = () => {
        return drawCards()
    }
    const flag = gameState === 0 || 1
    const dflag = gameState === 1
    const isMining = drawCardsState.status === "Mining"

    return (
        <>
            <div>
                {flag ? <Button color="primary" disabled={dflag} onClick={calculateWinner}>{isMining ? <CircularProgress size={26} /> : "Draw cards!"}</Button> : <Button color="secondary" disabled={true}>Calculating winner...</Button>}
            </div>
        </>
    )
}