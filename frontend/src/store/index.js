import { configureStore } from '@reduxjs/toolkit';
import vipProductsReducer from '../features/vipProducts/vipProductsSlice';
import salesChannelsReducer from '../features/salesChannels/salesChannelsSlice';
import benefitsReducer from '../features/benefits/benefitsSlice';

export const store = configureStore({
  reducer: {
    vipProducts: vipProductsReducer,
    salesChannels: salesChannelsReducer,
    benefits: benefitsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store; 