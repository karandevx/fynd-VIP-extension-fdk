import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import urlJoin from 'url-join';

export const fetchAllVipProducts = createAsyncThunk(
  'vipProducts/fetchAll',
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

const vipProductsSlice = createSlice({
  name: 'vipProducts',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllVipProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVipProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllVipProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default vipProductsSlice.reducer; 