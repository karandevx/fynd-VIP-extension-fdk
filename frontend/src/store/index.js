import { configureStore } from '@reduxjs/toolkit';
import vipProductsReducer from '../features/vipProducts/vipProductsSlice';
import salesChannelsReducer from '../features/salesChannels/salesChannelsSlice';
import benefitsReducer from '../features/benefits/benefitsSlice';
import campaignsReducer from '../features/campaigns/campaignsSlice';
import customersReducer from '../features/customers/customersSlice';
import productsReducer from '../features/products/productsSlice';
import configReducer from '../features/config/configSlice';

export const store = configureStore({
  reducer: {
    vipProducts: vipProductsReducer,
    salesChannels: salesChannelsReducer,
    benefits: benefitsReducer,
    campaigns: campaignsReducer,
    customers: customersReducer,
    products: productsReducer,
    config: configReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store; 