import React from 'react';
import { useLoaderData } from "react-router-dom";
import Web3 from 'web3';
import artifact from '../DistributedBank.json';

export async function loader() {
    const web3 = new Web3(window.ethereum);
    const deployedContract = new web3.eth.Contract(artifact.abi, import.meta.env.VITE_CONTRACT_ADDRESS);
    const balance = await deployedContract.methods.balanceOf(
        localStorage.getItem('address')
    ).call();
    return balance;
}

export default function User() {
    const balance = useLoaderData();

    return (
        <div>
            <h2>Your balance is {balance}</h2>
        </div>
    );
}