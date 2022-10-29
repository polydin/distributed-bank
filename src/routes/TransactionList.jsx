import React, {
    useMemo,
} from 'react';
import { useLoaderData } from 'react-router-dom';
import Web3 from 'web3';
import { ethers } from 'ethers';
import artifact from '../DistributedBank.json';
import { useTable } from 'react-table';

export async function loader() {
    const web3 = new Web3(window.ethereum);
    const address = localStorage.getItem('address');
    const response = await fetch(`http://localhost:5000/api/users/${address}/txs`).then(response => response.json())
    let transactions = [];
    for (let i=0; i<response.transactions.length; i++) {
        let tx = await web3.eth.getTransaction(response.transactions[i])
        transactions[i] = tx;
    }
    for (const tx of transactions) {
        const inter = new ethers.utils.Interface(artifact.abi);
        let transformedTx = inter.parseTransaction({ data: tx.input, value: tx.value });
        tx.name = transformedTx.functionFragment.name;
        tx.args = transformedTx.args;
    }
    return transactions;
}

export default function TransactionList() {
    const transactions = useLoaderData();
    const data = useMemo(() => transactions, []);
    const columns = useMemo(() => [
            {
                Header: 'Type',
                accessor: 'name',
            },
            {
                Header: 'Value',
                accessor: 'value',
            },
            {
                Header: 'Block Number',
                accessor: 'blockNumber',
            },
            {
                Header: 'Hash',
                accessor: 'hash',
            },
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
            <h1>Transactions</h1>
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
    )
}