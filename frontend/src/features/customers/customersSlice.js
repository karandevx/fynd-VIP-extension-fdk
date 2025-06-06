import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching customers
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_FETCH_BACKEND_URL}?module=users&companyId=${companyId}&queryType=scan`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch customers');
    }
  }
);

const initialState = {
  customers: [],
  loading: false,
  error: null,
  lastFetched: null,
  filters: {
    searchTerm: '',
    vipType: 'all', // 'all', 'CUSTOM_PROMOTIONS', 'PRODUCT_EXCLUSIVITY'
    sortField: 'firstName',
    sortDirection: 'asc'
  }
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
    },
    setVipType: (state, action) => {
      state.filters.vipType = action.payload;
    },
    setSortField: (state, action) => {
      state.filters.sortField = action.payload;
    },
    setSortDirection: (state, action) => {
      state.filters.sortDirection = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchTerm,
  setVipType,
  setSortField,
  setSortDirection,
  clearFilters
} = customersSlice.actions;

export default customersSlice.reducer; 