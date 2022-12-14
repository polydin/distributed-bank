import React from 'react';
import { 
    Outlet, 
    redirect,
} from "react-router-dom";
import Sidebar from './Sidebar';
import Header from './Header'
import '../css/Root.css';

export async function loader() {
    if (window.ethereum) {
        let accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts'
        })
        if (window.ethereum.selectedAddress === null) {
            console.log("No address assigned");
            return redirect('/login'); 
        } 
    } else {
        console.log("Please install Metamask");
    }
}

export default function Root() {
    return (
        <div className="root">
            <div className="header"><Header /></div>
            <div className="sidebar"><Sidebar /></div>
            <div className="outlet"><Outlet /></div>
        </div>
        
    );
}