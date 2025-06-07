import React from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ title, showBackButton = false }) => {
  const navigate = useNavigate();

  return (
    <div className="backdrop-blur-md bg-gradient-to-r from-blue-50/80 to-indigo-100/80 border-b border-gray-200 shadow-md sticky top-0 z-50">
      <div className="px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl bg-white/70 hover:bg-blue-100 transition-all duration-200 flex items-center justify-center shadow-sm border border-gray-200"
                aria-label="Go back"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <h1 className="!text-2xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">{title}</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
