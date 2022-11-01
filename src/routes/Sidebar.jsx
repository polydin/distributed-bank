import React from 'react';
import { Form, Link } from "react-router-dom";
import '../css/Sidebar.css';

export default function Sidebar() {

    return (
        <div className="sidebar">
            <Link to='/'>Home</Link>
            <Link to='/transactions'>Transactions</Link>
            <Link to='/exchange'>Exchange</Link>
            <Link to='/transfer'>Transfer</Link>
            <Link to='/proposal'>Proposal</Link>
        </div>
    );
}