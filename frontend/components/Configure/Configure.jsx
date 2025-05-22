import React, { useState } from 'react';

const Configure = () => {
  const [activeTab, setActiveTab] = useState('membership');
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [inputPages, setInputPages] = useState([]);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    variants: [
      {
        name: '',
        price: '',
        duration: '',
        features: [''],
        isPopular: false
      }
    ]
  });

  const [newInputPage, setNewInputPage] = useState({
    title: '',
    slug: '',
    html: '',
    css: '',
    js: ''
  });

  const handleAddVariant = () => {
    setNewPlan({
      ...newPlan,
      variants: [
        ...newPlan.variants,
        {
          name: '',
          price: '',
          duration: '',
          features: [''],
          isPopular: false
        }
      ]
    });
  };

  const handleRemoveVariant = (index) => {
    const updatedVariants = newPlan.variants.filter((_, i) => i !== index);
    setNewPlan({
      ...newPlan,
      variants: updatedVariants
    });
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...newPlan.variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value
    };
    setNewPlan({
      ...newPlan,
      variants: updatedVariants
    });
  };

  const handleFeatureChange = (variantIndex, featureIndex, value) => {
    const updatedVariants = [...newPlan.variants];
    updatedVariants[variantIndex].features[featureIndex] = value;
    setNewPlan({
      ...newPlan,
      variants: updatedVariants
    });
  };

  const handleAddFeature = (variantIndex) => {
    const updatedVariants = [...newPlan.variants];
    updatedVariants[variantIndex].features.push('');
    setNewPlan({
      ...newPlan,
      variants: updatedVariants
    });
  };

  const handleRemoveFeature = (variantIndex, featureIndex) => {
    const updatedVariants = [...newPlan.variants];
    updatedVariants[variantIndex].features = updatedVariants[variantIndex].features.filter((_, i) => i !== featureIndex);
    setNewPlan({
      ...newPlan,
      variants: updatedVariants
    });
  };

  const handleAddPlan = (e) => {
    e.preventDefault();
    setMembershipPlans([...membershipPlans, { ...newPlan, id: Date.now() }]);
    setNewPlan({
      name: '',
      description: '',
      variants: [
        {
          name: '',
          price: '',
          duration: '',
          features: [''],
          isPopular: false
        }
      ]
    });
  };

  const handleAddInputPage = (e) => {
    e.preventDefault();
    setInputPages([...inputPages, { ...newInputPage, id: Date.now() }]);
    setNewInputPage({
      title: '',
      slug: '',
      html: '',
      css: '',
      js: ''
    });
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Configure VIP Settings</h1>
          <p className="text-gray-600">Manage your VIP membership plans and settings</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('membership')}
              className={`${
                activeTab === 'membership'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Membership Plans
            </button>
            <button
              onClick={() => setActiveTab('input-pages')}
              className={`${
                activeTab === 'input-pages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Input Pages
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              General Settings
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'membership' ? (
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
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
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

                      <div className="flex items-center">
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
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Plan
                </button>
              </form>
            </div>

            {/* Existing Plans */}
            <div className="p-6 rounded-lg bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Existing Plans</h2>
              <div className="space-y-6">
                {membershipPlans.map((plan) => (
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
                {membershipPlans.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No membership plans created yet
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'input-pages' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create New Input Page Form */}
            <div className="p-6 rounded-lg bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Create New Input Page</h2>
              <form onSubmit={handleAddInputPage} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Page Title</label>
                  <input
                    type="text"
                    value={newInputPage.title}
                    onChange={(e) => setNewInputPage({ ...newInputPage, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., VIP Registration Form"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Page Slug</label>
                  <input
                    type="text"
                    value={newInputPage.slug}
                    onChange={(e) => setNewInputPage({ ...newInputPage, slug: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., vip-registration"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">HTML</label>
                  <textarea
                    value={newInputPage.html}
                    onChange={(e) => setNewInputPage({ ...newInputPage, html: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    rows="10"
                    placeholder="Enter your HTML code here"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">CSS</label>
                  <textarea
                    value={newInputPage.css}
                    onChange={(e) => setNewInputPage({ ...newInputPage, css: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    rows="10"
                    placeholder="Enter your CSS code here"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">JavaScript</label>
                  <textarea
                    value={newInputPage.js}
                    onChange={(e) => setNewInputPage({ ...newInputPage, js: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    rows="10"
                    placeholder="Enter your JavaScript code here"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Input Page
                </button>
              </form>
            </div>

            {/* Existing Input Pages */}
            <div className="p-6 rounded-lg bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Existing Input Pages</h2>
              <div className="space-y-4">
                {inputPages.map((page) => (
                  <div
                    key={page.id}
                    className="p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{page.title}</h3>
                        <p className="text-sm text-gray-600">/{page.slug}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700">Edit</button>
                        <button className="text-red-600 hover:text-red-700">Delete</button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">HTML:</span> {page.html.length} characters
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">CSS:</span> {page.css.length} characters
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">JS:</span> {page.js.length} characters
                      </div>
                    </div>
                  </div>
                ))}
                {inputPages.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No input pages created yet
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">General Settings</h2>
            {/* Add your general settings form here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Configure;