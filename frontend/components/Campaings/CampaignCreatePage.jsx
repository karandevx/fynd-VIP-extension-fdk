import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import CampaignStepper from './CampaignStepper';
import EmailTemplateForm from './EmailTemplateForm';

const CampaignCreatePage = ({
  currentStep,
  setCurrentStep,
  setShowCreateCampaign,
  setShowProductModal,
  setShowCustomerModal,
  selectedProducts,
  selectedCustomers,
  methods,
  onSubmit: handleFormSubmit,
  errors,
  watch,
  register,
  handleIndividualProductSelect,
  handleIndividualCustomerSelect
}) => {
  
  const { handleSubmit, getValues } = methods;

  // State for custom validation errors
  const [dateError, setDateError] = useState('');
  const [productError, setProductError] = useState('');
  const [customerError, setCustomerError] = useState('');

  const onSubmit = (data) => {
    // Clear previous errors
    setDateError('');
    setProductError('');
    setCustomerError('');

    const { startDate, endDate } = data;

    // Date validation
    if (new Date(startDate) > new Date(endDate)) {
      setDateError('Start date must be before or the same as the end date.');
      return;
    }

    // Product validation
    if (selectedProducts.length === 0) {
      setProductError('Please select at least one product.');
      return;
    }

    // Customer validation
    if (selectedCustomers.length === 0) {
      setCustomerError('Please select at least one customer.');
      return;
    }

    // If all validations pass
    if (currentStep === 1) {
      console.log('Campaign Details Step:', {
        campaignData: data,
        selectedProducts,
        selectedCustomers,
        timestamp: new Date().toISOString()
      });
      setCurrentStep(2);
    } else {
      // Handle final submission
      console.log('Campaign Creation Complete:', {
        campaignData: data,
        selectedProducts,
        selectedCustomers,
        timestamp: new Date().toISOString()
      });
      setShowCreateCampaign(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex justify-center items-center">
      <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-xl">
        {/* Header */}
        <div className="mb-8 border-b pb-6 flex justify-between items-center">
          <div>
            <p className="text-3xl font-bold text-gray-800">Create Campaign</p>
            <p className="mt-1 !text-base text-gray-600">Set up your new marketing campaign</p>
          </div>
          <button
            onClick={() => setShowCreateCampaign(false)}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none font-light"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <CampaignStepper currentStep={currentStep} />
        </div>

        {/* Form Content */}
        <div className="space-y-6">
           <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 ? (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                    <input
                      type="text"
                      id="campaignName"
                      {...register('name', { required: 'Campaign name is required' })}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {errors.name && (
                      <p className="mt-2 !text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      id="description"
                      {...register('description', { required: 'Description is required' })}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      rows="3"
                    />
                    {errors.description && (
                      <p className="mt-2 !text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        {...register('startDate', { required: 'Start date is required' })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      {errors.startDate && (
                        <p className="mt-2 !text-sm text-red-600">{errors.startDate.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        id="endDate"
                        {...register('endDate', { required: 'End date is required' })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      {errors.endDate && (
                        <p className="mt-2 !text-sm text-red-600">{errors.endDate.message}</p>
                      )}
                    </div>
                    {dateError && (
                      <p className="mt-2 !text-sm text-red-600 col-span-full">{dateError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Products</label>
                    <button
                      type="button"
                      onClick={() => setShowProductModal(true)}
                      className="flex justify-between items-center w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                    >
                      <span>{selectedProducts.length} products selected</span>
                      <span className="ml-2 text-gray-400">→</span>
                    </button>
                    {productError && (
                      <p className="mt-2 !text-sm text-red-600">{productError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customers</label>
                    <button
                      type="button"
                      onClick={() => setShowCustomerModal(true)}
                      className="flex justify-between items-center w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                    >
                      <span>{selectedCustomers.length} customers selected</span>
                      <span className="ml-2 text-gray-400">→</span>
                    </button>
                    {customerError && (
                      <p className="mt-2 !text-sm text-red-600">{customerError}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setShowCreateCampaign(false)}
                      className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-150 ease-in-out shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <EmailTemplateForm setCurrentStep={setCurrentStep} />
              )}
            </form>
           </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default CampaignCreatePage; 