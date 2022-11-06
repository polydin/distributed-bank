import React from 'react';
import { useLoaderData } from "react-router-dom";
import Web3 from 'web3';
import artifact from '../DistributedBank.json';
import '../css/UserInfo.css';

const web3 = new Web3(window.ethereum);
const deployedContract = new web3.eth.Contract(artifact.abi, import.meta.env.VITE_CONTRACT_ADDRESS);

export async function loader() {
    let accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts'
    });
    if (accounts.length === 0) { return redirect('/login')}
    const balance = await deployedContract.methods.balanceOf(
        window.ethereum.selectedAddress
    ).call();
    return balance;
}

export default function User() {
    const balance = useLoaderData();

    return (
        <div className="user-info">
            <h2>Your balance is {balance}</h2>
        </div>
    );
}