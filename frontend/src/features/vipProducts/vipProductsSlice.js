import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import urlJoin from 'url-join';

const EXAMPLE_MAIN_URL = window.location.origin;

// Async thunks
export const fetchVipProducts = createAsyncThunk(
  'vipProducts/fetchProducts',
  async (companyId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        urlJoin(EXAMPLE_MAIN_URL, "/api/products/vip-products"),
        {
          headers: {
            "x-company-id": companyId,
          },
        }
      );
      return data.items || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch VIP products');
    }
  }
);

export const saveVipProducts = createAsyncThunk(
  'vipProducts/saveProducts',
  async ({ selectedProducts, companyId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        urlJoin(EXAMPLE_MAIN_URL, "/api/products/vip-products"),
        {
          selectedProducts,
        },
        {
          headers: {
            "x-company-id": companyId,
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to save VIP products');
    }
  }
);

const initialState = {
  productList: [],
  selectedProducts: [],
  loading: false,
  saving: false,
  error: null,
  lastFetched: null,
};

const vipProductsSlice = createSlice({
  name: 'vipProducts',
  initialState,
  reducers: {
    setSelectedProducts: (state, action) => {
      state.selectedProducts = action.payload;
    },
    addSelectedProduct: (state, action) => {
      const { planTitle, product } = action.payload;
      // Remove any existing selection for this plan
      state.selectedProducts = state.selectedProducts.filter(
        (item) => !item[planTitle]
      );
      // Add the new selection
      state.selectedProducts.push({ [planTitle]: product });
    },
    removeSelectedProduct: (state, action) => {
      const { planTitle } = action.payload;
      state.selectedProducts = state.selectedProducts.filter(
        (item) => !item[planTitle]
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchVipProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVipProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.productList = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchVipProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Products
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
      });
  },
});

export const { setSelectedProducts, addSelectedProduct, removeSelectedProduct } = vipProductsSlice.actions;
export default vipProductsSlice.reducer;