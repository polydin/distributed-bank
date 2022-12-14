import React from 'react';
import { 
    Link 
} from "react-router-dom";
import '../css/Sidebar.css';

export default function Sidebar() {

    return (
        <div className="link-list">
            <div><Link to='/'>Home</Link></div>
            <div><Link to='/transactions'>Transactions</Link></div>
            <div><Link to='/exchange'>Exchange</Link></div>
            <div><Link to='/transfer'>Transfer</Link></div>
            <div><Link to='/proposal'>Proposal</Link></div>
        </div>
    );
}