import React, {
    useMemo,
} from 'react';
import { useTable } from 'react-table';
import { 
    Form, 
    redirect,
    useLoaderData,
} from 'react-router-dom';
import Web3 from 'web3';
import artifact from '../DistributedBank.json';
import { postTxToAccount } from '../utils';
import '../css/Exchange.css';
    
const web3 = new Web3(window.ethereum);
const dbank = new web3.eth.Contract(artifact.abi, import.meta.env.VITE_CONTRACT_ADDRESS);

export async function loader() {
    let exchangeRate = web3.utils.fromWei(await dbank.methods.exchangeRate().call(), 'ether');
    let numProposals = await dbank.methods.rateProposalsLength().call();
    let rateProposals = [];
    for (let i=0; i<numProposals; i++) {
      let p = await dbank.methods.rateProposals(i).call();
      let voteCount = await dbank.methods.getRateVote(i, window.ethereum.selectedAddress).call();
      let trimmed_p = {
        id: i,
        totalVoteCount: p.totalVoteCount,
        newRate: web3.utils.fromWei(p.newRate, 'ether'),
        voteCount: p.voteCount,
        done: p.done ? "Yes" : "No",
        blockNum: p.blockNum,
        voted: voteCount.voted,
      }
      rateProposals.push(trimmed_p);
    }
    let data = {
        exchangeRate: exchangeRate,
        rateProposals: rateProposals.reverse(),
    }
    return data;
}

export async function action({ request }) {
    const from = window.ethereum.selectedAddress;
    const formData = await request.formData();
    let value = web3.utils.toWei(formData.get('amount'), 'ether');
    let gasEstimate = await dbank.methods.exchange().estimateGas({
        from: from,
        value: value,
    });
    let upperGasLimit = Math.floor(gasEstimate * 1.1);
    let unconfirmedTx = await dbank.methods.exchange().send({
        from: from,
        gas: upperGasLimit,
        value: value,
    });
    let body = {
        hash: unconfirmedTx.transactionHash,
    }
    postTxToAccount(from, JSON.stringify(body));

    return redirect('/');
}

async function rateVote(id) {
    let from = window.ethereum.selectedAddress;
    let gasEstimate = await dbank.methods.rateVote(id).estimateGas({
        from: from,
    });
    let upperGasLimit = Math.floor(gasEstimate * 1.1);
    await dbank.methods.rateVote(id).send({
        from: from,
        gas: upperGasLimit,
    });
}

async function endRateProposal(id) {
    let from = window.ethereum.selectedAddress
    let gasEstimate = await dbank.methods.endRateProposal(id).estimateGas({
        from: from,
    })
    await dbank.methods.endRateProposal(id).send({
        from: from,
        gas: Math.floor(gasEstimate * 1.1)
    })
}

export default function Exchange() {
    const loaderData = useLoaderData();
    const data = useMemo(() => loaderData.rateProposals, []);
    const columns = useMemo(() => [
            {
                Header: 'ID',
                accessor: 'id'
            },
            {
                Header: 'Done',
                accessor: 'done'
            },
            {
                Header: 'New Rate (ETHUSD)',
                accessor: 'newRate'
            },
            {
                Header: 'Vote Count',
                accessor: 'voteCount'
            },
            {
                Header: 'Total Vote Count',
                accessor: 'totalVoteCount'
            },
            {
                Header: 'Vote',
                Cell: ({cell}) => (
                    <button 
                        hidden={data.find(p => p.id === cell.row.values.id).voted || cell.row.values.done === 'Yes' ? true : false} 
                        onClick={() => rateVote(cell.row.values.id)}
                    >
                        Vote
                    </button>
                )
            },
            {
                Header: 'End',
                Cell: ({cell}) => (
                    <button 
                        onClick={() => endRateProposal(cell.row.values.id)}
                        hidden={cell.row.values.done === 'Yes' ? true : false}
                    >
                        End Proposal
                    </button>
                )

            }
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });

    return (
        <div className="exchange">
            <h1>Exchange</h1>
            <p>The current exchangeRate is {loaderData.exchangeRate} ETHUSD</p>
            <Form
                method="post"
            >
                <input type="text" placeholder="amount" name="amount" />
                <input type="submit" value="Exchange" />
            </Form>
            <Form method="post" action="">
                <input type="text" placeholder="New Rate" name="newRate" />
                <input type="submit" value="Propose New Rate" />
            </Form>
            <br />
            <br />
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>
                                    {column.render('Header')}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return (
                                        <td {...cell.getCellProps()}>
                                            {cell.render('Cell')}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
}