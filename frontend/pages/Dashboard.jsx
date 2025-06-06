import React from "react";
import Dashboard from "../components/Dashboard/Dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Dashboard />
        </div>
      </div>
    </div>
  );
}
