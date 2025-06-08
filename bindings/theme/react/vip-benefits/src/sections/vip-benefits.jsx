import React, { useEffect, useState } from "react";
import { useGlobalStore, useFPI } from "fdk-core/utils";
// import { Helmet } from "react-helmet-async";

import styles from "../styles/style.css";
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

// Default images for benefits if not provided
const DEFAULT_BENEFIT_IMAGES = {
  [VIP_FEATURE_TYPES.FLASH_SALE]:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop",
  [VIP_FEATURE_TYPES.CUSTOM_PROMOTIONS]:
    "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400&h=200&fit=crop",
  [VIP_FEATURE_TYPES.FREE_DELIVERY]:
    "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&h=200&fit=crop",
  [VIP_FEATURE_TYPES.ASK_FOR_INVENTORY]:
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=200&fit=crop",
};

// Helper function to check if running on client
const isRunningOnClient = () => {
  return typeof window !== "undefined";
};

export function Component({ props, globalConfig }) {
  console.log("new section");
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
    const state = fpi.store.getState();
    const application_id = fpi.getters.THEME(state)?.application_id;
    const company_id = fpi.getters.THEME(state)?.company_id;
    const companyId = company_id || "10253";
    const applicationId = application_id || "6838178d9fdd289461be895e";
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
        companyId: companyId,
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
        const activeBenefits = benefitsData.filter(
          (benefit) => benefit.isEnabled === true
        );
        console.log("activeBenefits", activeBenefits);
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

  // Check VIP status
  const checkVipStatus = async () => {
    if (isLoggedIn) {
      setIsVipUser(true); // Set to true for testing
    }
  };

  useEffect(() => {
    checkVipStatus();
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchBenefits();
    }
  }, [isLoggedIn]);

  //   if (!isLoggedIn) {
  //     return null;
  //   }

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

  // Get icon for benefit type
  const getBenefitIcon = (benefit) => {
    // First check if benefit has an img property and it's not empty
    if (benefit.img && benefit.img.trim() !== "") {
      return benefit.img;
    }
    // Fallback to predefined icons based on benefit title
    return VIP_FEATURE_FALLBACK_ICONS[benefit.title] || "⭐";
  };

  // Get image for benefit
  const getBenefitImage = (benefit) => {
    // First check if benefit has an imageUrl property and it's not empty
    if (benefit.imageUrl && benefit.imageUrl.trim() !== "") {
      return benefit.imageUrl;
    }
    // Then check if benefit has an img property that could be used as image
    if (benefit.img && benefit.img.trim() !== "") {
      return benefit.img;
    }
    // Fallback to default images based on benefit title
    return DEFAULT_BENEFIT_IMAGES[benefit.title];
  };

  // Get label for benefit type
  const getBenefitLabel = (title) => {
    return VIP_FEATURE_LABELS[title] || title;
  };

  // Dynamic styles based on props
  const sectionStyle = {
    backgroundColor: section_background_color?.value || "#667eea",
    color: section_text_color?.value || "#ffffff",
    background:
      section_background_color?.value ||
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  };

  const titleStyle = {
    fontFamily: title_font_family?.value || "'Inter', sans-serif",
    fontSize: title_font_size?.value || "3.5rem",
    fontWeight: title_font_weight?.value || "800",
    color: section_text_color?.value || "#ffffff",
  };

  const descriptionStyle = {
    fontFamily: description_font_family?.value || "'Inter', sans-serif",
    fontSize: description_font_size?.value || "1.25rem",
    color: section_text_color?.value || "rgba(255, 255, 255, 0.9)",
  };

  const cardStyle = {
    backgroundColor:
      card_background_color?.value || "rgba(255, 255, 255, 0.95)",
    borderColor: card_border_color?.value || "rgba(255, 255, 255, 0.2)",
  };

  if (loading) {
    return (
      <div className={styles["vip-benefits-section"]} style={sectionStyle}>
        <div className={styles["vip-benefits-container"]}>
          <div className={styles["floating-elements"]}></div>
          <div className={styles.particles}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={styles.particle}></div>
            ))}
          </div>
          <div className={styles["loading-spinner"]}>
            <div className={styles.spinner}></div>
            <p>Loading your VIP benefits...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["vip-benefits-section"]} style={sectionStyle}>
        <div className={styles["vip-benefits-container"]}>
          <div className={styles["error-message"]}>
            <p>⚠️ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (benefits.length === 0) {
    return (
      <div className={styles["vip-benefits-section"]} style={sectionStyle}>
        <div className={styles["vip-benefits-container"]}>
          <div className={styles["no-benefits"]}>
            <div className={styles["vip-crown"]}>👑</div>
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
      {/* <Helmet> */}
      <title>VIP Benefits - Exclusive Member Perks</title>
      <meta
        name="description"
        content="Discover your exclusive VIP member benefits and perks"
      />
      {/* </Helmet> */}

      <div className={styles["vip-benefits-section"]} style={sectionStyle}>
        <div className={styles["vip-benefits-container"]}>
          <div className={styles["floating-elements"]}></div>
          <div className={styles.particles}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={styles.particle}></div>
            ))}
          </div>

          <div className={styles["vip-benefits-header"]}>
            <div className={styles["vip-crown"]}>👑</div>
            <h2 className={styles["vip-benefits-title"]} style={titleStyle}>
              {getHeaderText().title}
            </h2>
            <p
              className={styles["vip-benefits-subtitle"]}
              style={descriptionStyle}
            >
              {getHeaderText().subtitle}
            </p>
          </div>

          <div className={styles["vip-benefits-grid"]}>
            {benefits.slice(0, 3).map((benefit, index) => (
              <div
                key={index}
                className={styles["vip-benefit-card"]}
                style={cardStyle}
              >
                <div
                  className={`${styles["benefit-icon"]} ${styles[`benefit-icon-${index + 1}`]}`}
                >
                  {getBenefitIcon(benefit) ? (
                    typeof getBenefitIcon(benefit) === "string" &&
                    getBenefitIcon(benefit).startsWith("http") ? (
                      <img
                        src={getBenefitIcon(benefit)}
                        alt={getBenefitLabel(benefit.title)}
                        className={styles["benefit-icon-image"]}
                      />
                    ) : (
                      <span className={styles["benefit-icon-emoji"]}>
                        {getBenefitIcon(benefit)}
                      </span>
                    )
                  ) : (
                    <span className={styles["benefit-icon-emoji"]}>⭐</span>
                  )}
                </div>

                <div className={styles["benefit-content"]}>
                  <h3 className={styles["benefit-title"]} style={titleStyle}>
                    {getBenefitLabel(benefit.title)}
                  </h3>

                  <div className={styles["benefit-image"]}>
                    <img
                      src={getBenefitImage(benefit)}
                      alt={getBenefitLabel(benefit.title)}
                      onError={(e) => {
                        e.target.src =
                          DEFAULT_BENEFIT_IMAGES[benefit.title] ||
                          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=200&fit=crop";
                      }}
                    />
                  </div>

                  <p
                    className={styles["benefit-description"]}
                    style={descriptionStyle}
                  >
                    {benefit.description}
                  </p>
                </div>

                <div className={styles["benefit-status"]}>
                  <button
                    className={`${styles["status-badge"]} ${styles[getStatusBadge().className]}`}
                  >
                    {getStatusBadge().text}
                  </button>
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
  label: "Enhanced VIP Benefits",
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
      default: "#667eea",
      info: "Background color for the entire section",
    },
    {
      id: "section_text_color",
      label: "Section Text Color",
      type: "color",
      default: "#ffffff",
      info: "Primary text color for the section",
    },
    {
      id: "card_background_color",
      label: "Card Background Color",
      type: "color",
      default: "rgba(255, 255, 255, 0.95)",
      info: "Background color for benefit cards",
    },
    {
      id: "card_border_color",
      label: "Card Border Color",
      type: "color",
      default: "rgba(255, 255, 255, 0.2)",
      info: "Border color for benefit cards",
    },
    {
      id: "title_font_family",
      label: "Title Font Family",
      type: "font",
      default: "'Inter', sans-serif",
      info: "Font family for titles",
    },
    {
      id: "description_font_family",
      label: "Description Font Family",
      type: "font",
      default: "'Inter', sans-serif",
      info: "Font family for descriptions",
    },
    {
      id: "title_font_size",
      label: "Title Font Size",
      type: "text",
      default: "1.5rem",
      info: "Font size for benefit titles",
    },
    {
      id: "description_font_size",
      label: "Description Font Size",
      type: "text",
      default: "1rem",
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
