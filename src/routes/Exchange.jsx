import React from 'react';
import { 
    Form, 
   redirect,
   useLoaderData,
} from 'react-router-dom';
import Web3 from 'web3';
import artifact from '../DistributedBank.json';
import { postTxToAccount } from '../utils';
    
const web3 = new Web3(window.ethereum);
const deployedContract = new web3.eth.Contract(artifact.abi, import.meta.env.VITE_CONTRACT_ADDRESS);

export async function loader() {
    let exchangeRate = web3.utils.fromWei(await deployedContract.methods.exchangeRate().call(), 'ether');
    let data = {
        exchangeRate: exchangeRate,
    }
    return data;
}

export async function action({ request }) {
    const from = localStorage.getItem('address')
    const formData = await request.formData();
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
    const data = useLoaderData();

    return (
        <div>
            <h1>Exchange</h1>
            <p>The current exchangeRate is {data.exchangeRate} ETHUSD</p>
            <Form
                method="post"
            >
                <input type="text" placeholder="amount" name="amount" />
                <input type="submit" value="Exchange" />
            </Form>
        </div>
    );
}