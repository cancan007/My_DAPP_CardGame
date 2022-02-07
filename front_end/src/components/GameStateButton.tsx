import { useStart, useVariablesContracts } from "../hooks";
import { Button } from "@material-ui/core"


const testValue = (value: any) => {
    console.log(value)
}

export const GameStateButton = () => {
    const { gameState } = useVariablesContracts()
    const { start, startState } = useStart()

    if (gameState == 0) {
        return (<Button>OPEN</Button>)
    }
    else if (gameState == 1) {
        return (<Button onClick={start}>CLOSED</Button>)
    }
    else if (gameState == 2) {
        return (<Button>CALCULATING_WINNER</Button>)
    }
    else { return (<Button>{gameState}</Button>) }
}