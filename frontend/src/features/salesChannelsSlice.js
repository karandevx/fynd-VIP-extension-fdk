import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching sales channels
export const fetchSalesChannels = createAsyncThunk(
  'salesChannels/fetchSalesChannels',
  async (company_id, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://fetch-db-data-d9ca324b.serverless.boltic.app?module=salesChannels&companyId=${company_id}`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch sales channels');
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const salesChannelsSlice = createSlice({
  name: 'salesChannels',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesChannels.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSalesChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default salesChannelsSlice.reducer; 