import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching campaigns
export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async (companyId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `https://fetch-db-data-d9ca324b.serverless.boltic.app?module=campaigns&companyId=${companyId}&queryType=scan`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch campaigns');
    }
  }
);

const initialState = {
  campaigns: [],
  loading: false,
  error: null,
  lastFetched: null
};

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    clearCampaigns: (state) => {
      state.campaigns = [];
      state.lastFetched = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCampaigns } = campaignsSlice.actions;
export default campaignsSlice.reducer; 