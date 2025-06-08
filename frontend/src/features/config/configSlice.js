import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchConfig = createAsyncThunk(
  "config/fetchConfig",
  async (company_id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_FETCH_BACKEND_URL}?module=configs&companyId=${company_id}&queryType=scan`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success && response.data.data.length > 0) {
        return response.data.data[0];
      }
      return null;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch configuration";
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    clearConfig: (state) => {
      state.data = null;
      state.error = null;
      state.lastFetched = null;
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
        state.data = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearConfig } = configSlice.actions;
export default configSlice.reducer; 