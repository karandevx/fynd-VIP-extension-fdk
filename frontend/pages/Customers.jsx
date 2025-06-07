import React from 'react';
import TopBar from '../components/TopBar/TopBar';
import { Customers } from "../components/Customers/Customers.jsx";

export default function CustomersPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar title="Customers" showBackButton={true} />
            <Customers />
        </div>
    );
}