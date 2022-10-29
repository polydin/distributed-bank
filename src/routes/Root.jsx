import React from 'react';
import { 
    Outlet, 
    redirect 
} from "react-router-dom";
import Sidebar from './Sidebar';
import '../css/Root.css';

export async function loader() {
    if (window.ethereum) {
        let accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        if (accounts.length === 0) {
            return redirect('/login'); 
        } else {
            localStorage.setItem('address', accounts[0]);
        }
    } else {
        console.log('Please install Metamask to continue');
    }
}

export default function Root() {
    return (
        <div className="root">
            <div><Sidebar /></div>
            <div><Outlet /></div>
        </div>
        
    );
}