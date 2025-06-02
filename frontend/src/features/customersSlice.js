import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching customers
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (company_id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_FETCH_BACKEND_URL}?module=users&companyId=${company_id}&queryType=scan`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch customers');
      }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default customersSlice.reducer; 