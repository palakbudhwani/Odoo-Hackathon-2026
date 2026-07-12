import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDb, isLicenseExpired, isLicenseExpiringSoon } from '../data/mockDb';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Authentication State (try to restore from session/local storage if logged in)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('transitops_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState('dashboard');
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
    const v = mockDb.getVehicles();
    const d = mockDb.getDrivers();
    const t = mockDb.getTrips();
    const m = mockDb.getMaintenanceLogs();
    const f = mockDb.getFuelLogs();
    const e = mockDb.getExpenses();
    const s = mockDb.getSettings();

    setVehicles(v);
    setDrivers(d);
    setTrips(t);
    setMaintenance(m);
    setFuelLogs(f);
    setExpenses(e);
    setSettings(s);

    // Calculate dynamic system notifications/alerts
    const newAlerts = [];

    // 1. License expirations
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

    // 2. Vehicles in Shop
    const inShopCount = v.filter(veh => veh.status === 'In Shop').length;
    if (inShopCount > 0) {
      newAlerts.push({
        id: `alert-shop`,
        type: 'info',
        message: `${inShopCount} vehicle(s) currently In Shop for maintenance.`,
        link: 'maintenance'
      });
    }

    // 3. Low safety scores
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
  };

  // On mount, load data
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

  // Auth Operations
  const login = (email, password) => {
    try {
      const authenticatedUser = mockDb.authenticateUser(email, password);
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
      const newUser = mockDb.registerUser({ name, email, password, role });
      setUser(newUser);
      localStorage.setItem('transitops_session', JSON.stringify(newUser));
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
    mockDb.resetDb();
    refreshState();
  };

  // --- Wrapper CRUD Actions ---

  const handleAction = (callback) => {
    try {
      callback();
      refreshState();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const saveVehicle = (vehicle) => handleAction(() => mockDb.saveVehicle(vehicle));
  const deleteVehicle = (regNum) => handleAction(() => mockDb.deleteVehicle(regNum));

  const saveDriver = (driver) => handleAction(() => mockDb.saveDriver(driver));
  const deleteDriver = (id) => handleAction(() => mockDb.deleteDriver(id));

  const saveTrip = (trip) => handleAction(() => mockDb.saveTrip(trip));
  const dispatchTrip = (tripId) => handleAction(() => mockDb.dispatchTrip(tripId));
  const completeTrip = (tripId, finalOdometer, fuelConsumed) => 
    handleAction(() => mockDb.completeTrip(tripId, finalOdometer, fuelConsumed));
  const cancelTrip = (tripId) => handleAction(() => mockDb.cancelTrip(tripId));

  const saveMaintenanceLog = (log) => handleAction(() => mockDb.saveMaintenanceLog(log));
  const closeMaintenance = (logId, finalCost) => handleAction(() => mockDb.closeMaintenance(logId, finalCost));
  const deleteMaintenanceLog = (id) => handleAction(() => mockDb.deleteMaintenanceLog(id));

  const saveFuelLog = (log) => handleAction(() => mockDb.saveFuelLog(log));
  const deleteFuelLog = (id) => handleAction(() => mockDb.deleteFuelLog(id));

  const saveExpense = (expense) => handleAction(() => mockDb.saveExpense(expense));
  const deleteExpense = (id) => handleAction(() => mockDb.deleteExpense(id));

  const saveGlobalSettings = (newSettings) => handleAction(() => mockDb.saveSettings(newSettings));

  // --- Operational aggregates ---
  const getVehicleCost = (regNum) => mockDb.getVehicleOperationalCost(regNum);
  const getVehicleRevenue = (regNum) => mockDb.getVehicleRevenue(regNum);
  const getVehicleDistance = (regNum) => mockDb.getVehicleDistance(regNum);
  const getVehicleFuelLiters = (regNum) => mockDb.getVehicleFuelLiters(regNum);

  return (
    <AppContext.Provider value={{
      user,
      login,
      signup,
      logout,
      view,
      setView,
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
