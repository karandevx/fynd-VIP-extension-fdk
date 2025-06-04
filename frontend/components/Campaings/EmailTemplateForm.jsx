import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";

const EmailTemplateForm = ({
  setCurrentStep,
  setShowCreateCampaign,
  campaignId,
  companyId,
}) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    handleSubmit,
  } = useFormContext();

  // State for generated email HTML, loading, and generation count
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const [lastAutoPrompt, setLastAutoPrompt] = useState("");

  // Default subject
  const defaultSubject = "Exclusive VIP Offer Just for You!";

  // Helper to build the dynamic prompt
  const buildPrompt = (discount, startDate, endDate) => {
    const formatMonthDay = (dateString) => {
      if (!dateString) return "a future date";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "a future date";
      const options = { month: "long", day: "numeric" };
      return date.toLocaleDateString(undefined, options);
    };
    const formattedStartDate = formatMonthDay(startDate);
    const formattedEndDate = formatMonthDay(endDate);
    const discountTypeIndicator = discount?.type === "percentage" ? "%" : "";
    const discountValue = discount?.value || 0;
    return `I'm giving ${discountValue}${discountTypeIndicator} off to VIP users from ${formattedStartDate} to ${formattedEndDate}. Generate a responsive HTML email.`;
  };

  // Effect to set prompt on mount and when campaign fields change
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (
        [
          "discount",
          "discount.type",
          "discount.value",
          "startDate",
          "endDate",
        ].includes(name)
      ) {
        const campaignData = watch();
        const { discount, startDate, endDate } = campaignData;
        const autoPrompt = buildPrompt(discount, startDate, endDate);
        const currentPrompt = watch("emailTemplate.prompt");
        // Only update if the prompt is empty or matches the last auto-generated prompt
        if (!currentPrompt || currentPrompt === lastAutoPrompt) {
          setValue("emailTemplate.prompt", autoPrompt);
          setLastAutoPrompt(autoPrompt);
        }
      }
    });
    // On mount, set prompt if empty
    const campaignData = watch();
    const { discount, startDate, endDate } = campaignData;
    const autoPrompt = buildPrompt(discount, startDate, endDate);
    const currentPrompt = watch("emailTemplate.prompt");
    if (!currentPrompt) {
      setValue("emailTemplate.prompt", autoPrompt);
      setLastAutoPrompt(autoPrompt);
    }
    return () => subscription.unsubscribe();
  }, [watch, setValue, lastAutoPrompt]);

  // Regenerate handler
  const handleRegenerate = async () => {
    if (isGenerating || generationCount >= 3) return;
    setIsGenerating(true);
    setGenerationCount((prev) => prev + 1);
    setGeneratedHtml("");
    try {
      const currentPrompt = watch("emailTemplate.prompt");
      const payload = {
        type: "generate_email",
        prompt: currentPrompt,
        companyId,
      };
      const response = await axios.post(
        "https://create-campaign-af13fce1.serverless.boltic.app",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.data.success) {
        setGeneratedHtml(response.data.data);
        toast.success("Email template generated successfully!");
      } else {
        throw new Error(
          response.data.message || "Failed to generate email template"
        );
      }
    } catch (error) {
      toast.error(`Error generating email template: ${error.message}`);
      setGeneratedHtml("Failed to generate email. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler for Save Template (triggerNow: false) and Create Campaign (triggerNow: true)
  const handleScheduleEmail = async (triggerNow) => {
    const subject = watch("emailTemplate.subject") || defaultSubject;
    const htmlContent = generatedHtml;
    if (!campaignId || !companyId) {
      toast.error("Missing campaign or company ID.");
      return;
    }
    try {
      const payload = {
        type: "schedule_email",
        subject,
        companyId,
        campaignId,
        htmlContent,
        triggerNow,
      };
      const response = await axios.post(
        "https://create-campaign-af13fce1.serverless.boltic.app",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.data.success) {
        toast.success(
          triggerNow
            ? "Campaign email scheduled and sent!"
            : "Email template saved!"
        );
        setShowCreateCampaign(false);
        setCurrentStep && setCurrentStep(1); // Go back or close modal
      } else {
        throw new Error(response.data.message || "Failed to schedule email");
      }
    } catch (error) {
      toast.error(`Error scheduling email: ${error.message}`);
    }
  };

  // Form submit handler
  const onSubmit = async (event) => {
    event.preventDefault();
    console.log("api calllllll");
    // await handleScheduleEmail(true);
  };

  const buttonText =
    generationCount === 0 ? "Generate and Preview" : "Regenerate and Preview";
  const isButtonDisabled = isGenerating || generationCount >= 3;

  return (
    <form className="space-y-6">
      {/* Email Subject */}
      <div>
        <label
          htmlFor="emailSubject"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Subject
        </label>
        <input
          type="text"
          id="emailSubject"
          {...register("emailTemplate.subject")}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={defaultSubject}
          value={watch("emailTemplate.subject") || defaultSubject}
          onChange={(e) => setValue("emailTemplate.subject", e.target.value)}
        />
        {errors.emailTemplate?.subject && (
          <p className="mt-2 text-sm text-red-600">
            {errors.emailTemplate.subject.message}
          </p>
        )}
      </div>
      {/* Email Prompt */}
      <div>
        <label
          htmlFor="emailPrompt"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Prompt
        </label>
        <textarea
          id="emailPrompt"
          {...register("emailTemplate.prompt", {
            required: "Prompt is required",
          })}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          rows={4}
          value={watch("emailTemplate.prompt") || ""}
          onChange={(e) => setValue("emailTemplate.prompt", e.target.value)}
        />
        {errors.emailTemplate?.prompt && (
          <p className="mt-2 text-sm text-red-600">
            {errors.emailTemplate.prompt.message}
          </p>
        )}
      </div>
      {/* Regenerate Button */}
      <div className="flex justify-start mt-4">
        <button
          type="button"
          onClick={handleRegenerate}
          className={`px-4 py-2 bg-indigo-500 text-white rounded-md transition duration-150 ease-in-out shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isButtonDisabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-indigo-600"
          }`}
          disabled={isButtonDisabled}
        >
          {isGenerating ? "Generating..." : buttonText}
        </button>
        {generationCount > 0 && generationCount < 3 && (
          <span className="ml-4 text-sm text-gray-600">{`(${
            3 - generationCount
          } ${
            3 - generationCount === 1 ? "attempt" : "attempts"
          } remaining)`}</span>
        )}
        {generationCount >= 3 && (
          <span className="ml-4 text-sm text-red-600">
            Maximum generation attempts reached.
          </span>
        )}
      </div>
      {/* Email Preview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Email Preview
        </h3>
        <div className="border border-gray-200 rounded-md p-4 bg-gray-50 shadow-inner overflow-x-auto">
          {isGenerating ? (
            <p className="text-gray-500">Generating email preview...</p>
          ) : generatedHtml ? (
            <div
              dangerouslySetInnerHTML={{ __html: generatedHtml }}
              className="prose max-w-none text-gray-800"
            ></div>
          ) : (
            <p className="text-gray-500">
              Click 'Generate and Preview' to see the email content.
            </p>
          )}
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
          type="button"
          onClick={() => handleScheduleEmail(true)}
          name="send"
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Send Email
        </button>
      </div>
    </form>
  );
};

export default EmailTemplateForm;
