import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard.jsx";
import Customers from "./pages/Customers.jsx";
import Campaigns from "./pages/Campaigns.jsx";
import Configure from "./pages/Configure.jsx";

const router = createBrowserRouter([
  {
    path: "/company/:company_id/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Dashboard />
      },
      {
        path: "dashboard",
        element: <Dashboard />
      },
      {
        path: "customers",
        element: <Customers />
      },
      {
        path: "campaigns",
        element: <Campaigns />
      },
      {
        path: "configure",
        element: <Configure />
      }
    ]
  },
  {
    path: "/*",
    element: <NotFound />
  }
]);

export default router;