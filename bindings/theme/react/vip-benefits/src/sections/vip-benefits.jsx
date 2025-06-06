import React, { useEffect, useState } from "react";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import { Helmet } from "react-helmet-async";
import "../styles/style.css";

// VIP Feature Types Enum
const VIP_FEATURE_TYPES = {
  FLASH_SALE: "FLASH_SALE",
  CUSTOM_PROMOTIONS: "CUSTOM_PROMOTIONS",
  FREE_DELIVERY: "FREE_DELIVERY",
  ASK_FOR_INVENTORY: "ASK_FOR_INVENTORY",
};

const VIP_FEATURE_LABELS = {
  [VIP_FEATURE_TYPES.FLASH_SALE]: "Flash Sale Early Access",
  [VIP_FEATURE_TYPES.CUSTOM_PROMOTIONS]: "Custom Promotions",
  [VIP_FEATURE_TYPES.FREE_DELIVERY]: "Free Delivery",
  [VIP_FEATURE_TYPES.ASK_FOR_INVENTORY]: "Ask for Inventory",
};

// Fallback icons if backend doesn't provide image
const VIP_FEATURE_FALLBACK_ICONS = {
  [VIP_FEATURE_TYPES.FLASH_SALE]: "⚡",
  [VIP_FEATURE_TYPES.CUSTOM_PROMOTIONS]: "🎯",
  [VIP_FEATURE_TYPES.FREE_DELIVERY]: "🚚",
  [VIP_FEATURE_TYPES.ASK_FOR_INVENTORY]: "📦",
};

// Helper function to check if running on client
const isRunningOnClient = () => {
  return typeof window !== "undefined";
};

export function Component({ props, globalConfig }) {
  const fpi = useFPI();
  const state = fpi.store.getState();

  console.log("state draft benefits 3", state, fpi.getters.THEME(state));

  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const platformData = useGlobalStore(fpi.getters.PLATFORM_DATA);
  console.log("platform data", platformData);
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVipUser, setIsVipUser] = useState(false);

  const {
    section_background_color,
    section_text_color,
    title_font_family,
    description_font_family,
    title_font_size,
    description_font_size,
    title_font_weight,
    card_background_color,
    card_border_color,
    section_title,
    section_subtitle,
  } = props;

  // Get company and application IDs from platform data
  const getCompanyAndAppId = () => {
    // You can extract these from platformData or fpi context
    // For now using fallback values - replace with actual logic
    const application_id = fpi.getters.THEME(state)?.application_id;
    const company_id = fpi.getters.THEME(state)?.company_id;
    // const companyId = company_id || "10253";
    // const applicationId = application_id || "6838178d9fdd289461be895e";

    const companyId = "10253";
    const applicationId = "6838178d9fdd289461be895e";
    return { companyId, applicationId };
  };

  // Fetch benefits from Boltic API
  const fetchBenefits = async () => {
    try {
      setLoading(true);
      const { companyId, applicationId } = getCompanyAndAppId();

      const queryParams = new URLSearchParams({
        module: "configs",
        queryType: "scan",
        companyId: companyId
        // applicationId: applicationId,
      }).toString();
      
      const response = await fetch(
        `https://fetch-db-data-d9ca324b.serverless.boltic.app?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const benefitsData = result.data[0].benefits || [];
        console.log("benefitsData", benefitsData);
        // Filter only active benefits
        const activeBenefits = benefitsData.filter(
          (benefit) => benefit.isEnabled === true
        );
        console.log("activeBenefits",activeBenefits)
        setBenefits(activeBenefits);
      } else {
        setBenefits([]);
      }
    } catch (err) {
      console.error("Error fetching benefits:", err);
      setError("Failed to load VIP benefits");
    } finally {
      setLoading(false);
    }
  };

  // Check VIP status (placeholder - replace with actual logic)
  const checkVipStatus = async () => {
    if (isLoggedIn) {
      // TODO: Implement actual VIP check logic
      setIsVipUser(true); // Set to true for testing
    }
  };

  useEffect(() => {
    checkVipStatus();
  }, [isLoggedIn]);

  useEffect(() => {
    // Fetch benefits for all logged-in users
    if (isLoggedIn) {
      fetchBenefits();
    }
  }, [isLoggedIn]);

  // Show to all users, but don't render if not logged in
  if (!isLoggedIn) {
    return null;
  }

  // Get messaging based on VIP status
  const getHeaderText = () => {
    if (isVipUser) {
      return {
        title: section_title?.value || "✨ Your VIP Benefits",
        subtitle:
          section_subtitle?.value ||
          "Enjoy these exclusive perks as our valued VIP member",
      };
    } else {
      return {
        title: section_title?.value || "🌟 VIP Benefits",
        subtitle:
          section_subtitle?.value ||
          "Upgrade to VIP and unlock these amazing benefits",
      };
    }
  };

  // Get status text based on VIP status
  const getStatusBadge = () => {
    if (isVipUser) {
      return {
        text: "✓ Active",
        className: "active",
      };
    } else {
      return {
        text: "⭐ Upgrade to VIP",
        className: "upgrade",
      };
    }
  };

  // Get icon for benefit type - use backend image or fallback emoji
  const getBenefitIcon = (title, img) => {
    if (img && img.trim() !== "") {
      return img;
    }
    return VIP_FEATURE_FALLBACK_ICONS[title] || "⭐";
  };

  // Get label for benefit type
  const getBenefitLabel = (title) => {
    return VIP_FEATURE_LABELS[title] || title;
  };

  // Dynamic styles based on props
  const sectionStyle = {
    backgroundColor: section_background_color?.value || "#f8f9fa",
    color: section_text_color?.value || "#333333",
    padding: "40px 20px",
    minHeight: "400px",
  };

  const titleStyle = {
    fontFamily: title_font_family?.value || "inherit",
    fontSize: title_font_size?.value || "32px",
    fontWeight: title_font_weight?.value || "700",
    color: section_text_color?.value || "#333333",
  };

  const descriptionStyle = {
    fontFamily: description_font_family?.value || "inherit",
    fontSize: description_font_size?.value || "16px",
    color: section_text_color?.value || "#666666",
  };

  const cardStyle = {
    backgroundColor: card_background_color?.value || "#ffffff",
    borderColor: card_border_color?.value || "#e0e0e0",
  };

  if (loading) {
    return (
      <div className="vip-benefits-section" style={sectionStyle}>
        <div className="vip-benefits-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your VIP benefits...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vip-benefits-section" style={sectionStyle}>
        <div className="vip-benefits-container">
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (benefits.length === 0) {
    return (
      <div className="vip-benefits-section" style={sectionStyle}>
        <div className="vip-benefits-container">
          <div className="no-benefits">
            <h3>🌟 VIP Benefits Coming Soon!</h3>
            <p>
              We're preparing amazing exclusive benefits. Please check back
              soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>VIP Benefits - Exclusive Member Perks</title>
        <meta
          name="description"
          content="Discover your exclusive VIP member benefits and perks"
        />
      </Helmet>

      <div className="vip-benefits-section" style={sectionStyle}>
        <div className="vip-benefits-container">
          <div className="vip-benefits-header">
            <h2 className="vip-benefits-title" style={titleStyle}>
              {getHeaderText().title}
            </h2>
            <p className="vip-benefits-subtitle" style={descriptionStyle}>
              {getHeaderText().subtitle}
            </p>
          </div>

          <div className="vip-benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="vip-benefit-card" style={cardStyle}>
                <div className="benefit-icon">
                  {getBenefitIcon(benefit.title, benefit.img) ? (
                    typeof getBenefitIcon(benefit.title, benefit.img) ===
                      "string" &&
                    getBenefitIcon(benefit.title, benefit.img).startsWith(
                      "http"
                    ) ? (
                      <img
                        src={getBenefitIcon(benefit.title, benefit.img)}
                        alt={getBenefitLabel(benefit.title)}
                        className="benefit-icon-image"
                      />
                    ) : (
                      <span className="benefit-icon-emoji">
                        {getBenefitIcon(benefit.title, benefit.img)}
                      </span>
                    )
                  ) : (
                    <span className="benefit-icon-emoji">⭐</span>
                  )}
                </div>

                <div className="benefit-content">
                  <h3 className="benefit-title" style={titleStyle}>
                    {getBenefitLabel(benefit.title)}
                  </h3>

                  <p className="benefit-description" style={descriptionStyle}>
                    {benefit.description}
                  </p>
                </div>

                <div className="benefit-status">
                  <span
                    className={`status-badge ${getStatusBadge().className}`}
                  >
                    {getStatusBadge().text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export const settings = {
  label: "VIP Benefits",
  name: "vip-benefits",
  props: [
    {
      id: "section_title",
      label: "Section Title",
      type: "text",
      default: "",
      info: "Main heading (auto-generated based on VIP status if empty)",
    },
    {
      id: "section_subtitle",
      label: "Section Subtitle",
      type: "textarea",
      default: "",
      info: "Subtitle description (auto-generated based on VIP status if empty)",
    },
    {
      id: "section_background_color",
      label: "Section Background Color",
      type: "color",
      default: "#f8f9fa",
      info: "Background color for the entire section",
    },
    {
      id: "section_text_color",
      label: "Section Text Color",
      type: "color",
      default: "#333333",
      info: "Primary text color for the section",
    },
    {
      id: "card_background_color",
      label: "Card Background Color",
      type: "color",
      default: "#ffffff",
      info: "Background color for benefit cards",
    },
    {
      id: "card_border_color",
      label: "Card Border Color",
      type: "color",
      default: "#e0e0e0",
      info: "Border color for benefit cards",
    },
    {
      id: "title_font_family",
      label: "Title Font Family",
      type: "font",
      default: "inherit",
      info: "Font family for titles (e.g., 'Arial, sans-serif')",
    },
    {
      id: "description_font_family",
      label: "Description Font Family",
      type: "font",
      default: "inherit",
      info: "Font family for descriptions",
    },
    {
      id: "title_font_size",
      label: "Title Font Size",
      type: "text",
      default: "24px",
      info: "Font size for benefit titles",
    },
    {
      id: "description_font_size",
      label: "Description Font Size",
      type: "text",
      default: "16px",
      info: "Font size for benefit descriptions",
    },
    {
      id: "title_font_weight",
      label: "Title Font Weight",
      type: "select",
      default: "700",
      options: [
        { value: "400", text: "Normal" },
        { value: "500", text: "Medium" },
        { value: "600", text: "Semi Bold" },
        { value: "700", text: "Bold" },
        { value: "800", text: "Extra Bold" },
      ],
      info: "Font weight for titles",
    },
  ],
  blocks: [],
};
