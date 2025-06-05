import React from "react";
import { Provider } from 'react-redux';
import { Outlet } from "react-router-dom";
import store from './src/store';
import Sidebar from "./components/Sidebar/Sidebar";
import "./App.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Provider store={store}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Outlet />
        </div>
      </div>
    </Provider>
  );
}

export default App;