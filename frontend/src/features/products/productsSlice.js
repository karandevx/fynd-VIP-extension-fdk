import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import urlJoin from 'url-join';

const EXAMPLE_MAIN_URL = window.location.origin;

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (company_id) => {
    const response = await axios.get(urlJoin(EXAMPLE_MAIN_URL, '/api/products/'), {
      headers: {
        "x-company-id": company_id,
      }
    });
    return response.data;
  }
);

export const fetchApplicationProducts = createAsyncThunk(
  'products/fetchApplicationProducts',
  async ({ company_id, application_id }) => {
    const response = await axios.get(urlJoin(EXAMPLE_MAIN_URL, `/api/products/application/${application_id}`), {
      headers: {
        "x-company-id": company_id,
      }
    });
    return response.data;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: null,
    lastFetched: null,
    filters: {
      searchTerm: '',
      sortField: 'name',
      sortDirection: 'asc'
    }
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
    },
    setSortField: (state, action) => {
      state.filters.sortField = action.payload;
    },
    setSortDirection: (state, action) => {
      state.filters.sortDirection = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        searchTerm: '',
        sortField: 'name',
        sortDirection: 'asc'
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.items = [];
        state.total = 0;
      })
      .addCase(fetchApplicationProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchApplicationProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.items = [];
        state.total = 0;
      });
  }
});

export const { setSearchTerm, setSortField, setSortDirection, clearFilters } = productsSlice.actions;

export default productsSlice.reducer;