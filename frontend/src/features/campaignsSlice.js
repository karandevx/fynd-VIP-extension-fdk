import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async (company_id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `https://fetch-db-data-d9ca324b.serverless.boltic.app?module=campaigns&companyId=${company_id}&queryType=scan`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (data.success) return data.data;
      throw new Error('No campaigns found');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default campaignsSlice.reducer; 