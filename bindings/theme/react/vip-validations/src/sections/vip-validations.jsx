import React, { useEffect, useState } from "react";

import { useGlobalStore, useFPI } from "fdk-core/utils";
import { Helmet } from "react-helmet-async";
import styles from "../styles/style.css";
import { ProductCard } from "../components/ProductCard";
import { useNavigate } from "react-router-dom";

// import { useSnackbar } from "../../helper/hooks";

const CART_UPDATE = `mutation UpdateCart($areaCode: String, $b: Boolean, $buyNow: Boolean, $i: Boolean, $updateCartId: String, $updateCartRequestInput: UpdateCartRequestInput, $cartType: String) {
  updateCart(areaCode: $areaCode, b: $b, buyNow: $buyNow, i: $i, id: $updateCartId, updateCartRequestInput: $updateCartRequestInput, cartType: $cartType) {
      message
      success
      cart {
        buy_now
        cart_id
        checkout_mode
        comment
        coupon_text
        delivery_charge_info
        gstin
        id
        is_valid
        last_modified
        message
        pan_config
        pan_no
        restrict_checkout
        uid
        breakup_values {
          coupon {
            code
            coupon_type
            coupon_value
            description
            is_applied
            message
            minimum_cart_value
            sub_title
            title
            type
            uid
            value
          }
          display {
            currency_code
            currency_symbol
            display
            key
            message
            value
            preset
          }
          loyalty_points {
            applicable
            description
            is_applied
            total
          }
        }
        delivery_promise {
          formatted {
            max
            min
          }
          timestamp {
            max
            min
          }
        }
        coupon {
          cashback_amount
          cashback_message_primary
          cashback_message_secondary
          coupon_code
          coupon_description
          coupon_id
          coupon_subtitle
          coupon_title
          coupon_type
          coupon_value
          discount
          is_applied
          is_valid
          message
          minimum_cart_value
        }
        applied_promo_details {
          amount
          article_quantity
          code
          meta
          mrp_promotion
          offer_text
          promo_id
          promotion_group
          promotion_name
          promotion_type
          applied_free_articles {
            article_id
            parent_item_identifier
            quantity
          }
        }
        currency {
          code
          symbol
        }
        items {
          bulk_offer
          coupon_message
          custom_order
          discount
          is_set
          key
          message
          moq
          parent_item_identifiers
          product_ean_id
          quantity
          article {
            _custom_json
            cart_item_meta
            extra_meta
            gift_card
            identifier
            is_gift_visible
            meta
            mto_quantity
            parent_item_identifiers
            product_group_tags
            quantity
            seller_identifier
            size
            tags
            type
            uid
            seller {
              name
              uid
            }
            price {
              base {
                currency_code
                currency_symbol
                effective
                marked
              }
              converted {
                currency_code
                currency_symbol
                effective
                marked
              }
            }
          }
          coupon {
            code
            discount_single_quantity
            discount_total_quantity
          }
          charges {
            meta
            name
            allow_refund
            code
            type
            amount {
              currency
              value
            }
          }
          identifiers {
            identifier
          }
          delivery_promise {
            formatted {
              max
              min
            }
            timestamp {
              max
              min
            }
            iso {
              max
              min
            }
          }
          availability {
            deliverable
            is_valid
            other_store_quantity
            out_of_stock
            sizes
            available_sizes {
              display
              is_available
              value
            }
          }
          price {
            base {
              currency_code
              currency_symbol
              effective
              marked
            }
            converted {
              currency_code
              currency_symbol
              effective
              marked
            }
          }
          price_per_unit {
            base {
              currency_code
              currency_symbol
              effective
              marked
              selling_price
            }
          }
          product {
            _custom_json
            attributes
            item_code
            name
            slug
            tags
            type
            uid
            action {
              type
              url
              query {
                product_slug
              }
            }
            brand {
              name
              uid
            }
            categories {
              name
              uid
            }
            images {
              aspect_ratio
              secure_url
              url
            }
          }
          promo_meta {
            message
          }
        }
      }
  }
}`;
export function Component({ props }) {
  console.log(": drafting 4");
  const fpi = useFPI();
  const navigate = useNavigate();
  // const { alert } = useSnackbar();
  const [campaignData, setCampaignData] = useState(null);
  const [userValidation, setUserValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCartUpdating, setIsCartUpdating] = useState(false);

  const pageDetails = useGlobalStore(fpi.getters.PAGE);
  const CART_ITEMS = useGlobalStore(fpi.getters.CART);
  const PRODUCT = useGlobalStore(fpi.getters.PRODUCT);

  // Static IDs as requested
  const COMPANY_ID = "10253";
  const APPLICATION_ID = "6828309ae4f8062f0c847089";
  const USER_ID = "683817d98fbf32007a149c91";

  console.log("pageDetails", pageDetails);
  console.log("using fpi in vip validations", fpi);
  console.log("CART_ITEMS", CART_ITEMS);
  console.log("PRODUCT hellooo", PRODUCT);

  const productsListData = useGlobalStore(fpi?.getters?.PRODUCTS);
  console.log("productsListData>>>", productsListData);

  // Function to fetch campaign data
  const fetchCampaignData = async () => {
    try {
      const response = await fetch(
        `https://fetch-db-data-d9ca324b.serverless.boltic.app?companyId=${COMPANY_ID}&module=campaigns`,
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
        `https://fetch-db-data-d9ca324b.serverless.boltic.app?module=users&companyId=${COMPANY_ID}&queryType=validate&id=${USER_ID}&applicationId=6838178d9fdd289461be895e`,
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

  // Function to check if campaign is currently active
  const isCampaignActive = (campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);

    return now >= startDate && now <= endDate;
  };

  // Function to remove cart item
  const removeCartItem = async (itemDetails, itemSize, itemIndex) => {
    try {
      setIsCartUpdating(true);

      const payload = {
        b: true,
        i: true,
        updateCartRequestInput: {
          items: [
            {
              article_id: `${itemDetails?.product?.uid}_${itemSize}`,
              item_id: itemDetails?.product?.uid,
              item_size: itemSize,
              item_index: itemIndex,
              quantity: 0,
              identifiers: {
                identifier: itemDetails?.identifiers?.identifier,
              },
            },
          ],
          operation: "remove_item",
        },
      };

      const res = await fpi.executeGQL(CART_UPDATE, payload, {
        skipStoreUpdate: true,
      });

      setIsCartUpdating(false);

      if (res?.data?.updateCart?.success) {
        alert("VIP exclusive item removed from cart", "info");
        console.log("Item removed successfully:", itemDetails?.product?.name);
        window.location.reload();
        //TODO: CALL GET CART HERE AGAIN.
      } else {
        alert(
          res?.data?.updateCart?.message || "Failed to remove item",
          "error"
        );
      }

      return res?.data?.updateCart;
    } catch (error) {
      console.error("Error removing cart item:", error);
      alert("An error occurred while removing the item", "error");
      setIsCartUpdating(false);
    }
  };

  // Function to check and remove VIP-only items from cart
  const validateAndCleanCart = (activeCampaign, isVipUser) => {
    if (!CART_ITEMS?.cart_items?.items || !activeCampaign?.products) {
      return;
    }

    const cartItems = CART_ITEMS.cart_items.items;
    // const campaignProducts = activeCampaign.products;
    const campaignProducts = [
      {
        item_code: "marv5rue_KD",
      },
    ];
    console.log("activeCampaign", activeCampaign);
    // Create a set of campaign product codes for quick lookup
    const campaignProductCodes = new Set(
      campaignProducts.map((product) => product.item_code?.toLowerCase())
    );

    console.log("Campaign product codes:", campaignProductCodes);
    console.log("Is VIP user:", isVipUser);

    // Check each cart item
    cartItems.forEach((cartItem, index) => {
      const itemCode = cartItem?.product?.item_code?.toLowerCase();

      console.log("Checking cart item:", {
        name: cartItem?.product?.name,
        item_code: itemCode,
        inCampaign: campaignProductCodes.has(itemCode),
      });

      // If item is part of VIP campaign and user is not VIP, remove it
      if (itemCode && campaignProductCodes.has(itemCode) && !isVipUser) {
        console.log(
          "Removing VIP-only item from cart:",
          cartItem?.product?.name
        );

        removeCartItem(
          cartItem,
          cartItem?.article?.size || cartItem?.size,
          index
        );
      }
    });
  };

  // Function to validate product page access
  const validateProductPageAccess = (activeCampaign, isVipUser) => {
    // Check if we're on a product page
    const currentPath = window.location.pathname;

    if (
      !currentPath.includes("/product/") ||
      !PRODUCT ||
      !activeCampaign?.products
    ) {
      return;
    }

    const productData = PRODUCT;
    const productItemCode = productData?.item_code?.toLowerCase();

    console.log("Product page validation:", {
      path: currentPath,
      product_item_code: productItemCode,
      is_vip: isVipUser,
    });

    if (!productItemCode) {
      return;
    }

    // Create a set of campaign product codes for quick lookup
    const campaignProductCodes = new Set(
      activeCampaign.products.map((product) => product.item_code?.toLowerCase())
    );

    // If product is VIP-only and user is not VIP
    if (campaignProductCodes.has(productItemCode) && !isVipUser) {
      console.log("Non-VIP user trying to access VIP product, redirecting...");

      // Show alert
      alert("This product is exclusive to VIP members only", "error");

      // Redirect back or to homepage
      setTimeout(() => {
        if (window.history.length > 1) {
          navigate(-1); // Go back
        } else {
          navigate("/"); // Go to homepage
        }
      }, 2000);
    }
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

            // Step 2: If there's an active campaign, validate VIP user
            console.log("Validating VIP user...");
            const userResponse = await validateVIPUser();
            // const userResponse = { success: true, data: [{ user_id: "683817d98fbf32007a149c91" }] };
            let isVipUser = false;
            if (
              userResponse.success &&
              userResponse.data &&
              userResponse.data.length > 0
            ) {
              console.log("VIP user validation successful:", userResponse.data);
              setUserValidation(userResponse.data[0]);
              isVipUser = true;
            } else {
              console.log("VIP user validation failed - user is not VIP");
              setUserValidation(null);
              isVipUser = false;
            }

            // Step 3: Perform validations
            console.log("Performing cart and product validations...");

            // Validate and clean cart
            validateAndCleanCart(activeCampaign, isVipUser);

            // Validate product page access
            validateProductPageAccess(activeCampaign, isVipUser);
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
  }, [CART_ITEMS, PRODUCT, pageDetails]); // Re-run when cart, product, or page changes

  // Show loading indicator if cart is being updated
  if (isCartUpdating) {
    return (
      <div className="vip-validation-updating">
        <p>Updating cart...</p>
      </div>
    );
  }

  // Render main content (empty for now as requested)
  return <>{/* Component runs validation in background */}</>;
}

export const settings = {
  label: "VIP validations",
  name: "vip-validations",
  props: [],
  blocks: [],
};
