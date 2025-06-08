import React, { useEffect, useState } from "react";
import { useFPI } from "fdk-core/utils";
import { Helmet } from "react-helmet-async";
import styles from "../styles/style.css";
import { ProductCard } from "../components/ProductCard";

// Query to fetch detailed product information
export const GET_PRODUCT_DETAILS = `query($slug: String!)  {
  product(slug: $slug) {
    brand {
      name
      uid
    }
    color
    item_code
    item_type
    uid
    media {
      alt
      type
      url
    }
    name
    price {
      effective {
        currency_code
        currency_symbol
        max
        min
      }
      marked {
        currency_code
        currency_symbol
        max
        min
      }
    }
    rating
    rating_count
    short_description
    slug
  }
}`;

export function Component({ title = "VIP Products" }) {
  const fpi = useFPI();
  const state = fpi.store.getState();

  console.log("state draft benefits 3", state, fpi.getters.THEME(state));

  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  // State for products and VIP validation
  const [productItems, setProductItems] = useState([]);
  const [isVipUser, setIsVipUser] = useState(false);
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const APPLICATION_ID =
    fpi.getters.THEME(state)?.application_id || "683178a4b531714af0e04a53";
  const COMPANY_ID = fpi.getters.THEME(state)?.company_id || "10253";

  const USER_ID =
    useGlobalStore(fpi.getters.USER_DATA)?.user_id ||
    "682c158a3d88c46a01efac53";
  // const USER_ID = "682c158a3d88c46a01efac53";

  // Function to fetch campaign data
  const fetchCampaignData = async () => {
    try {
      const response = await fetch(
        `https://fetch-db-data-d9ca324b.serverless.boltic.app?companyId=${COMPANY_ID}&queryType=validate&applicationId=${APPLICATION_ID}&module=campaigns`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch campaign data");
      }

      const data = await response.json();
      console.log("Campaign data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching campaign data:", error);
      throw error;
    }
  };

  // Function to validate VIP user
  const validateVIPUser = async () => {
    try {
      const response = await fetch(
        `https://fetch-db-data-d9ca324b.serverless.boltic.app?module=users&companyId=${COMPANY_ID}&queryType=validate&id=${USER_ID}&applicationId=${APPLICATION_ID}`,
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
      console.log("VIP user validation:", data);
      return data;
    } catch (error) {
      console.error("Error validating VIP user:", error);
      throw error;
    }
  };

  // Function to check if campaign is currently active
  const isCampaignActive = (campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    return now >= startDate && now <= endDate;
  };

  // Function to fetch product details by item code
  const fetchProductDetails = async (itemCode) => {
    try {
      console.log(`Fetching details for item code: ${itemCode}`);
      const payload = { slug: itemCode };
      const response = await fpi.executeGQL(GET_PRODUCT_DETAILS, payload);

      if (response?.data?.product) {
        console.log(`Product details for ${itemCode}:`, response.data.product);
        return response.data.product;
      } else {
        console.warn(`No product found for item code: ${itemCode}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching details for product ${itemCode}:`, error);
      return null;
    }
  };

  // Function to fetch all products from campaign
  const fetchCampaignProducts = async (campaignProducts) => {
    const products = [];

    for (const product of campaignProducts) {
      if (product.item_code) {
        const productDetails = await fetchProductDetails(product.item_code);
        if (productDetails) {
          products.push(productDetails);
        }
      }
    }

    return products;
  };

  useEffect(() => {
    const initializeVIPValidation = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch campaign data
        console.log("Fetching campaign data...");
        const campaignResponse = await fetchCampaignData();

        if (campaignResponse.success && campaignResponse.data.length > 0) {
          const campaigns = campaignResponse.data;

          // Check for active campaigns
          const activeCampaigns = campaigns.filter((campaign) =>
            isCampaignActive(campaign)
          );

          if (activeCampaigns.length > 0) {
            console.log("Active campaigns found:", activeCampaigns);
            const activeCampaign = activeCampaigns[0]; // Use the first active campaign
            setCampaignData(activeCampaign);

            // Log product item codes from campaign
            if (activeCampaign.products && activeCampaign.products.length > 0) {
              console.log(
                "VIP Product item codes:",
                activeCampaign.products.map((product) => product.item_code)
              );

              // Step 2: Fetch product details for all campaign products
              const campaignProducts = await fetchCampaignProducts(
                activeCampaign.products
              );
              setProductItems(campaignProducts);
            }

            // Step 3: Validate VIP user
            console.log("Validating VIP user...");
            const userResponse = await validateVIPUser();

            if (
              userResponse.success &&
              userResponse.data &&
              userResponse.data.length > 0
            ) {
              console.log("VIP user validation successful:", userResponse.data);
              setIsVipUser(true);
            } else {
              console.log("User is not a VIP member");
              setIsVipUser(false);
            }
          } else {
            console.log("No active campaigns found");
            setCampaignData(null);
          }
        } else {
          console.log("No campaigns found");
          setCampaignData(null);
        }
      } catch (err) {
        console.error("Error in VIP validation process:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeVIPValidation();
  }, []);

  if (loading) {
    return <h2>Loading products...</h2>;
  }

  if (error) {
    return <h2>Error: {error}</h2>;
  }

  if (!productItems.length) {
    return <h2>No VIP Products Found</h2>;
  }

  return (
    <div>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <h1>VIP Products</h1>
      {!isVipUser && campaignData && (
        <div className={styles.vipMessage || ""}>
          <p>These products will be available once you buy the membership.</p>
        </div>
      )}
      <div className={styles.container}>
        {productItems.map((product) => {
          // Log item code for each product
          console.log(
            "Product item code:",
            product.item_code || "No item code available"
          );

          return (
            <ProductCard
              product={product}
              key={product.slug || product.item_code}
              isVipOnly={!isVipUser}
            />
          );
        })}
      </div>
    </div>
  );
}

// Server-side fetching logic
Component.serverFetch = ({ fpi }) => {
  // We don't need to fetch anything on the server side
  // as we'll fetch campaign data and products client-side
  return Promise.resolve();
};

// Settings
export const settings = {
  label: "VIP Page Products Section",
  name: "vip-page-products-section",
  props: [
    {
      id: "title",
      label: "Page Title",
      type: "text",
      default: "VIP Products",
      info: "Set the page title for the product list.",
    },
  ],
  blocks: [],
};
