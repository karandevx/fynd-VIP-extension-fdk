import React from 'react';
import TopBar from '../components/TopBar/TopBar';
import Dashboard from "../components/Dashboard/Dashboard";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar title="Dashboard" showBackButton={false} />
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <Dashboard />
                </div>
            </div>
        </div>
    );
}