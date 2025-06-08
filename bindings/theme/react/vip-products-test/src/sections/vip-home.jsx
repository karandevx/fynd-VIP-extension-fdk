import React, { useEffect, useState, useCallback } from "react";
import { FDKLink } from "fdk-core/components";
import { useGlobalStore, useFPI } from "fdk-core/utils";

const USER_DATA_QUERY = `query User {
  user {
    logged_in_user {
      id
      account_type
      active
      dob
      first_name
      gender
      last_name
      profile_pic_url
      user_id
      username
      emails {
        active
        email
        primary
        verified
      }
      phone_numbers {
        active
        country_code
        phone
        primary
        verified
      }
    }
    has_password {
        result
    }
  }
  followedListing(
    collectionType: "products"
  ) {
    items {
      uid
    }
    page {
      current
      next_id
      has_previous
      has_next
      item_total
      type
      size
    }
  }
}`;

// Helper function to check if running on client
const isRunningOnClient = () => {
  return typeof window !== "undefined";
};

export function Component({ props, globalConfig }) {
  const fpi = useFPI();
    const state = fpi.store.getState();
  const platformData = useGlobalStore(fpi.getters.PLATFORM_DATA);
  console.log("platformData", platformData);
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);

  const [isMobile, setIsMobile] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [userData, setUserData] = useState(null);
  const [isVipUser, setIsVipUser] = useState(false);
  const [isLoadingVipStatus, setIsLoadingVipStatus] = useState(false);

  const COMPANY_ID = fpi.getters.THEME(state)?.company_id || "10253";
  const APPLICATION_ID = fpi.getters.THEME(state)?.application_id;
  const USER_ID = useGlobalStore(fpi.getters.USER_DATA)?.user_id || "682c158a3d88c46a01efac53";

  const {
    image_desktop_non_vip,
    image_mobile_non_vip,
    image_desktop_vip,
    image_mobile_vip,
    vip_cta_link,
    non_vip_banner_link,
  } = props;

  // Function to validate VIP user using Boltics API
  const validateVIPUser = async (userId = USER_ID) => {
    try {
      const response = await fetch(
        `https://fetch-db-data-d9ca324b.serverless.boltic.app?module=users&companyId=${COMPANY_ID}&queryType=validate&id=${userId}&applicationId=${APPLICATION_ID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to validate VIP user");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error validating VIP user:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (isRunningOnClient()) {
      const localDetectMobileWidth = () =>
        document?.getElementsByTagName("body")?.[0]?.getBoundingClientRect()
          ?.width <= 768;

      const handleResize = () => {
        setWindowWidth(window?.innerWidth);
      };
      setIsMobile(localDetectMobileWidth());

      window?.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  useEffect(() => {
    const fetchUserDataAndValidateVIP = async () => {
      if (isLoggedIn) {
        try {
          setIsLoadingVipStatus(true);
          console.log("Fetching user data...");

          // Get FPI user data
          const res = await fpi.executeGQL(USER_DATA_QUERY);
          console.log("User data fetched", res);
          setUserData(res);

          // Extract user ID for VIP validation (you might need to adjust this based on your user ID mapping)
          const fpiUserId = res?.data?.user?.logged_in_user?.id;
          console.log("FPI User ID:", fpiUserId);

          // Call Boltics API to validate VIP status
          console.log("Validating VIP status with Boltics API...");
          const vipValidationResponse = await validateVIPUser(USER_ID); // You might want to use fpiUserId here if you have a mapping

          console.log("VIP validation response:", vipValidationResponse);

          // Check if user is VIP based on API response
          let vipStatus = false;
          if (
            vipValidationResponse.success &&
            vipValidationResponse.data &&
            vipValidationResponse.data.length > 0
          ) {
            vipStatus = true;
            console.log("User is VIP:", vipValidationResponse.data[0]);
          } else {
            console.log("User is not VIP");
          }

          setIsVipUser(vipStatus);
        } catch (error) {
          console.error(
            "Error fetching user data or validating VIP status:",
            error
          );
          // Default to non-VIP on error
          setIsVipUser(false);
        } finally {
          setIsLoadingVipStatus(false);
        }
      } else {
        // User not logged in, reset states
        setUserData(null);
        setIsVipUser(false);
        setIsLoadingVipStatus(false);
      }
    };

    fetchUserDataAndValidateVIP();
  }, [isLoggedIn, fpi]);

  // Get the appropriate images based on VIP status
  const getMobileImage = () => {
    if (isVipUser) {
      return image_mobile_vip?.value !== "" ? image_mobile_vip?.value : "";
    } else {
      return image_mobile_non_vip?.value !== ""
        ? image_mobile_non_vip?.value
        : "";
    }
  };

  const getDesktopImage = () => {
    if (isVipUser) {
      return image_desktop_vip?.value !== "" ? image_desktop_vip?.value : "";
    } else {
      return image_desktop_non_vip?.value !== ""
        ? image_desktop_non_vip?.value
        : "";
    }
  };

  // Get the appropriate link based on VIP status
  const getBannerLink = () => {
    if (isVipUser) {
      return vip_cta_link?.value || "";
    } else {
      return non_vip_banner_link?.value || "";
    }
  };

  // Get current image based on screen size
  const getCurrentImage = () => {
    if (isRunningOnClient() && window.innerWidth <= 768) {
      return getMobileImage();
    }
    return getDesktopImage();
  };

  const vipHomeContainerStyle = {
    paddingBottom: `${globalConfig?.section_margin_bottom || 0}px`,
    maxWidth: "100%",
    margin: "0 auto",
  };

  const imageContainerStyle = {
    width: "100%",
    position: "relative",
    aspectRatio:
      isRunningOnClient() && window.innerWidth <= 768 ? "4/5" : "19/6",
    overflow: "hidden",
  };

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    cursor: getBannerLink().length > 0 ? "pointer" : "default",
  };

  const loadingStyle = {
    width: "100%",
    height: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
  };

  // Don't render anything if user is not logged in
  if (!isLoggedIn) {
    return null;
  }

  // Show loading state while validating VIP status
  if (isLoadingVipStatus) {
    return (
      <div style={vipHomeContainerStyle}>
        <div style={loadingStyle}>
          <p>Loading personalized content...</p>
        </div>
      </div>
    );
  }

  const currentImage = getCurrentImage();

  // Don't render if no image is available
  if (!currentImage) {
    return null;
  }

  console.log("Rendering VIP Home Banner:", {
    isVipUser,
    currentImage,
    bannerLink: getBannerLink(),
  });

  const imageElement = (
    <div style={imageContainerStyle}>
      <img
        src={currentImage}
        alt={`${isVipUser ? "VIP" : "Non-VIP"} Home Banner`}
        style={imageStyle}
        onLoad={() => setImgLoaded(true)}
        loading="eager"
      />
    </div>
  );

  return (
    <div style={vipHomeContainerStyle}>
      {getBannerLink().length > 0 ? (
        <FDKLink to={getBannerLink()}>{imageElement}</FDKLink>
      ) : (
        imageElement
      )}
    </div>
  );
}

export const settings = {
  label: "VIP Home Page",
  name: "vip-home",
  props: [
    {
      type: "image_picker",
      id: "image_desktop_non_vip",
      label: "Desktop Image (Non-VIP)",
      default: "",
      options: {
        aspect_ratio: "19:6",
        aspect_ratio_strict_check: true,
      },
    },
    {
      type: "image_picker",
      id: "image_mobile_non_vip",
      label: "Mobile Image (Non-VIP)",
      default: "",
      options: {
        aspect_ratio: "4:5",
        aspect_ratio_strict_check: true,
      },
    },
    {
      type: "image_picker",
      id: "image_desktop_vip",
      label: "Desktop Image (VIP)",
      default: "",
      options: {
        aspect_ratio: "19:6",
        aspect_ratio_strict_check: true,
      },
    },
    {
      type: "image_picker",
      id: "image_mobile_vip",
      label: "Mobile Image (VIP)",
      default: "",
      options: {
        aspect_ratio: "4:5",
        aspect_ratio_strict_check: true,
      },
    },
    {
      type: "url",
      id: "vip_cta_link",
      default: "",
      label: "VIP CTA Link (for VIP members)",
    },
    {
      type: "url",
      id: "non_vip_banner_link",
      default: "",
      label: "Non-VIP Banner Link",
    },
  ],
  blocks: [],
};
