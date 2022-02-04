import { useEthers } from "@usedapp/core"
import { Button, makeStyles } from "@material-ui/core"
import { useVariablesContracts } from "../hooks"
import { constants } from "ethers"
import React, { useState } from "react"


const useStyles = makeStyles((theme) => ({
    container: {
        padding: theme.spacing(4),
        display: "flex",
        justifyContent: "flex-end",
        gap: theme.spacing(1)
    }
}))

export const Header = () => {
    const classes = useStyles()
    const { account, activateBrowserWallet, deactivate } = useEthers()

    const isConnected = account !== undefined  // if account is undefined, it's connected.

    //const [tokenAddress, setTokenAddress] = useState(constants.AddressZero)

    const { gameState, gameStateError } = useVariablesContracts()


    return (
        <div className={classes.container}>
            <div>
                {isConnected ? ( // isConnected is true, it appear
                    <Button color="primary" variant="contained" onClick={() => deactivate()}>
                        Disconnect
                    </Button>) : (  // isConnected is false, it appear
                    <Button color="primary" variant="contained" onClick={activateBrowserWallet}>
                        Connect
                    </Button>
                )}
            </div>
            <div>
                {gameState}
            </div>
        </div>
    )
}