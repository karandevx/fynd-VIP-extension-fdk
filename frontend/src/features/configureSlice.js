import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import urlJoin from 'url-join';

// Fetch config (main entry)
export const fetchConfig = createAsyncThunk(
  'configure/fetchConfig',
  async (company_id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_FETCH_BACKEND_URL}?module=configs&companyId=${company_id}&queryType=scan`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success && response.data.data.length > 0) {
        return response.data.data[0];
      } else {
        throw new Error('No config found');
      }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Save access config
export const saveAccessConfig = createAsyncThunk(
  'configure/saveAccessConfig',
  async ({ company_id, clientId, clientSecret }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        {
          type: 'client_credentials',
          companyId: company_id,
          clientId,
          clientSecret,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Fetch VIP products
export const fetchVipProducts = createAsyncThunk(
  'configure/fetchVipProducts',
  async (company_id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        urlJoin(window.location.origin, '/api/products/vip-products'),
        { headers: { 'x-company-id': company_id } }
      );
      return data.items;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Save VIP products
export const saveVipProducts = createAsyncThunk(
  'configure/saveVipProducts',
  async ({ company_id, vipProducts }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        {
          type: 'product_create',
          companyId: company_id,
          vipProducts,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Save benefits
export const saveBenefits = createAsyncThunk(
  'configure/saveBenefits',
  async ({ company_id, benefits, applicationIds }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        {
          type: 'feature_benefits',
          companyId: company_id,
          benefits,
          applicationIds,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const configureSlice = createSlice({
  name: 'configure',
  initialState: {
    loading: false,
    error: null,
    config: null,
    accessConfig: {
      clientId: '',
      clientSecret: '',
      enabled: true,
    },
    vipProducts: [],
    benefits: [],
    salesChannels: [],
    saving: false,
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setAccessConfig: (state, action) => {
      state.accessConfig = action.payload;
    },
    setVipProducts: (state, action) => {
      state.vipProducts = action.payload;
    },
    setBenefits: (state, action) => {
      state.benefits = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
        state.accessConfig = {
          clientId: action.payload.clientId || '',
          clientSecret: action.payload.clientSecret || '',
          enabled: !(action.payload.clientId && action.payload.clientSecret),
        };
        state.vipProducts = action.payload.vipProducts || [];
        state.benefits = action.payload.benefits || [];
        state.salesChannels = action.payload.applicationIds || [];
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveAccessConfig.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveAccessConfig.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveAccessConfig.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(fetchVipProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVipProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.vipProducts = action.payload;
      })
      .addCase(fetchVipProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveVipProducts.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveVipProducts.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveVipProducts.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      .addCase(saveBenefits.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveBenefits.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveBenefits.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveTab, setAccessConfig, setVipProducts, setBenefits } = configureSlice.actions;
export default configureSlice.reducer; 