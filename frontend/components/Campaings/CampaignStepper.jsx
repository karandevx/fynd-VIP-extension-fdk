import React from 'react';

const CampaignStepper = ({ currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-blue-600' : 'border-gray-300'}`}>
            1
          </div>
          <span className="ml-2">Campaign Details</span>
        </div>
        <div className="flex-1 h-0.5 mx-4 bg-gray-200">
          <div className={`h-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        </div>
        <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-blue-600' : 'border-gray-300'}`}>
            2
          </div>
          <span className="ml-2">Email Template</span>
        </div>
      </div>
    </div>
  );
};

export default CampaignStepper; 