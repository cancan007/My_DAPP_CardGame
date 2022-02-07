import { Token } from "../Main"
import { useEthers, useTokenBalance, useNotifications } from "@usedapp/core"
import { formatUnits } from "@ethersproject/units"
import { Button, Input, CircularProgress, Snackbar } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import React, { useState, useEffect } from 'react'
import { useBetTokens } from "../../hooks"
import { utils } from "ethers"

interface BetFormProps {
    token: Token
}

export const BetForm = ({ token }: BetFormProps) => {
    const { address: tokenAddress, name } = token  // use address as tokenAddress
    const { account } = useEthers()
    const tokenBalance = useTokenBalance(tokenAddress, account)
    const formattedTokenBalance: number = tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)) : 0
    const { notifications } = useNotifications()

    const [amount, setAmount] = useState<number | string | Array<number | string>>(0)
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = event.target.value === "" ? "" : Number(event.target.value)
        setAmount(newAmount)
        console.log(newAmount)
    }

    const { approveSetBet, state: approveErc20State } = useBetTokens(tokenAddress)
    const handleBetSubmit = () => {
        const amountAsWei = utils.parseEther(amount.toString())
        return approveSetBet(amountAsWei.toString())
    }

    const isMining = approveErc20State.status === "Mining"  // bool
    const [showErc20ApprovalSuccess, setShowErc20ApprovalSuccess] = useState(false)
    const [showBetTokenSuccess, setShowBetTokenSuccess] = useState(false)

    const handleCloseSnack = () => {
        setShowErc20ApprovalSuccess(false)
        setShowBetTokenSuccess(false)
    }

    useEffect(() => {
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Approve ERC20 transfer").length > 0) {
            setShowErc20ApprovalSuccess(true)
            setShowBetTokenSuccess(false)
        }
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Bet ERC20 transfer").length > 0) {
            setShowErc20ApprovalSuccess(false)
            setShowBetTokenSuccess(true)
        }
    }, [notifications, showErc20ApprovalSuccess, showBetTokenSuccess])

    return (
        <>
            <div>
                <Input
                    onChange={handleInputChange}></Input>
                <Button color='primary' size="large" disabled={isMining} onClick={handleBetSubmit}>
                    {isMining ? <CircularProgress size={26} /> : "Bet!!"}
                </Button>
            </div>
            <Snackbar
                open={showErc20ApprovalSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack} >
                <Alert onClose={handleCloseSnack} severity="success">
                    ERC-20 token transfer approved! Now approve the 2nd transaction.
                </Alert>
            </Snackbar>
            <Snackbar
                open={showBetTokenSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack} >
                <Alert onClose={handleCloseSnack} severity="success">
                    Token Bet!
                </Alert>
            </Snackbar>
        </>
    )
}