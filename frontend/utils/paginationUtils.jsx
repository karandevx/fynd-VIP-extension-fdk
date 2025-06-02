import React from 'react';

/**
 * Render pagination controls as an array of React elements.
 * @param {number} currentPage
 * @param {number} totalPages
 * @param {function} handlePageChange
 * @param {number} [maxVisiblePages=5]
 * @returns {React.ReactNode[]}
 */
export function renderPagination(currentPage, totalPages, handlePageChange, maxVisiblePages = 5) {
  const pages = [];
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Previous button
  pages.push(
    <button
      key="prev"
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className={`px-3 py-1 rounded-md text-sm font-medium ${
        currentPage === 1
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-indigo-600 hover:bg-indigo-50 transition-colors'
      } border border-gray-200`}
    >
      <span className="sr-only">Previous</span>
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </button>
  );

  // First page
  if (startPage > 1) {
    pages.push(
      <button
        key="1"
        onClick={() => handlePageChange(1)}
        className="px-3 py-1 rounded-md text-sm font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition-colors border border-gray-200"
      >
        1
      </button>
    );
    if (startPage > 2) {
      pages.push(
        <span key="start-ellipsis" className="px-2 py-1">
          ...
        </span>
      );
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => handlePageChange(i)}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          currentPage === i
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-indigo-600 hover:bg-indigo-50 transition-colors'
        } border border-gray-200`}
      >
        {i}
      </button>
    );
  }

  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push(
        <span key="end-ellipsis" className="px-2 py-1">
          ...
        </span>
      );
    }
    pages.push(
      <button
        key={totalPages}
        onClick={() => handlePageChange(totalPages)}
        className="px-3 py-1 rounded-md text-sm font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition-colors border border-gray-200"
      >
        {totalPages}
      </button>
    );
  }

  // Next button
  pages.push(
    <button
      key="next"
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className={`px-3 py-1 rounded-md text-sm font-medium ${
        currentPage === totalPages
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-indigo-600 hover:bg-indigo-50 transition-colors'
      } border border-gray-200`}
    >
      <span className="sr-only">Next</span>
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </button>
  );

  return pages;
} 