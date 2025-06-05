import React from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ title, showBackButton = false }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:cursor-pointer hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                aria-label="Go back"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <h1 className="!text-xl font-semibold text-gray-900 tracking-tight">{title}</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
