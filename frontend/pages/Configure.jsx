import React from 'react';
import TopBar from '../components/TopBar/TopBar';
import Configure from "../components/Configure/Configure";

export default function ConfigurePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar title="Configure" showBackButton={true} />
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <Configure />
                </div>
            </div>
        </div>
    );
}