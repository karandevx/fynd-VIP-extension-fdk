import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ company_id, application_id }, { rejectWithValue }) => {
    try {
      const EXAMPLE_MAIN_URL = window.location.origin;
      let url = application_id
        ? `${EXAMPLE_MAIN_URL}/api/products/application/${application_id}`
        : `${EXAMPLE_MAIN_URL}/api/products`;
      const { data } = await axios.get(url, {
        headers: { 'x-company-id': company_id },
      });
      return data.items;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productsSlice.reducer; 