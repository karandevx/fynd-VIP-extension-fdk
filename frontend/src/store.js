import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './features/productsSlice';
import customersReducer from './features/customersSlice';
import salesChannelsReducer from './features/salesChannelsSlice';
import configureReducer from './features/configureSlice';
import vipProductsReducer from './features/vipProductsSlice';

// Example placeholder reducer (replace with actual slices later)
const placeholderReducer = (state = {}, action) => state;

const store = configureStore({
  reducer: {
    placeholder: placeholderReducer,
    products: productsReducer,
    customers: customersReducer,
    salesChannels: salesChannelsReducer,
    configure: configureReducer,
    vipProducts: vipProductsReducer,
    // Add other slices here
  },
});

export default store; 