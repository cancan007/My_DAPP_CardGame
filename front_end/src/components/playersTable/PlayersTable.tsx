import { Token } from "../Main"
import { Box, Tab, makeStyles } from "@material-ui/core"
import { TabContext, TabList, TabPanel } from "@material-ui/lab"
import React, { useState } from "react"
import { ShowPlayers } from "./ShowPlayers"

interface PlayersTableProps {
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



export const PlayersTable = ({ supportedTokens }: PlayersTableProps) => {
    const classes = useStyles()
    const [selecetdTokenIndex, setSelectedTokenIndex] = useState<number>(0)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setSelectedTokenIndex(parseInt(newValue))
    }

    return (
        <Box>
            <h1 className={classes.header}>Players</h1>
            <Box className={classes.box}>
                <TabContext value={selecetdTokenIndex.toString()}>
                    <TabList onChange={handleChange} aria-label="player table tabs">
                        {supportedTokens.map((token, index) => {
                            return (<Tab label={token.name} value={index.toString()} key={index} />)
                        })}
                    </TabList>
                    {supportedTokens.map((token, index) => {
                        return (
                            <TabPanel value={index.toString()} key={index}>
                                <div className={classes.tabContent}>
                                    <ShowPlayers token={supportedTokens[selecetdTokenIndex]} />
                                </div>
                            </TabPanel>)
                    })}
                </TabContext>
            </Box>
        </Box>
    )
}