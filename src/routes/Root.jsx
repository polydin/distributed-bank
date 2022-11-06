import React from 'react';
import { 
    Outlet, 
    redirect 
} from "react-router-dom";
import Sidebar from './Sidebar';
import Header from './Header'
import '../css/Root.css';

export async function loader() {
    if (window.ethereum) {
        if (!localStorage.getItem('address')) {
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
            <div className="main">
                <div><Sidebar /></div>
                <div><Outlet /></div>
            </div>
        </div>
        
    );
}