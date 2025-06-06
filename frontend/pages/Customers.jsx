import React from 'react';
import TopBar from '../components/TopBar/TopBar';
import { Customers } from "../components/Customers/Customers.jsx";

export default function CustomersPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar title="Customers" showBackButton={true} />
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <Customers />
                </div>
            </div>
        </div>
    );
}