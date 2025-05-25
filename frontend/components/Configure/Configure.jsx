import React, { useState } from 'react';
import MembershipPlans from './MembershipPlans';
import InputPages from './InputPages';
import AccessConfig from './AccessConfig';

const Configure = () => {
  // Membership Plans State
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    variants: [
      {
        name: '',
        price: '',
        duration: '',
        features: [''],
        isPopular: false,
        media: null
      }
    ]
  });

  // Input Pages State
  const [inputPages, setInputPages] = useState([]);
  const [newPage, setNewPage] = useState({
    name: '',
    description: '',
    type: '',
    required: false
  });

  // Access Config State
  const [accessConfig, setAccessConfig] = useState({
    clientId: '',
    clientSecret: '',
    enabled: false
  });

  // Common State for Search and Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Active Tab State
  const [activeTab, setActiveTab] = useState('membership');

  // Membership Plans Handlers
  const handleAddPlan = (e) => {
    e.preventDefault();
    console.log('Adding new membership plan:', {
      plan: newPlan,
      timestamp: new Date().toISOString()
    });
    const newPlanWithId = {
      ...newPlan,
      id: Date.now().toString(),
      variants: newPlan.variants.map(variant => ({
        ...variant,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      }))
    };
    setMembershipPlans([...membershipPlans, newPlanWithId]);
    setNewPlan({
      name: '',
      description: '',
      variants: [
        {
          name: '',
          price: '',
          duration: '',
          features: [''],
          isPopular: false,
          media: null
        }
      ]
    });
  };

  const handleAddVariant = () => {
    setNewPlan({
      ...newPlan,
      variants: [
        ...newPlan.variants,
        {
          name: '',
          price: '',
          duration: '',
          features: [''],
          isPopular: false,
          media: null
        }
      ]
    });
  };

  const handleRemoveVariant = (variantIndex) => {
    const updatedVariants = newPlan.variants.filter((_, index) => index !== variantIndex);
    setNewPlan({ ...newPlan, variants: updatedVariants });
  };

  const handleVariantChange = (variantIndex, field, value) => {
    const updatedVariants = newPlan.variants.map((variant, index) => {
      if (index === variantIndex) {
        return { ...variant, [field]: value };
      }
      return variant;
    });
    setNewPlan({ ...newPlan, variants: updatedVariants });
  };

  const handleFeatureChange = (variantIndex, featureIndex, value) => {
    const updatedVariants = newPlan.variants.map((variant, vIndex) => {
      if (vIndex === variantIndex) {
        const updatedFeatures = variant.features.map((feature, fIndex) => {
          if (fIndex === featureIndex) {
            return value;
          }
          return feature;
        });
        return { ...variant, features: updatedFeatures };
      }
      return variant;
    });
    setNewPlan({ ...newPlan, variants: updatedVariants });
  };

  const handleAddFeature = (variantIndex) => {
    const updatedVariants = newPlan.variants.map((variant, index) => {
      if (index === variantIndex) {
        return { ...variant, features: [...variant.features, ''] };
      }
      return variant;
    });
    setNewPlan({ ...newPlan, variants: updatedVariants });
  };

  const handleRemoveFeature = (variantIndex, featureIndex) => {
    const updatedVariants = newPlan.variants.map((variant, vIndex) => {
      if (vIndex === variantIndex) {
        const updatedFeatures = variant.features.filter((_, fIndex) => fIndex !== featureIndex);
        return { ...variant, features: updatedFeatures };
      }
      return variant;
    });
    setNewPlan({ ...newPlan, variants: updatedVariants });
  };

  const handleMediaUpload = (variantIndex, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedVariants = newPlan.variants.map((variant, index) => {
          if (index === variantIndex) {
            return {
              ...variant,
              media: {
                file,
                preview: reader.result
              }
            };
          }
          return variant;
        });
        setNewPlan({ ...newPlan, variants: updatedVariants });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = (variantIndex) => {
    const updatedVariants = newPlan.variants.map((variant, index) => {
      if (index === variantIndex) {
        return { ...variant, media: null };
      }
      return variant;
    });
    setNewPlan({ ...newPlan, variants: updatedVariants });
  };

  // Input Pages Handlers
  const handleAddPage = (e) => {
    e.preventDefault();
    console.log('Adding new input page:', {
      page: newPage,
      timestamp: new Date().toISOString()
    });
    const newPageWithId = {
      ...newPage,
      id: Date.now().toString()
    };
    setInputPages([...inputPages, newPageWithId]);
    setNewPage({
      name: '',
      description: '',
      type: '',
      required: false
    });
  };

  const handleRemovePage = (pageId) => {
    setInputPages(inputPages.filter(page => page.id !== pageId));
  };

  const handlePageChange = (pageId, field, value) => {
    setInputPages(inputPages.map(page => {
      if (page.id === pageId) {
        return { ...page, [field]: value };
      }
      return page;
    }));
  };

  // Access Config Handlers
  const handleSaveAccessConfig = (e) => {
    e.preventDefault();
    console.log('Saving access configuration:', {
      config: accessConfig,
      timestamp: new Date().toISOString()
    });
    // Here you would typically make an API call to save the access configuration
  };

  // Common Handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and Sort Logic
  const filteredAndSortedPlans = membershipPlans
    .filter(plan => {
      const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'popular' && plan.variants.some(v => v.isPopular));
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'name') {
        return direction * a.name.localeCompare(b.name);
      }
      if (sortField === 'price') {
        const aPrice = Math.min(...a.variants.map(v => parseFloat(v.price)));
        const bPrice = Math.min(...b.variants.map(v => parseFloat(v.price)));
        return direction * (aPrice - bPrice);
      }
      return 0;
    });

  const filteredAndSortedPages = inputPages
    .filter(page => {
      const matchesSearch = page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'required' && page.required);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'name') {
        return direction * a.name.localeCompare(b.name);
      }
      if (sortField === 'type') {
        return direction * a.type.localeCompare(b.type);
      }
      return 0;
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="!text-2xl font-bold text-gray-900">Configure VIP Extension</h1>
        <p className="mt-2 text-gray-600 !text-base">
          Manage your membership plans, input pages, and access configuration
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
        <button
            onClick={() => setActiveTab('access')}
            className={`${
              activeTab === 'access'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 hover:cursor-pointer px-1 border-b-2 font-medium text-sm`}
          >
            Access Configuration
          </button>
          <button
            onClick={() => setActiveTab('membership')}
            className={`${
              activeTab === 'membership'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap hover:cursor-pointer py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Membership Plans
          </button>
          <button
            onClick={() => setActiveTab('input')}
            className={`${
              activeTab === 'input'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap hover:cursor-pointer py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Input Pages
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'membership' && (
          <MembershipPlans
            membershipPlans={membershipPlans}
            newPlan={newPlan}
            setNewPlan={setNewPlan}
            handleAddPlan={handleAddPlan}
            handleAddVariant={handleAddVariant}
            handleRemoveVariant={handleRemoveVariant}
            handleVariantChange={handleVariantChange}
            handleFeatureChange={handleFeatureChange}
            handleAddFeature={handleAddFeature}
            handleRemoveFeature={handleRemoveFeature}
            handleMediaUpload={handleMediaUpload}
            handleRemoveMedia={handleRemoveMedia}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
            filteredAndSortedPlans={filteredAndSortedPlans}
          />
        )}

        {activeTab === 'input' && (
          <InputPages
            inputPages={inputPages}
            newPage={newPage}
            setNewPage={setNewPage}
            handleAddPage={handleAddPage}
            handleRemovePage={handleRemovePage}
            handlePageChange={handlePageChange}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
            filteredAndSortedPages={filteredAndSortedPages}
          />
        )}

        {activeTab === 'access' && (
          <AccessConfig
            accessConfig={accessConfig}
            setAccessConfig={setAccessConfig}
            handleSaveAccessConfig={handleSaveAccessConfig}
          />
        )}
      </div>
    </div>
  );
};

export default Configure;