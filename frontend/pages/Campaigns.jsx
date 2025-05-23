import React from 'react';
import TopBar from '../components/TopBar/TopBar';
import Campaigns from "../components/Campaings/Campaings";

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Campaigns" showBackButton={true} />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Campaigns />
        </div>
      </div>
    </div>
  );
}