import React from 'react';
import { 
    Form, 
    redirect, 
} from 'react-router-dom';
import Web3 from 'web3';
import artifact from '../DistributedBank.json';
import { postTxToAccount } from '../utils';
import '../css/Transfer.css';

export async function action({ request }) {
    const web3 = new Web3(window.ethereum)
    const formData = await request.formData()
    const deployedContract = new web3.eth.Contract(artifact.abi, import.meta.env.VITE_CONTRACT_ADDRESS)
    const from = window.ethereum.selectedAddress
    const to = formData.get('address')
    const value = parseInt(formData.get('amount'))
    let gasEstimate = await deployedContract.methods.transfer(from, to, value).estimateGas({
        from: from,
    })
    let unconfirmedTx = await deployedContract.methods.transfer(from, to, value).send({
        from: from,
        gas: Math.floor(gasEstimate * 1.1)
    })
    let body = {
        hash: unconfirmedTx.transactionHash,
    }
    postTxToAccount(from, JSON.stringify(body))

    return redirect('/')
}

export default function Transfer() {
    return (
        <div className="transfer">
            <h1>Transfer</h1>
            <Form method="post">
                <input type="text" placeholder="amount" name="amount" />
                <input type="text" placeholder="address" name="address" />
                <input type="submit" value="Submit" />
            </Form>
        </div>
    );
}