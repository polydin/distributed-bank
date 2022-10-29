import React from 'react';
import { Form, redirect } from 'react-router-dom';
import Web3 from 'web3';
import artifact from '../DistributedBank.json';
import { postTxToAccount } from '../utils';

// TODO - post exhange tx to account

export async function action({ request }) {
    const web3 = new Web3(window.ethereum);
    const from = localStorage.getItem('address')
    const formData = await request.formData();
    const deployedContract = new web3.eth.Contract(artifact.abi, import.meta.env.VITE_CONTRACT_ADDRESS);
    let value = web3.utils.toWei(formData.get('amount'), 'ether');
    let unconfirmedTx = await deployedContract.methods.exchange().send({
        from: from,
        gas: 150000,
        value: value,
    });
    let body = {
        hash: unconfirmedTx.transactionHash,
    }
    postTxToAccount(from, JSON.stringify(body));

    return redirect('/');
}

export default function Exchange() {
    return (
        <div>
            <h1>Exchange</h1>
            <Form
                method="post"
            >
                <input type="text" placeholder="amount" name="amount" />
                <input type="submit" value="Exchange" />
            </Form>
        </div>
    );
}