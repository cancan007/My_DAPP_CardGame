import { Token } from "../Main"
import { useEthers, useTokenBalance, useNotifications } from "@usedapp/core"
import { formatUnits } from "@ethersproject/units"
import { Button, Input, CircularProgress, Snackbar } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import React, { useState, useEffect } from 'react'
import { useVariablesOfToken, useBetTokens } from "../../hooks"
import { utils } from "ethers"

interface RefundFormProps {
    token: Token
}

export const RefundForm = ({ token }: RefundFormProps) => {
    const { address: tokenAddress, name } = token
    const { wagerOfPlayer } = useVariablesOfToken(tokenAddress)
    const { repay, repayBetState } = useBetTokens(tokenAddress)
    const { notifications } = useNotifications()

    const [amount, setAmount] = useState<number | string | Array<number | string>>(0)

    const formattedTotalBet: Number = wagerOfPlayer ? parseFloat(formatUnits(wagerOfPlayer, 18)) : 0

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = event.target.value === "" ? "" : Number(event.target.value)
        if (formattedTotalBet >= newAmount) {
            setAmount(newAmount)
        } else {
            event.target.value = formattedTotalBet.toString()
        }
        console.log(newAmount)
    }

    const isMining = repayBetState.status === "Mining"

    const handleRepaySubmit = () => {
        const amountAsWei = utils.parseEther(amount.toString())
        return repay(amountAsWei.toString())
    }

    const [showRepaySuccess, setShowRepaySuccess] = useState(false)

    const handleCloseSnack = () => {
        setShowRepaySuccess(false)
    }

    useEffect(() => {
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Repay ERC20 transfer"
        ).length > 0) {
            setShowRepaySuccess(true)
        }
    }, [notifications, showRepaySuccess])

    return (
        <>
            <div>
                <Input onChange={handleInputChange}></Input>
                <Button color="secondary" size="large" disabled={isMining} onClick={handleRepaySubmit}>
                    {isMining ? <CircularProgress size={26} /> : "Repay"}
                </Button>
            </div>
            <Snackbar
                open={showRepaySuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}>
                <Alert onClose={handleRepaySubmit} severity="success">
                    Repay {amount} tokens!
                </Alert>
            </Snackbar>
        </>
    )
}