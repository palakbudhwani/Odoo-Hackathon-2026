import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../components/layout/Layout";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Fleet from "../pages/Fleet/Fleet";
import Drivers from "../pages/Drivers/Drivers";
import Trips from "../pages/Trips/Trips";
import Maintenance from "../pages/Maintenance/Maintenance";
import FuelExpenses from "../pages/FuelExpenses/FuelExpenses";
import Reports from "../pages/Reports/Reports";
import Settings from "../pages/Settings/Settings";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/fleet"
          element={
            <Layout>
              <Fleet />
            </Layout>
          }
        />

        <Route
          path="/drivers"
          element={
            <Layout>
              <Drivers />
            </Layout>
          }
        />

        <Route
          path="/trips"
          element={
            <Layout>
              <Trips />
            </Layout>
          }
        />

        <Route
          path="/maintenance"
          element={
            <Layout>
              <Maintenance />
            </Layout>
          }
        />

        <Route
          path="/fuel-expenses"
          element={
            <Layout>
              <FuelExpenses />
            </Layout>
          }
        />

        <Route
          path="/reports"
          element={
            <Layout>
              <Reports />
            </Layout>
          }
        />

        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;