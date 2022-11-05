import React, { useMemo } from 'react';
import { useTable } from 'react-table';
import { 
    Form, 
    redirect, 
    useLoaderData 
} from 'react-router-dom';
import Web3 from 'web3';
import artifact from '../DistributedBank.json';
import { postTxToAccount } from '../utils';

const web3 = new Web3(window.ethereum);
const dbank = new web3.eth.Contract(artifact.abi, import.meta.env.VITE_CONTRACT_ADDRESS);

async function vote(proposalId) {
    let from = localStorage.getItem('address');
    let gasEstimate = await dbank.methods.vote(proposalId).estimateGas({
        from: from,
    }) 
    await dbank.methods.vote(proposalId).send({
        from: from,
        gas: Math.floor(gasEstimate * 1.1)
    });
}

async function endProposal(proposalId) {
    let from = localStoarge.getItem('address');
    let gasEstimate = dbank.methods.endProposal(proposalId).estimateGas({
        from: from,
    });
    await dbank.methods.endProposal(proposalId).send({
        from: from,
        gas: Math.floor(gasEstimate * 1.1),
    })
}

export async function loader() {
    const dbank = new web3.eth.Contract(artifact.abi, import.meta.env.VITE_CONTRACT_ADDRESS);
    let numProposals = await dbank.methods.proposalsLength().call();
    let proposals = [];
    for (let i=0; i<numProposals; i++) {
      let p = await dbank.methods.proposals(i).call();
      let voteCount = await dbank.methods.getVote(i, localStorage.getItem('address')).call();
      let trimmed_p = {
        id: i,
        totalVoteCount: p.totalVoteCount,
        supplyChange: p.supplyChange,
        voteCount: p.voteCount,
        done: p.done ? "Yes" : "No",
        increase: p.increase ? "Increase" : "Decrease",
        blockNum: p.blockNum,
        voted: voteCount.voted,
      }
      proposals.push(trimmed_p);
    }
    return proposals.reverse();
}

export async function action({ request }) {
    const formData = await request.formData();
    const from = localStorage.getItem('address');
    const direction = formData.get('direction') === 'increase' ? true : false;
    const delta = parseInt(formData.get('delta'));
    if (!isNaN(delta) && delta > 0) {
        let gasEstimate = await dbank.methods.proposeSupplyChange(delta, direction).estimateGas({
            from: from,
        });
        let unconfirmedTx = await dbank.methods.proposeSupplyChange(delta, direction).send({
            from: from,
            gas: Math.floor(gasEstimate * 1.1),
        })
        let body = {
            hash: unconfirmedTx.transactionHash,
        }
        postTxToAccount(from, JSON.stringify(body));
    }
    return redirect('/');
}

export default function Proposal() {
    const proposals = useLoaderData();
    const data = useMemo(() => proposals, []);
    const columns = useMemo(() => [
            {
                Header: 'ID',
                accessor: 'id'
            },
            {
                Header: 'Change',
                accessor: 'increase'
            },
            {
                Header: 'Done',
                accessor: 'done'
            },
            {
                Header: 'Supply Change',
                accessor: 'supplyChange'
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
                        onClick={() => vote(cell.row.values.id)}
                    >
                        Vote
                    </button>
                )
            },
            {
                Header: 'End',
                Cell: ({cell}) => (
                    <button 
                        onClick={() => endProposal(cell.row.values.id)}
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
        <div>
            <h1>Propose Monetary Policy Change</h1>
            <Form method="post">
                <input type="text" placeholder="Percent Change" name="delta" />
                <select name="direction">
                    <option value="increase">Increase</option>
                    <option value="decrease">Decrease</option>
                </select>
                <input type="submit" value="Create Proposal" />
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