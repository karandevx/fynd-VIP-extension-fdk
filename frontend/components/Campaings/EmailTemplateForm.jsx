import React from 'react';
import { useFormContext } from 'react-hook-form';

const EmailTemplateForm = ({ setCurrentStep }) => {
  const { register, formState: { errors }, watch } = useFormContext();

  // Placeholder function for regeneration
  const handleRegenerate = () => {
    const emailData = watch('emailTemplate');
    console.log('Email Template Regeneration:', {
      emailData,
      timestamp: new Date().toISOString()
    });
    // TODO: Implement regeneration logic
  };

  return (
    <div className="space-y-6">
      {/* Email Subject */}
      <div>
        <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
        <input
          type="text"
          id="emailSubject"
          {...register('emailTemplate.subject', { required: 'Subject is required' })}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {errors.emailTemplate?.subject && (
          <p className="mt-2 text-sm text-red-600">{errors.emailTemplate.subject.message}</p>
        )}
      </div>

      {/* Email Content */}
      <div>
        <label htmlFor="emailContent" className="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
        <textarea
          id="emailContent"
          {...register('emailTemplate.content', { required: 'Content is required' })}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          rows="8"
        />
        {errors.emailTemplate?.content && (
          <p className="mt-2 text-sm text-red-600">{errors.emailTemplate.content.message}</p>
        )}
      </div>

      {/* Regenerate Button */}
      <div className="flex justify-start mt-4">
        <button
          type="button"
          onClick={handleRegenerate}
          className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition duration-150 ease-in-out shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Regenerate CTA and Preview
        </button>
      </div>

      {/* Email Preview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Email Preview</h3>
        <div className="border border-gray-200 rounded-md p-4 bg-gray-50 shadow-inner overflow-x-auto">
          {/* Render HTML content safely if needed, otherwise display as plain text */}
          {/* Using dangerouslySetInnerHTML for demonstration, consider a safer approach in production */}
          <div dangerouslySetInnerHTML={{ __html: watch('emailTemplate.content') }} className="prose max-w-none text-gray-800"></div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-150 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Campaign
        </button>
      </div>
    </div>
  );
};

export default EmailTemplateForm; 