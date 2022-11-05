import React from 'react';
import { 
    Form, 
    redirect 
} from 'react-router-dom';

export async function action() {
    if (window.ethereum) {
        let accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts'
        });
        if (accounts.length > 0) {
            localStorage.setItem('address', accounts[0]);
            return redirect('/');
        } else {
            console.log("Could not login");
        }
    } else {
        console.log("No Metamask to login");
    }
}

export default function Login() {
    return (
        <Form method="post">
            <button type="submit">
                Login
            </button>
        </Form>
    );
}