import React from 'react';

const InputPages = ({
  inputPages,
  newPage,
  setNewPage,
  handleAddPage,
  handleRemovePage,
  handlePageChange,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  sortField,
  sortDirection,
  handleSort,
  filteredAndSortedPages
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create New Page Form */}
      <div className="p-6 rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Create New Input Page</h2>
        <form onSubmit={handleAddPage} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Page Name</label>
            <input
              type="text"
              value={newPage.name}
              onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Customer Information"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
            <textarea
              value={newPage.description}
              onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="Describe the purpose of this page"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Page Type</label>
            <select
              value={newPage.type}
              onChange={(e) => setNewPage({ ...newPage, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a type</option>
              <option value="form">Form</option>
              <option value="survey">Survey</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={newPage.required}
              onChange={(e) => setNewPage({ ...newPage, required: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
              Required Page
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 hover:cursor-pointer rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Page
          </button>
        </form>
      </div>

      {/* Existing Pages */}
      <div className="p-6 rounded-lg bg-white shadow-sm">
        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 cursor-pointer py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option className='hover:cursor-pointer' value="all">All Pages</option>
              <option className='hover:cursor-pointer' value="required">Required Pages</option>
            </select>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Sort by:</span>
            <button
              onClick={() => handleSort('name')}
              className={`hover:text-blue-600 hover:cursor-pointer ${sortField === 'name' ? 'text-blue-600' : ''}`}
            >
              Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('type')}
              className={`hover:text-blue-600 hover:cursor-pointer ${sortField === 'type' ? 'text-blue-600' : ''}`}
            >
              Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAndSortedPages.map((page) => (
            <div
              key={page.id}
              className="p-4 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{page.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{page.description}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {page.type}
                    </span>
                    {page.required && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemovePage(page.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredAndSortedPages.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No input pages found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputPages; 