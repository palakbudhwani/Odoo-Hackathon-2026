import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import VehicleRegistry from './components/VehicleRegistry';
import DriverManagement from './components/DriverManagement';
import TripManagement from './components/TripManagement';
import Maintenance from './components/Maintenance';
import FuelExpenses from './components/FuelExpenses';
import Reports from './components/Reports';
import Settings from './components/Settings';

function AppContent() {
  const { user, view } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Render view depending on role mapping
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'fleet':
        return <VehicleRegistry />;
      case 'drivers':
        return <DriverManagement />;
      case 'trips':
        return <TripManagement />;
      case 'maintenance':
        return <Maintenance />;
      case 'fuel_expenses':
        return <FuelExpenses />;
      case 'analytics':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main content frame */}
      <div className="main-content" style={{
        marginLeft: 'var(--sidebar-width)',
        // Simple media query layout shift handled dynamically
        transition: 'margin-left var(--transition-normal)',
        paddingLeft: 0,
        width: 'calc(100% - var(--sidebar-width))'
      }}>
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="page-container">
          {renderView()}
        </main>
      </div>

      {/* Embedded CSS rules for layout responsiveness */}
      <style>{`
        @media (max-width: 1024px) {
          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
          }
          header button[style*="display: none"] {
            display: flex !important;
          }
          aside button[style*="display: none"] {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
