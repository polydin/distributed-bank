import React from 'react';
import { 
    Form, 
    redirect, 
    useLoaderData 
} from 'react-router-dom';
import Web3 from 'web3';
import artifact from '../DistributedBank.json';
import { postTxToAccount } from '../utils';

export async function loader() {
    const web3 = new Web3(window.ethereum);
    const dbank = new web3.eth.Contract(artifact.abi, import.meta.env.VITE_CONTRACT_ADDRESS);
    let numProposals = await dbank.methods.proposalsLength().call();
    let proposals = [];
    for (let i=0; i<numProposals; i++) {
      let p = await dbank.methods.proposals(i).call();
      let trimmed_p = {
        supplyChange: p.supplyChange,
        voteCount: p.voteCount,
        done: p.done,
        increase: p.increase,
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
        </div>
    );
}