import { Token } from "../Main"
import { useEthers, useTokenBalance } from "@usedapp/core"
import { formatUnits } from "@ethersproject/units"
import { BalanceMsg } from "../BalanceMsg"
import { useVariablesOfToken } from "../../hooks"
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, makeStyles } from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
    container: {
        display: "inline-grid",
        gridTemplateColumns: "auto auto auto",
        gap: theme.spacing(1),
        alignItems: "center"
    },
    table: {
        minWidth: 650,
    }
}));

interface ShowPlayersProps {
    token: Token
}


export const ShowPlayers = ({ token }: ShowPlayersProps) => {
    const { image, address: tokenAddress, name } = token
    const { players } = useVariablesOfToken(tokenAddress)
    const classes = useStyles()



    return (
        <div className={classes.container}>
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>{name} Player Address</TableCell>
                            <TableCell>{name} Card Number</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell component="th" scope="row">{players}</TableCell>

                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}