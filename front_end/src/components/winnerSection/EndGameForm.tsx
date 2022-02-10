import { Token } from "../Main"
import { useOwnerFunctions, useVariablesContracts } from "../../hooks";
import { Button, Input, CircularProgress, Snackbar } from "@material-ui/core"

interface EndGameProps {
    token: Token
}

export const EndGameForm = ({ token }: EndGameProps) => {
    const { image, address: tokenAddress, name } = token
    const { endGame, endGameState } = useOwnerFunctions(tokenAddress)
    const { gameState, winner } = useVariablesContracts()
    const flag = gameState === 2
    const isMining = endGameState.status === "Mining"

    return (
        <>
            <div>
                {flag ? <Button onClick={endGame}>{isMining ? <CircularProgress size={26} /> : "Pay reward"}</Button> : <></>}
            </div>
        </>
    )
}