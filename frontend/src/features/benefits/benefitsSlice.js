import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import urlJoin from 'url-join';

const EXAMPLE_MAIN_URL = window.location.origin;

// Async thunks
export const fetchSalesChannels = createAsyncThunk(
  'benefits/fetchSalesChannels',
  async (companyId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        urlJoin(EXAMPLE_MAIN_URL, "/api/sales"),
        {
          headers: {
            "x-company-id": companyId,
          },
        }
      );
      return data.items || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch sales channels');
    }
  }
);

export const saveBenefits = createAsyncThunk(
  'benefits/saveBenefits',
  async ({ salesChannels, configuredPlans, companyId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        urlJoin(EXAMPLE_MAIN_URL, "/api/sales/configure-plans"),
        {
          salesChannels,
          configuredPlans,
        },
        {
          headers: {
            "x-company-id": companyId,
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to save benefits');
    }
  }
);

const initialState = {
  plans: [
    {
      title: "PRODUCT_EXCLUSIVITY",
      isEnabled: false,
      description: "",
      img: "",
    },
    {
      title: "CUSTOM_PROMOTIONS",
      isEnabled: false,
      description: "",
      img: "",
    },
    {
      title: "PRODUCT_EXCLUSIVITY_AND_CUSTOM_PROMOTIONS",
      isEnabled: false,
      description: "",
      img: "",
    },
  ],
  salesChannels: [],
  selectedChannels: [],
  loading: false,
  saving: false,
  error: null,
  isConfigured: false,
  hasChanges: false,
  originalState: {
    plans: [],
    selectedChannels: []
  }
};

const benefitsSlice = createSlice({
  name: 'benefits',
  initialState,
  reducers: {
    setInitialState: (state, action) => {
      const { initialPlans, applicationIds } = action.payload;
      if (initialPlans?.length > 0 && applicationIds?.length > 0) {
        state.plans = initialPlans;
        state.selectedChannels = applicationIds;
        state.isConfigured = true;
        state.originalState = {
          plans: [...initialPlans],
          selectedChannels: [...applicationIds]
        };
      }
    },
    togglePlan: (state, action) => {
      const { index } = action.payload;
      if (state.originalState.plans[index]?.isEnabled) {
        return;
      }
      state.plans[index] = {
        ...state.plans[index],
        isEnabled: !state.plans[index].isEnabled,
        description: !state.plans[index].isEnabled ? "" : state.plans[index].description,
        img: !state.plans[index].isEnabled ? "" : state.plans[index].img,
      };
      state.hasChanges = true;
    },
    updatePlan: (state, action) => {
      const { index, field, value } = action.payload;
      if (state.originalState.plans[index]?.isEnabled || state.plans[index].isEnabled) {
        state.plans[index] = {
          ...state.plans[index],
          [field]: value,
        };
        state.hasChanges = true;
      }
    },
    toggleChannel: (state, action) => {
      const channelId = action.payload;
      if (state.originalState.selectedChannels.includes(channelId)) {
        return;
      }
      state.selectedChannels = state.selectedChannels.includes(channelId)
        ? state.selectedChannels.filter(id => id !== channelId)
        : [...state.selectedChannels, channelId];
      state.hasChanges = true;
    },
    toggleAllChannels: (state, action) => {
      const { allSelected, channels } = action.payload;
      if (!allSelected) {
        return;
      }
      state.selectedChannels = state.selectedChannels.length === channels.length
        ? state.originalState.selectedChannels
        : channels.map(channel => channel.id);
      state.hasChanges = true;
    },
    resetChanges: (state) => {
      state.hasChanges = false;
      state.originalState = {
        plans: [...state.plans],
        selectedChannels: [...state.selectedChannels]
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sales Channels
      .addCase(fetchSalesChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesChannels.fulfilled, (state, action) => {
        state.loading = false;
        state.salesChannels = action.payload;
      })
      .addCase(fetchSalesChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Benefits
      .addCase(saveBenefits.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveBenefits.fulfilled, (state) => {
        state.saving = false;
        state.isConfigured = true;
        state.hasChanges = false;
        state.originalState = {
          plans: [...state.plans],
          selectedChannels: [...state.selectedChannels]
        };
      })
      .addCase(saveBenefits.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const {
  setInitialState,
  togglePlan,
  updatePlan,
  toggleChannel,
  toggleAllChannels,
  resetChanges
} = benefitsSlice.actions;

export default benefitsSlice.reducer; 