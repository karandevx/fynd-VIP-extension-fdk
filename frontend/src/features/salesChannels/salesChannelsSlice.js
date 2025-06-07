import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import urlJoin from 'url-join';

const EXAMPLE_MAIN_URL = window.location.origin;

// Async thunk for fetching sales channels
export const fetchSalesChannels = createAsyncThunk(
  'salesChannels/fetchSalesChannels',
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        urlJoin(EXAMPLE_MAIN_URL, "/api/sales"),
        {
          headers: {
            "x-company-id": companyId,
          },
        }
      );

      const configResponse = await axios.get(
        `${import.meta.env.VITE_FETCH_BACKEND_URL}?module=configs&companyId=${companyId}&queryType=scan`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && configResponse.data.data[0]) {
        const configData = configResponse.data.data[0]?.applicationIds || [];
        const allChannels = response.data.items || [];
        const configuredChannels = allChannels?.filter((channel) =>
          configData.includes?.(channel.id)
        );
        return configuredChannels;
      } else {
        throw new Error("Failed to fetch sales channels");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  channels: [],
  loading: false,
  error: null,
  selectedChannels: [],
  isConfigured: false,
  hasChanges: false,
  lastFetched: null,
  originalState: {
    selectedChannels: []
  }
};

const salesChannelsSlice = createSlice({
  name: 'salesChannels',
  initialState,
  reducers: {
    setInitialState: (state, action) => {
      const { applicationIds } = action.payload;
      if (applicationIds?.length > 0) {
        state.selectedChannels = applicationIds;
        state.isConfigured = true;
        state.originalState = {
          selectedChannels: [...applicationIds]
        };
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
        selectedChannels: [...state.selectedChannels]
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesChannels.fulfilled, (state, action) => {
        state.loading = false;
        state.channels = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchSalesChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setInitialState,
  toggleChannel,
  toggleAllChannels,
  resetChanges
} = salesChannelsSlice.actions;

export default salesChannelsSlice.reducer; 