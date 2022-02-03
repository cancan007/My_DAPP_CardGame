import { useEthers } from "@usedapp/core"
import helperConfig from "../helper-config.json"
import networkMapping from "../chain-info/deployments/map.json"
import { constants } from "ethers"
import brownieConfig from "../brownie-config.json"

export const Main = () => {
    //Show betToken values from the wallet

    //Get the address of different tokens
    //Get the balannce of the users wallet

    //send the brownie-config to our 'src' folder
    //send the build folder
    const { chainId, error } = useEthers()
    const networkName = chainId ? helperConfig[chainId] : "dev"  //if chainId exists, call helperConfig[chainId]. if not, call 'dev'
    const mscTokenAddress = chainId ? networkMapping[String(chainId)]["MSCToken"][0] : constants.AddressZero
    const wethTokenAddress = chainId ? brownieConfig["networks"][networkName]["weth_token"] : constants.AddressZero
    console.log(chainId)
    console.log(networkName)
    return (<div>Hi!</div>)
}