import React, { createContext, useContext, useState, useEffect } from 'react';
import { isLicenseExpired, isLicenseExpiringSoon } from '../data/mockDb';
import {
  fetchCollections,
  loginUser,
  createItem,
  updateItem,
  deleteItem,
  resetDatabase as resetApiDatabase
} from '../data/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Authentication State (try to restore from session/local storage if logged in)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('transitops_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setViewState] = useState('dashboard');
  const [viewHistory, setViewHistory] = useState(['dashboard']);
  const [viewIndex, setViewIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('transitops_dark_mode') === 'true';
  });

  // DB Data States
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState({});
  const [alerts, setAlerts] = useState([]);

  // Search Filter State (global search across current tab content)
  const [searchQuery, setSearchQuery] = useState('');

  // Reload all states from database
  const refreshState = () => {
    try {
      const state = fetchCollections();
      const v = state.vehicles || [];
      const d = state.drivers || [];
      const t = state.trips || [];
      const m = state.maintenance || [];
      const f = state.fuelLogs || [];
      const e = state.expenses || [];
      const s = state.settings || {};

      setVehicles(v);
      setDrivers(d);
      setTrips(t);
      setMaintenance(m);
      setFuelLogs(f);
      setExpenses(e);
      setSettings(s);

      const newAlerts = [];

      d.forEach(driver => {
        if (isLicenseExpired(driver.expiryDate)) {
          newAlerts.push({
            id: `alert-exp-${driver.id}`,
            type: 'danger',
            message: `Driver ${driver.name}'s license (${driver.licenseNum}) expired on ${driver.expiryDate}!`,
            link: 'drivers'
          });
        } else if (isLicenseExpiringSoon(driver.expiryDate, s.licenseWarningDays || 30)) {
          newAlerts.push({
            id: `alert-soon-${driver.id}`,
            type: 'warning',
            message: `Driver ${driver.name}'s license expires soon on ${driver.expiryDate}.`,
            link: 'drivers'
          });
        }
      });

      const inShopCount = v.filter(veh => veh.status === 'In Shop').length;
      if (inShopCount > 0) {
        newAlerts.push({
          id: `alert-shop`,
          type: 'info',
          message: `${inShopCount} vehicle(s) currently In Shop for maintenance.`,
          link: 'maintenance'
        });
      }

      d.forEach(driver => {
        if (driver.safetyScore < 80 && driver.status !== 'Suspended') {
          newAlerts.push({
            id: `alert-safety-${driver.id}`,
            type: 'warning',
            message: `Driver ${driver.name} has a low safety score (${driver.safetyScore}%). Consider review.`,
            link: 'drivers'
          });
        }
      });

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Failed to refresh state', error);
    }
  };

  useEffect(() => {
    refreshState();
  }, []);

  // Theme Sync
  useEffect(() => {
    localStorage.setItem('transitops_dark_mode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const setView = (nextView) => {
    if (!nextView || nextView === view) return;
    const newHistory = [...viewHistory.slice(0, viewIndex + 1), nextView];
    setViewHistory(newHistory);
    setViewIndex(newHistory.length - 1);
    setViewState(nextView);
  };

  const goBack = () => {
    if (viewIndex === 0) return;
    const nextIndex = viewIndex - 1;
    setViewIndex(nextIndex);
    setViewState(viewHistory[nextIndex]);
  };

  const goForward = () => {
    if (viewIndex >= viewHistory.length - 1) return;
    const nextIndex = viewIndex + 1;
    setViewIndex(nextIndex);
    setViewState(viewHistory[nextIndex]);
  };

  // Auth Operations
  const login = (email, password) => {
    try {
      const response = loginUser(email, password);
      const authenticatedUser = response.user;
      setUser(authenticatedUser);
      localStorage.setItem('transitops_session', JSON.stringify(authenticatedUser));
      setView('dashboard');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const signup = (name, email, password, role) => {
    try {
      const newUser = createItem('users', { name, email, password, role });
      setUser({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
      localStorage.setItem('transitops_session', JSON.stringify({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }));
      setView('dashboard');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('transitops_session');
    setView('dashboard');
  };

  // Reset Database
  const resetDatabase = () => {
    try {
      resetApiDatabase();
      refreshState();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // --- Wrapper CRUD Actions ---

  const handleAction = (collection, id, payload, method = 'create') => {
    try {
      if (method === 'delete') {
        deleteItem(collection, id);
      } else if (method === 'update') {
        updateItem(collection, id, payload);
      } else {
        createItem(collection, payload);
      }
      refreshState();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const saveVehicle = (vehicle) => {
    const payload = { ...vehicle };
    const existingVehicle = vehicles.find((item) => item.regNum === payload.regNum);
    if (existingVehicle?.id) {
      return handleAction('vehicles', existingVehicle.id, payload, 'update');
    }
    return handleAction('vehicles', null, payload, 'create');
  };
  const deleteVehicle = (regNum) => {
    const existingVehicle = vehicles.find((item) => item.regNum === regNum);
    if (existingVehicle?.id) {
      return handleAction('vehicles', existingVehicle.id, null, 'delete');
    }
    return handleAction('vehicles', regNum, null, 'delete');
  };

  const saveDriver = (driver) => {
    if (driver.id) {
      return handleAction('drivers', driver.id, driver, 'update');
    }
    return handleAction('drivers', null, driver, 'create');
  };
  const deleteDriver = (id) => handleAction('drivers', id, null, 'delete');

  const saveTrip = (trip) => {
    if (trip.id) {
      return handleAction('trips', trip.id, trip, 'update');
    }
    return handleAction('trips', null, trip, 'create');
  };
  const dispatchTrip = (tripId) => handleAction('trips', tripId, { status: 'Dispatched' }, 'update');
  const completeTrip = (tripId, finalOdometer, fuelConsumed) =>
    handleAction('trips', tripId, { status: 'Completed', endOdometer: finalOdometer, fuelConsumed }, 'update');
  const cancelTrip = (tripId) => handleAction('trips', tripId, { status: 'Cancelled' }, 'update');

  const saveMaintenanceLog = (log) => {
    if (log.id) {
      return handleAction('maintenance', log.id, log, 'update');
    }
    return handleAction('maintenance', null, log, 'create');
  };
  const closeMaintenance = (logId, finalCost) => handleAction('maintenance', logId, { status: 'Completed', cost: finalCost }, 'update');
  const deleteMaintenanceLog = (id) => handleAction('maintenance', id, null, 'delete');

  const saveFuelLog = (log) => {
    if (log.id) {
      return handleAction('fuelLogs', log.id, log, 'update');
    }
    return handleAction('fuelLogs', null, log, 'create');
  };
  const deleteFuelLog = (id) => handleAction('fuelLogs', id, null, 'delete');

  const saveExpense = (expense) => {
    if (expense.id) {
      return handleAction('expenses', expense.id, expense, 'update');
    }
    return handleAction('expenses', null, expense, 'create');
  };
  const deleteExpense = (id) => handleAction('expenses', id, null, 'delete');

  const saveGlobalSettings = (newSettings) => handleAction('settings', 'settings', newSettings, 'update');

  const getVehicleCost = (regNum) => {
    const vehicle = vehicles.find((item) => item.regNum === regNum);
    return vehicle ? vehicle.acquisitionCost || 0 : 0;
  };
  const getVehicleRevenue = (regNum) => {
    return trips.filter((trip) => trip.vehicleReg === regNum && trip.status === 'Completed').reduce((sum, trip) => sum + (trip.revenue || 0), 0);
  };
  const getVehicleDistance = (regNum) => {
    return trips.filter((trip) => trip.vehicleReg === regNum && trip.status === 'Completed').reduce((sum, trip) => sum + (trip.plannedDistance || 0), 0);
  };
  const getVehicleFuelLiters = (regNum) => {
    return fuelLogs.filter((log) => log.vehicleReg === regNum).reduce((sum, log) => sum + (log.liters || 0), 0);
  };

  return (
    <AppContext.Provider value={{
      user,
      login,
      signup,
      logout,
      view,
      setView,
      goBack,
      goForward,
      darkMode,
      setDarkMode,
      vehicles,
      drivers,
      trips,
      maintenance,
      fuelLogs,
      expenses,
      settings,
      alerts,
      searchQuery,
      setSearchQuery,
      resetDatabase,
      
      // Actions
      saveVehicle,
      deleteVehicle,
      saveDriver,
      deleteDriver,
      saveTrip,
      dispatchTrip,
      completeTrip,
      cancelTrip,
      saveMaintenanceLog,
      closeMaintenance,
      deleteMaintenanceLog,
      saveFuelLog,
      deleteFuelLog,
      saveExpense,
      deleteExpense,
      saveGlobalSettings,

      // Aggregates
      getVehicleCost,
      getVehicleRevenue,
      getVehicleDistance,
      getVehicleFuelLiters
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
