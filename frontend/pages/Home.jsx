import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import "./style/home.css";
import greenDot from "../public/assets/green-dot.svg";
import grayDot from "../public/assets/grey-dot.svg";
import DEFAULT_NO_IMAGE from "../public/assets/default_icon_listing.png";
import loaderGif from "../public/assets/loader.gif";
import axios from "axios";
import urlJoin from "url-join";

const EXAMPLE_MAIN_URL = window.location.origin;

export const Home = () => {
  const [pageLoading, setPageLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const DOC_URL_PATH = "/help/docs/sdk/latest/platform/company/catalog/#getProducts";
  const DOC_APP_URL_PATH = "/help/docs/sdk/latest/platform/application/catalog#getAppProducts";
  const { application_id, company_id } = useParams();
  const documentationUrl ='https://api.fynd.com'
  
  useEffect(() => {
    isApplicationLaunch() ? fetchApplicationProducts() : fetchProducts();
  }, [application_id]);

  const fetchProducts = async () => {
    setPageLoading(true);
    try {
      const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, '/api/products'),{
        headers: {
          "x-company-id": company_id,
        }
      });
      setProductList(data.items);
    } catch (e) {
      console.error("Error fetching products:", e);
    } finally {
      setPageLoading(false);
    }
  };

  const fetchApplicationProducts = async () => {
    setPageLoading(true);
    try {
      const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, `/api/products/application/${application_id}`),{
        headers: {
          "x-company-id": company_id,
        }
      })
      setProductList(data.items);
    } catch (e) {
      console.error("Error fetching application products:", e);
    } finally {
      setPageLoading(false);
    }
  };
  

  const productProfileImage = (media) => {
    if (!media || !media.length) {
      return DEFAULT_NO_IMAGE;
    }
    const profileImg = media.find(m => m.type === "image");
    return profileImg?.url || DEFAULT_NO_IMAGE;
  };

  const getDocumentPageLink = () => {
    return documentationUrl
      .replace("api", "partners")
      .concat(isApplicationLaunch() ? DOC_APP_URL_PATH : DOC_URL_PATH);
  };

  const isApplicationLaunch = () => !!application_id;

  return (
    <>
      {pageLoading ? (
        <div className="loader" data-testid="loader">
          <img src={loaderGif} alt="loader GIF" />
        </div>
      ) : (
        <div className="products-container">
          <div className="title text-5xl text-red-900">
            This is an example extension home page user interface.
          </div>

          <div className="section">
            <div className="heading">
              <span>Example {isApplicationLaunch() ? 'Application API' : 'Platform API'}</span> :
              <a href={getDocumentPageLink()} target="_blank" rel="noopener noreferrer">
                {isApplicationLaunch() ? 'getAppProducts' : 'getProducts'}
              </a>
            </div>
            <div className="description">
              This is an illustrative Platform API call to fetch the list of products
              in this company. Check your extension folder’s 'server.js'
              file to know how to call Platform API and start calling API you
              require.
            </div>
          </div>

          <div className="space-y-4">
  {productList.map((product, index) => (
    <div
      key={`product-${product.name}-${index}`}
      className="flex items-center gap-4 p-4 rounded-xl shadow-md bg-white hover:shadow-lg transition-shadow"
    >
      <img
        src={product.is_active ? greenDot : grayDot}
        alt="status"
        className="w-3 h-3 mt-1"
      />
      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-300">
        <img
          src={productProfileImage(product.media)}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <div data-testid={`product-name-${product.id}`}>{product.name}</div>
          {product.item_code && (
            <>
              <span className="text-gray-400">|</span>
              <span>
                Item Code:{" "}
                <span
                  className="text-blue-600"
                  data-testid={`product-item-code-${product.id}`}
                >
                  {product.item_code}
                </span>
              </span>
            </>
          )}
        </div>

        {product.brand && (
          <div
            className="text-xs text-gray-600"
            data-testid={`product-brand-name-${product.id}`}
          >
            {product.brand.name}
          </div>
        )}

        {product.category_slug && (
          <div
            className="text-xs text-gray-500"
            data-testid={`product-category-slug-${product.id}`}
          >
            Category: <span>{product.category_slug}</span>
          </div>
        )}
      </div>
    </div>
  ))}
          </div>
        </div>
      )}
    </>
  );
}
