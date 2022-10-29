import React from 'react';
import { useMemo } from 'react';
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
    await dbank.methods.vote(proposalId).send({
        from: localStorage.getItem('address'),
        gas: 200000
    })
}

async function endProposal(proposalId) {
    await dbank.methods.endProposal(proposalId).send({
        from: localStorage.getItem('address'),
        gas: 200000,
    })
}

export async function loader() {
    const web3 = new Web3(window.ethereum);
    const dbank = new web3.eth.Contract(artifact.abi, import.meta.env.VITE_CONTRACT_ADDRESS);
    let numProposals = await dbank.methods.proposalsLength().call();
    let proposals = [];
    for (let i=0; i<numProposals; i++) {
      let p = await dbank.methods.proposals(i).call();
      console.log(p);
      let trimmed_p = {
        id: i,
        totalVoteCount: p.totalVoteCount,
        supplyChange: p.supplyChange,
        voteCount: p.voteCount,
        done: p.done ? "true" : "false",
        increase: p.increase ? "true" : "false",
        blockNum: p.blockNum,
      }
      proposals.push(trimmed_p);
    }
    return proposals;
}

export async function action({ request }) {
    const web3 = new Web3(window.ethereum);
    const formData = await request.formData();
    const deployedContract = new web3.eth.Contract(artifact.abi, import.meta.env.VITE_CONTRACT_ADDRESS);
    const from = localStorage.getItem('address');
    const direction = formData.get('direction') === 'increase' ? true : false;
    const delta = parseInt(formData.get('delta'));
    if (!isNaN(delta) && delta > 0) {
        let unconfirmedTx = await deployedContract.methods.proposeSupplyChange(delta, direction).send({
            from: from,
            gas: 150000
        });
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
                Header: 'Direction',
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
                    <button onClick={() => vote(cell.row.values.id)}>Vote</button>
                )
            },
            {
                Header: 'End',
                Cell: ({cell}) => (
                    <button onClick={() => endProposal(cell.row.values.id)}>End Proposal</button>
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