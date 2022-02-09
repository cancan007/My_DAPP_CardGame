import { Token } from "../Main"
import { Box, Tab, makeStyles } from "@material-ui/core"
import { TabContext, TabList, TabPanel } from "@material-ui/lab"
import React, { useState } from "react"
import { YourBetBalance } from "./YourBetBalance"
import { RefundForm } from "./RefundForm"

interface BetWalletProps {
    supportedTokens: Array<Token>
}

const useStyles = makeStyles((theme) => ({
    tabContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: theme.spacing(4)
    },
    box: {
        backgroundColor: "white",
        borderRadius: "25px"
    },
    header: {
        color: "white"
    }
}))


export const BetWallet = ({ supportedTokens }: BetWalletProps) => {
    const classes = useStyles()

    const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setSelectedTokenIndex(parseInt(newValue))
    }

    return (<Box>
        <h1 className={classes.header}>Your bet tokens</h1>
        <Box className={classes.box}>
            <Box>
                <TabContext value={selectedTokenIndex.toString()}>
                    <TabList onChange={handleChange} aria-label="bet token tabs">
                        {supportedTokens.map((token, index) => {
                            return (<Tab label={token.name} value={index.toString()} key={index} />)
                        })}
                    </TabList>
                    {supportedTokens.map((token, index) => {
                        return (<TabPanel value={index.toString()} key={index}>
                            <div className={classes.tabContent}>
                                <YourBetBalance token={supportedTokens[selectedTokenIndex]} />
                                <RefundForm token={supportedTokens[selectedTokenIndex]} />
                            </div>
                        </TabPanel>)
                    })}
                </TabContext>
            </Box>
        </Box>
    </Box>)
}