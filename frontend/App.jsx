import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 ml-64">
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <Outlet />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;