import React, {
    useMemo,
} from 'react';
import { useLoaderData } from 'react-router-dom';
import Web3 from 'web3';
import { ethers } from 'ethers';
import artifact from '../DistributedBank.json';
import { useTable } from 'react-table';
import '../css/TransactionList.css';

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
        switch(transformedTx.functionFragment.name) {
            case 'exchange':
                tx.name = 'Exchange';
                tx.to = import.meta.env.VITE_CONTRACT_ADDRESS;
                break;
            case 'proposeSupplyChange':
                tx.name = 'Supply Change';
                tx.to = import.meta.env.VITE_CONTRACT_ADDRESS;
                break;
            case 'transfer':
                tx.name = 'Transfer';
                tx.to = transformedTx.args[1];
                tx.transferValue = transformedTx.args[2].toString(10);
                break;
            default:
                tx.name = 'Unknown';
        }
        tx.value = web3.utils.fromWei(tx.value, 'ether') + ' ETH';
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
                Header: 'To',
                accessor: 'to',
            },
            {
                Header: 'ETH Value',
                accessor: 'value',
            },
            {
                Header: 'Value Transferred',
                accessor: 'transferValue'
            },
            {
                Header: 'Block Number',
                accessor: 'blockNumber',
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
                                <th align="center" {...column.getHeaderProps()}>
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
                                        <td align="center" className="tableData" {...cell.getCellProps()}>
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