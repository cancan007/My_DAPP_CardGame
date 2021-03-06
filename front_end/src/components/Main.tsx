/* eslint-disable spaced-comment */
/// <reference types="react-scripts"/>
import { useEthers } from "@usedapp/core"
import helperConfig from "../helper-config.json"
import networkMapping from "../chain-info/deployments/map.json"
import { constants } from "ethers"
import brownieConfig from "../brownie-config.json"
import msc from "../msc.png"
import eth from "../eth.png"
import dai from "../dai.png"
import { YourWallet } from "./yourWallet"  //because of index.ts
import { makeStyles } from "@material-ui/core"
import { BetWallet } from "./betWallet"
import { PlayersTable } from "./playersTable"
import { TotalBetWallet } from "./totalBetWallet"
import { WinnerSection } from "./winnerSection/WinnerSection"


export type Token = {
    image: string,
    address: string,
    name: string
}

const useStyles = makeStyles((theme) => ({
    title: {
        color: theme.palette.common.white,
        textAlign: "center",
        padding: theme.spacing(4)
    }
}))


export const Main = () => {
    //Show betToken values from the wallet

    //Get the address of different tokens
    //Get the balannce of the users wallet

    //send the brownie-config to our 'src' folder
    //send the build folder
    const classes = useStyles()
    const { chainId, error } = useEthers()
    const networkName = chainId ? helperConfig[chainId] : "dev"  //if chainId exists, call helperConfig[chainId]. if not, call 'dev'
    const mscTokenAddress = chainId ? networkMapping[String(chainId)]["MSCToken"][0] : constants.AddressZero
    const wethTokenAddress = chainId ? brownieConfig["networks"][networkName]["weth_token"] : constants.AddressZero
    const fauTokenAddress = chainId ? brownieConfig["networks"][networkName]["fau_token"] : constants.AddressZero
    if (error) {
        console.log(error)
    }
    const supportedTokens: Array<Token> = [
        {
            image: msc,
            address: mscTokenAddress,
            name: "MSC"
        },
        {
            image: eth,
            address: wethTokenAddress,
            name: "WETH"
        },
        {
            image: dai,
            address: fauTokenAddress,
            name: "DAI"
        }
    ]
    console.log(chainId)
    console.log(networkName)
    return (<>
        <h2 className={classes.title}>Dapp CardGame</h2>
        <YourWallet supportedTokens={supportedTokens} />
        <BetWallet supportedTokens={supportedTokens} />
        <TotalBetWallet supportedTokens={supportedTokens} />
        <PlayersTable supportedTokens={supportedTokens} />
        <WinnerSection supportedTokens={supportedTokens} />
    </>)
}