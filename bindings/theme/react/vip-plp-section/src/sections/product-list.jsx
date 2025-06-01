import React, { useEffect, useState } from "react";
import { useGlobalStore, useFPI } from "fdk-core/utils";
// import { Helmet } from "react-helmet-async";

export function Component({ props }) {
 console.log(": VIP PLP Protection Component 1");
 const fpi = useFPI();
 const [campaignData, setCampaignData] = useState(null);
 const [userValidation, setUserValidation] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [observer, setObserver] = useState(null);

 const pageDetails = useGlobalStore(fpi.getters.PAGE);
 const productsListData = useGlobalStore(fpi?.getters?.PRODUCTS);

 // Static IDs as requested
 const COMPANY_ID = "10253";
 const APPLICATION_ID = "6828309ae4f8062f0c847089";
 const USER_ID = "683817d98fbf32007a149c91";

 console.log("pageDetails", pageDetails);
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

 // Function to extract item code from product slug
 const getItemCodeFromSlug = (href) => {
   try {
     console.log("Extracting item code from slug:", href,productsListData);
     // Extract slug from href like "/product/marv5rue_kd-14068839"
     const slug = href.split('/product/')[1]?.split('-')[0];
     console.log("Slug:", slug);
     if (!slug || !productsListData?.items) {
       return null;
     }

     // Find matching product in productsListData
     const product = productsListData.items.find(p =>
       p.slug?.toLowerCase() === slug?.toLowerCase()
     );

     console.log("Matching product:", product);
    
     return product?.item_code || slug; // Fallback to slug if item_code not found
   } catch (error) {
     console.error("Error extracting item code from slug:", error);
     return null;
   }
 };

 // Function to add VIP styles to document
 const addVIPStyles = () => {
  console.log("adding vip styles");
  //  if (document.getElementById('vip-protection-styles')) {
  //   console.log("Styles already added");
  //    return; // Styles already added
  //  }

   const style = document.createElement('style');
   style.id = 'vip-protection-styles';
   style.textContent = `
   .vip-overlay {
     position: absolute !important;
     top: 0 !important;
     left: 0 !important;
     right: 0 !important;
     bottom: 0 !important;
     background: linear-gradient(135deg, rgba(139, 69, 19, 0.95), rgba(255, 215, 0, 0.85)) !important;
     color: white !important;
     display: flex !important;
     flex-direction: column !important;
     align-items: center !important;
     justify-content: center !important;
     font-weight: bold !important;
     z-index: 10 !important;
     border-radius: 8px !important;
     text-align: center !important;
     backdrop-filter: blur(2px) !important;
     border: 2px solid #FFD700 !important;
     box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3) !important;
   }
 
   .vip-overlay::before {
     content: "👑" !important;
     font-size: 28px !important;
     margin-bottom: 8px !important;
     animation: vip-glow 2s ease-in-out infinite alternate !important;
   }
 
   .vip-overlay .vip-badge {
     background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700) !important;
     background-size: 200% 200% !important;
     animation: vip-shimmer 3s ease-in-out infinite !important;
     color: #8B4513 !important;
     padding: 8px 20px !important;
     border-radius: 25px !important;
     font-size: 13px !important;
     font-weight: 700 !important;
     letter-spacing: 1.5px !important;
     text-transform: uppercase !important;
     box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4) !important;
     border: 2px solid #8B4513 !important;
     text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
     margin-bottom: 6px !important;
   }
 
   .vip-overlay .vip-message {
     font-size: 11px !important;
     font-weight: 500 !important;
     color: #FFF8DC !important;
     text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5) !important;
     margin-top: 4px !important;
     opacity: 0.9 !important;
   }
 
   @keyframes vip-glow {
     0% { text-shadow: 0 0 5px #FFD700, 0 0 10px #FFD700, 0 0 15px #FFD700; }
     100% { text-shadow: 0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700; }
   }
 
   @keyframes vip-shimmer {
     0% { background-position: 0% 50%; }
     50% { background-position: 100% 50%; }
     100% { background-position: 0% 50%; }
   }
 
   .vip-product-disabled {
     pointer-events: none !important;
     opacity: 0.8 !important;
     filter: grayscale(0.2) !important;
     transition: all 0.3s ease !important;
   }
 
   .vip-cart-disabled {
     background: linear-gradient(45deg, #cccccc, #b8b8b8) !important;
     color: #666666 !important;
     cursor: not-allowed !important;
     border: 1px solid #cccccc !important;
     opacity: 0.7 !important;
     font-weight: 600 !important;
     text-transform: uppercase !important;
     letter-spacing: 0.5px !important;
   }
 
   .vip-cart-disabled:hover {
     background: linear-gradient(45deg, #cccccc, #b8b8b8) !important;
     color: #666666 !important;
     transform: none !important;
   }
 `;
   document.head.appendChild(style);
 };

 // Function to process product listing container
 const processProductListing = (campaignProductCodes, isVipUser) => {
   console.log("Processing product listing...", { campaignProductCodes, isVipUser });
  
   const container = document.querySelector('.product-listing__productContainer___oyoni');
   if (!container) {
     console.log("Product listing container not found");
     return;
   }

   const productLinks = container.querySelectorAll('a[href*="/product/"]');
  
   console.log(`Found ${productLinks.length} product links`);
  
   productLinks.forEach((link, index) => {
     const href = link.getAttribute('href');
     console.log("Processing link:", href);
     const itemCode = getItemCodeFromSlug(href);
    
     console.log(`Processing product ${index + 1}:`, { href, itemCode });
    
     if (itemCode) {
       // Add CSS ID with item code
       const productId = `product-${itemCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
       link.id = productId;
      
       // Check if product is VIP-only
       const isVipProduct = campaignProductCodes.has(itemCode.toLowerCase());
      
       console.log(`Product ${itemCode}:`, { isVipProduct, isVipUser });
      
       if (isVipProduct && !isVipUser) {
         console.log(`Blocking access to VIP product: ${itemCode}`);
        
         // Add disabled class to main link
         link.classList.add('vip-product-disabled');
        
         // Disable navigation
         link.addEventListener('click', (e) => {
           e.preventDefault();
           e.stopPropagation();
           alert('This product is exclusive to VIP members only!');
         });
        
         // Disable add to cart button
         const addToCartBtn = link.querySelector('.product-card__addToCart___KUnfH, button[aria-label*="cart"], button:contains("ADD TO CART")');
         if (addToCartBtn) {
           addToCartBtn.disabled = true;
           addToCartBtn.classList.add('vip-cart-disabled');
           addToCartBtn.innerHTML = '<span>VIP ONLY</span>';
          
           addToCartBtn.addEventListener('click', (e) => {
             e.preventDefault();
             e.stopPropagation();
             alert('This product is exclusive to VIP members only!');
           });
         }
        
         // Add VIP overlay/badge
         const productCard = link.querySelector('.product-card__productCard___VMIjd');
         if (productCard && !productCard.querySelector('.vip-overlay')) {
           // Ensure product card has relative positioning
           const computedStyle = window.getComputedStyle(productCard);
           if (computedStyle.position === 'static') {
             productCard.style.position = 'relative';
           }
          
           const overlay = document.createElement('div');
           overlay.className = 'vip-overlay';
           overlay.innerHTML = `
           <div class="vip-badge">VIP EXCLUSIVE</div>
           <div class="vip-message">Upgrade to VIP to unlock this product</div>
         `;
           productCard.appendChild(overlay);
         }
       } else {
         // Remove any existing VIP restrictions if user becomes VIP
         link.classList.remove('vip-product-disabled');
         const existingOverlay = link.querySelector('.vip-overlay');
         if (existingOverlay) {
           existingOverlay.remove();
         }
       }
     }
   });
 };

 // MutationObserver for dynamic content
 const setupMutationObserver = (campaignProductCodes, isVipUser) => {
   console.log("Setting up mutation observer...");
  
   const container = document.querySelector('.product-listing__productContainer___oyoni');
   if (!container) {
     console.log("Container not found for mutation observer");
     return null;
   }

   const mutationObserver = new MutationObserver((mutations) => {
     let shouldReprocess = false;
    
     mutations.forEach((mutation) => {
       if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
         // Check if any added nodes contain product links
         mutation.addedNodes.forEach((node) => {
           if (node.nodeType === 1) { // Element node
             const hasProductLinks = node.querySelector && (
               node.querySelector('a[href*="/product/"]') ||
               node.matches && node.matches('a[href*="/product/"]')
             );
             if (hasProductLinks) {
               shouldReprocess = true;
             }
           }
         });
       }
     });
    
     if (shouldReprocess) {
       console.log("New products detected, reprocessing...");
       setTimeout(() => {
         processProductListing(campaignProductCodes, isVipUser);
       }, 100); // Small delay to ensure DOM is fully updated
     }
   });

   mutationObserver.observe(container, {
     childList: true,
     subtree: true
   });

   return mutationObserver;
 };

 // Function to handle page route changes
 const handleRouteChange = (campaignProductCodes, isVipUser) => {
   const currentPath = window.location.pathname;
   console.log("Route change detected:", currentPath);
  
   // Check if we're on a listing page
   if (currentPath.includes('/products') ||
       currentPath.includes('/collections') ||
       currentPath.includes('/category') ||
       currentPath === '/') {
    
     // Wait for products to load then process
     setTimeout(() => {
       processProductListing(campaignProductCodes, isVipUser);
     }, 500);
   }
 };

 useEffect(() => {
   const initializeVIPPLPProtection = async () => {
     try {
       setLoading(true);
       setError(null);

       // Add VIP styles to document
       addVIPStyles();

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
           const activeCampaign = activeCampaigns[0];
           setCampaignData(activeCampaign);

           // Step 2: Validate VIP user
           console.log("Validating VIP user...");
           const userResponse = await validateVIPUser();
           let isVipUser = false;
          
           if (userResponse.success && userResponse.data && userResponse.data.length > 0) {
             console.log("VIP user validation successful:", userResponse.data);
             setUserValidation(userResponse.data[0]);
             isVipUser = true;
           } else {
             console.log("VIP user validation failed - user is not VIP");
             setUserValidation(null);
             isVipUser = false;
           }

           // Step 3: Create campaign product codes set
           // For testing - using hardcoded data
           const campaignProducts = [
             { item_code: "marv5rue_KD" },
             // Add more products from activeCampaign.products when available
           ];

           const campaignProductCodes = new Set(
             campaignProducts.map((product) => product.item_code?.toLowerCase())
           );

           console.log("Campaign product codes:", campaignProductCodes);
           console.log("Is VIP user:", isVipUser);

           // Step 4: Process current page
           handleRouteChange(campaignProductCodes, isVipUser);

           // Step 5: Setup mutation observer
           const mutationObserver = setupMutationObserver(campaignProductCodes, isVipUser);
           setObserver(mutationObserver);

           // Step 6: Listen for route changes (for SPA navigation)
           const originalPushState = history.pushState;
           const originalReplaceState = history.replaceState;

           history.pushState = function(...args) {
             originalPushState.apply(this, args);
             setTimeout(() => handleRouteChange(campaignProductCodes, isVipUser), 100);
           };

           history.replaceState = function(...args) {
             originalReplaceState.apply(this, args);
             setTimeout(() => handleRouteChange(campaignProductCodes, isVipUser), 100);
           };

           window.addEventListener('popstate', () => {
             setTimeout(() => handleRouteChange(campaignProductCodes, isVipUser), 100);
           });

         } else {
           console.log("No active campaigns found");
           setCampaignData(null);
         }
       } else {
         console.log("No campaigns found");
         setCampaignData(null);
       }
     } catch (err) {
       console.error("Error in VIP PLP protection process:", err);
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };

   initializeVIPPLPProtection();

   // Cleanup function
   return () => {
     if (observer) {
       observer.disconnect();
     }
   };
 }, [productsListData, pageDetails]);

 // Re-process when products data changes (infinite scroll, filters, etc.)
 useEffect(() => {
   if (campaignData && userValidation !== undefined) {
     const campaignProducts = [
       { item_code: "marv5rue_KD" },
     ];

     const campaignProductCodes = new Set(
       campaignProducts.map((product) => product.item_code?.toLowerCase())
     );

     const isVipUser = userValidation !== null;

     setTimeout(() => {
       processProductListing(campaignProductCodes, isVipUser);
     }, 100);
   }
 }, [productsListData]);

 if (loading) {
   return (
     <div style={{ display: 'none' }}>
       {/* VIP PLP Protection Loading... */}
     </div>
   );
 }

 if (error) {
   console.error("VIP PLP Protection Error:", error);
 }

 // Component runs protection logic in background
 return (
   <>
     
     {/* Component runs VIP protection logic in background */}
   </>
 );
}

export const settings = {
  label: "VIP PLP",
  name: "vip-plp-section",
  props: [
    {
      id: "title",
      label: "Page Title",
      type: "text",
      default: "Extension Title",
      info: "Page Title",
    },
  ],
  blocks: [],
};
