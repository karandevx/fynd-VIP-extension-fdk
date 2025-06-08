import React from 'react';
import TopBar from '../components/TopBar/TopBar';
import Campaigns from "../components/Campaings/Campaings";

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Campaigns" showBackButton={true} />
      <Campaigns />
    </div>
  );
}