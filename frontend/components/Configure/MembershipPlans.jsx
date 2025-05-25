import React from 'react';

const MembershipPlans = ({
  membershipPlans,
  newPlan,
  setNewPlan,
  handleAddPlan,
  handleAddVariant,
  handleRemoveVariant,
  handleVariantChange,
  handleFeatureChange,
  handleAddFeature,
  handleRemoveFeature,
  handleMediaUpload,
  handleRemoveMedia,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  sortField,
  sortDirection,
  handleSort,
  filteredAndSortedPlans
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create New Plan Form */}
      <div className="p-6 rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Create New Membership Plan</h2>
        <form onSubmit={handleAddPlan} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Plan Name</label>
            <input
              type="text"
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Premium VIP"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
            <textarea
              value={newPlan.description}
              onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="Describe your plan"
              required
            />
          </div>

          {/* Plan Variants */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-medium text-gray-900">Plan Variants</h3>
              <button
                type="button"
                onClick={handleAddVariant}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:cursor-pointer"
              >
                + Add Variant
              </button>
            </div>

            {newPlan.variants.map((variant, variantIndex) => (
              <div key={variantIndex} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium text-gray-900">Variant {variantIndex + 1}</h4>
                  {newPlan.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(variantIndex)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Variant Name</label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => handleVariantChange(variantIndex, 'name', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Basic, Standard, Premium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Price</label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(variantIndex, 'price', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 9.99"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Duration (months)</label>
                  <input
                    type="number"
                    value={variant.duration}
                    onChange={(e) => handleVariantChange(variantIndex, 'duration', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">Features</label>
                    <button
                      type="button"
                      onClick={() => handleAddFeature(variantIndex)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Add Feature
                    </button>
                  </div>
                  {variant.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(variantIndex, featureIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., HD streaming, Multiple devices"
                        required
                      />
                      {variant.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(variantIndex, featureIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center hover:cursor-pointer">
                  <input
                    type="checkbox"
                    id={`popular-${variantIndex}`}
                    checked={variant.isPopular}
                    onChange={(e) => handleVariantChange(variantIndex, 'isPopular', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`popular-${variantIndex}`} className="ml-2 block text-sm text-gray-700">
                    Mark as Popular
                  </label>
                </div>

                {/* Media Upload Section */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Plan Image</label>
                  <div className="flex items-center space-x-4">
                    {variant.media ? (
                      <div className="relative">
                        <img
                          src={variant.media.preview}
                          alt="Plan preview"
                          className="h-24 w-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(variantIndex)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMediaUpload(variantIndex, e)}
                            className="hidden"
                          />
                          <div className="text-center">
                            <svg
                              className="mx-auto h-8 w-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            <span className="mt-1 block text-xs text-gray-500">Upload</span>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full hover:cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Plan
          </button>
        </form>
      </div>

      {/* Existing Plans */}
      <div className="p-6 rounded-lg bg-white shadow-sm">
        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search plans..."
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
              <option className='hover:cursor-pointer' value="all">All Plans</option>
              <option className='hover:cursor-pointer' value="popular">Popular Plans</option>
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
              onClick={() => handleSort('price')}
              className={`hover:text-blue-600 hover:cursor-pointer ${sortField === 'price' ? 'text-blue-600' : ''}`}
            >
              Price {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {filteredAndSortedPlans.map((plan) => (
            <div
              key={plan.id}
              className="p-4 rounded-lg border border-gray-200"
            >
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
              </div>
              <div className="space-y-3">
                {plan.variants.map((variant, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{variant.name}</h4>
                        <p className="text-sm text-gray-600">
                          ${variant.price} / {variant.duration} months
                        </p>
                        {variant.isPopular && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <button className="text-red-600 hover:text-red-700">Delete</button>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {variant.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm text-gray-600 flex items-center">
                          <span className="mr-2">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredAndSortedPlans.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No membership plans found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipPlans; 