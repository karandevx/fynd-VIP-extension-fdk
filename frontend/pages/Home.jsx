import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import "./style/home.css";
import greenDot from "../public/assets/green-dot.svg";
import grayDot from "../public/assets/grey-dot.svg";
import DEFAULT_NO_IMAGE from "../public/assets/default_icon_listing.png";
import loaderGif from "../public/assets/loader.gif";
import axios from "axios";
import urlJoin from "url-join";
import { customers } from "../constants/customers";

const EXAMPLE_MAIN_URL = window.location.origin;

export const Home = () => {
  const [pageLoading, setPageLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const DOC_URL_PATH = "/help/docs/sdk/latest/platform/company/catalog/#getProducts";
  const DOC_APP_URL_PATH = "/help/docs/sdk/latest/platform/application/catalog#getAppProducts";
  const { application_id, company_id } = useParams();
  const documentationUrl = 'https://api.fynd.com';
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("firstname");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterVipRatio, setFilterVipRatio] = useState(0);
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  useEffect(() => {
    isApplicationLaunch() ? fetchApplicationProducts() : fetchProducts();
  }, [application_id]);

  useEffect(() => {
    let result = [...customers];

    if (searchTerm) {
      result = result.filter(customer => 
        customer.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.mobile.includes(searchTerm)
      );
    }

    if (filterVipRatio > 0) {
      result = result.filter(customer => customer.vipRatio >= filterVipRatio);
    }

    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCustomers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, sortField, sortDirection, filterVipRatio]);

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
      });
      setProductList(data.items);
    } catch (e) {
      console.error("Error fetching application products:", e);
    } finally {
      setPageLoading(false);
    }
  };

  const getDocumentPageLink = () => {
    return documentationUrl
      .replace("api", "partners")
      .concat(isApplicationLaunch() ? DOC_APP_URL_PATH : DOC_URL_PATH);
  };

  const isApplicationLaunch = () => !!application_id;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-indigo-600 hover:bg-indigo-50 transition-colors'
        } border border-gray-200`}
      >
        <span className="sr-only">Previous</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 rounded-md text-sm font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition-colors border border-gray-200"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2 py-1">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            currentPage === i
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-indigo-600 hover:bg-indigo-50 transition-colors'
          } border border-gray-200`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2 py-1">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 rounded-md text-sm font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition-colors border border-gray-200"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-indigo-600 hover:bg-indigo-50 transition-colors'
        } border border-gray-200`}
      >
        <span className="sr-only">Next</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );

    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl text-center w-full font-extrabold text-gray-900 tracking-tight">
            Customer Management
            <span className="block text-xl tracking-normal font-medium text-gray-500 mt-1">
              {filteredCustomers.length} total customers
            </span>
          </h1>
          
          {pageLoading ? (
            <div className="bg-white p-2 rounded-md shadow flex items-center">
              <svg className="animate-spin h-5 w-5 text-indigo-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium text-gray-700">Loading...</span>
            </div>
          ) : null}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative rounded-md shadow-sm flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-4 py-3 border-gray-300 rounded-md text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-64 flex-shrink-0">
                <select
                  className="w-full block focus:ring-indigo-500 focus:border-indigo-500 py-3 pl-3 pr-10 border-gray-300 rounded-md text-sm"
                  value={filterVipRatio}
                  onChange={(e) => setFilterVipRatio(Number(e.target.value))}
                >
                  <option value="0">All VIP Ratios</option>
                  <option value="50">VIP Ratio ≥ 50%</option>
                  <option value="75">VIP Ratio ≥ 75%</option>
                  <option value="90">VIP Ratio ≥ 90%</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Column Headers */}
          <div className="grid grid-cols-12 items-center bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div 
              className="col-span-3 flex items-center space-x-1 cursor-pointer hover:text-indigo-700"
              onClick={() => handleSort("firstname")}
            >
              <span>Name</span>
              {sortField === "firstname" && (
                <svg className={`w-4 h-4 ${sortDirection === "asc" ? "" : "transform rotate-180"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0zM10 15.586l-3.293-3.293a1 1 0 11.414-1.414L10 14.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Mobile</div>
            <div 
              className="col-span-1 flex items-center space-x-1 cursor-pointer hover:text-indigo-700"
              onClick={() => handleSort("totalOrderCount")}
            >
              <span>Orders</span>
              {sortField === "totalOrderCount" && (
                <svg className={`w-4 h-4 ${sortDirection === "asc" ? "" : "transform rotate-180"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0zM10 15.586l-3.293-3.293a1 1 0 11.414-1.414L10 14.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="col-span-1">Order No</div>
            <div 
              className="col-span-2 flex items-center space-x-1 cursor-pointer hover:text-indigo-700"
              onClick={() => handleSort("vipRatio")}
            >
              <span>VIP Ratio</span>
              {sortField === "vipRatio" && (
                <svg className={`w-4 h-4 ${sortDirection === "asc" ? "" : "transform rotate-180"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0zM10 15.586l-3.293-3.293a1 1 0 11.414-1.414L10 14.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          
          {/* Customer Data */}
          <div className="divide-y divide-gray-200">
            {currentCustomers.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              currentCustomers.map((customer) => (
                <div key={customer.id} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-800 font-medium text-sm">
                          {customer.firstname.charAt(0)}{customer.lastname.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.firstname} {customer.lastname}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 text-sm text-gray-600 truncate">
                    {customer.email}
                  </div>
                  <div className="col-span-2 text-sm text-gray-600">
                    {customer.mobile}
                  </div>
                  <div className="col-span-1 text-sm font-medium text-gray-900">
                    {customer.totalOrderCount}
                  </div>
                  <div className="col-span-1 text-sm text-gray-600">
                    {customer.totalOrderNo}
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            customer.vipRatio >= 90 ? 'bg-green-500' : 
                            customer.vipRatio >= 75 ? 'bg-blue-500' : 
                            customer.vipRatio >= 50 ? 'bg-indigo-500' : 
                            'bg-gray-500'
                          } transition-all duration-300`}
                          style={{ width: `${customer.vipRatio}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-900">{customer.vipRatio}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination */}
          {currentCustomers.length > 0 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, filteredCustomers.length)}</span> of <span className="font-medium">{filteredCustomers.length}</span> results
              </div>
              <div className="flex space-x-1">
                {renderPagination()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
