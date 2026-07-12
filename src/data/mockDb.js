// TransitOps Client-Side Database & Business Rules Engine

const STORAGE_KEY = 'transitops_db_state_clean';

const DEFAULT_USERS = [
  { email: 'admin@transitops.com', password: 'password123', name: 'Fleet Manager', role: 'Fleet Manager' },
  { email: 'dispatcher@transitops.com', password: 'password123', name: 'Dispatcher', role: 'Dispatcher' },
  { email: 'safety@transitops.com', password: 'password123', name: 'Safety Officer', role: 'Safety Officer' },
  { email: 'finance@transitops.com', password: 'password123', name: 'Financial Analyst', role: 'Financial Analyst' }
];

const DEFAULT_VEHICLES = [];
const DEFAULT_DRIVERS = [];
const DEFAULT_TRIPS = [];
const DEFAULT_MAINTENANCE = [];
const DEFAULT_FUEL_LOGS = [];
const DEFAULT_EXPENSES = [];

// Helper to initialize and read state
function loadDb() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const initialState = {
      users: DEFAULT_USERS,
      vehicles: DEFAULT_VEHICLES,
      drivers: DEFAULT_DRIVERS,
      trips: DEFAULT_TRIPS,
      maintenance: DEFAULT_MAINTENANCE,
      fuelLogs: DEFAULT_FUEL_LOGS,
      expenses: DEFAULT_EXPENSES,
      settings: {
        currency: 'USD',
        revenuePerKm: 3.00,
        licenseWarningDays: 30
      }
    };
    saveDb(initialState);
    return initialState;
  }
  return JSON.parse(data);
}

function saveDb(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Check license validity helper
export function isLicenseExpired(expiryDateStr) {
  const expiry = new Date(expiryDateStr);
  const today = new Date();
  // Clear times for direct date comparison
  expiry.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  return expiry < today;
}

export function isLicenseExpiringSoon(expiryDateStr, warningDays = 30) {
  const expiry = new Date(expiryDateStr);
  const today = new Date();
  expiry.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  
  if (expiry < today) return false; // Already expired
  
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= warningDays;
}

// --- DATABASE FUNCTIONS ---

export const mockDb = {
  // Reset database to default
  resetDb: () => {
    localStorage.removeItem(STORAGE_KEY);
    return loadDb();
  },

  // Auth API
  authenticateUser: (email, password) => {
    const db = loadDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('Invalid email address');
    if (user.password !== password) throw new Error('Incorrect password');
    return { email: user.email, name: user.name, role: user.role };
  },

  registerUser: (newUser) => {
    const db = loadDb();
    const exists = db.users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (exists) throw new Error('User already exists with this email address.');
    
    const user = {
      email: newUser.email.toLowerCase(),
      password: newUser.password,
      name: newUser.name,
      role: newUser.role
    };
    db.users.push(user);
    saveDb(db);
    return { email: user.email, name: user.name, role: user.role };
  },

  // Vehicles CRUD
  getVehicles: () => loadDb().vehicles,
  
  saveVehicle: (vehicle) => {
    const db = loadDb();
    const index = db.vehicles.findIndex(v => v.regNum.toUpperCase() === vehicle.regNum.toUpperCase());
    
    // Validate uniqueness of registration number on Create
    if (index === -1) {
      const regExists = db.vehicles.some(v => v.regNum.toUpperCase() === vehicle.regNum.toUpperCase());
      if (regExists) {
        throw new Error(`Vehicle with registration number ${vehicle.regNum} already exists.`);
      }
      db.vehicles.push({
        ...vehicle,
        regNum: vehicle.regNum.toUpperCase(),
        odometer: Number(vehicle.odometer || 0),
        acquisitionCost: Number(vehicle.acquisitionCost || 0),
        maxCapacity: Number(vehicle.maxCapacity || 0)
      });
    } else {
      // Modify existing
      db.vehicles[index] = {
        ...db.vehicles[index],
        ...vehicle,
        regNum: vehicle.regNum.toUpperCase(),
        odometer: Number(vehicle.odometer),
        acquisitionCost: Number(vehicle.acquisitionCost),
        maxCapacity: Number(vehicle.maxCapacity)
      };
    }
    saveDb(db);
    return db.vehicles;
  },

  deleteVehicle: (regNum) => {
    const db = loadDb();
    db.vehicles = db.vehicles.filter(v => v.regNum !== regNum);
    saveDb(db);
    return db.vehicles;
  },

  // Drivers CRUD
  getDrivers: () => loadDb().drivers,

  saveDriver: (driver) => {
    const db = loadDb();
    if (!driver.id) {
      const newDriver = {
        ...driver,
        id: `drv-${Date.now()}`,
        safetyScore: Number(driver.safetyScore || 90)
      };
      db.drivers.push(newDriver);
    } else {
      const index = db.drivers.findIndex(d => d.id === driver.id);
      if (index !== -1) {
        db.drivers[index] = {
          ...db.drivers[index],
          ...driver,
          safetyScore: Number(driver.safetyScore)
        };
      }
    }
    saveDb(db);
    return db.drivers;
  },

  deleteDriver: (id) => {
    const db = loadDb();
    db.drivers = db.drivers.filter(d => d.id !== id);
    saveDb(db);
    return db.drivers;
  },

  // Trips CRUD & Workflows
  getTrips: () => {
    const db = loadDb();
    // Enforce matching objects inside trips
    return db.trips.map(trip => {
      const vehicle = db.vehicles.find(v => v.regNum === trip.vehicleReg);
      const driver = db.drivers.find(d => d.id === trip.driverId);
      return { ...trip, vehicle, driver };
    });
  },

  saveTrip: (trip) => {
    const db = loadDb();
    
    // Fetch and Validate vehicle limits
    const vehicle = db.vehicles.find(v => v.regNum === trip.vehicleReg);
    if (!vehicle) throw new Error('Selected vehicle not found.');
    
    if (Number(trip.cargoWeight) > vehicle.maxCapacity) {
      throw new Error(`Cargo weight (${trip.cargoWeight} kg) exceeds vehicle's maximum load capacity (${vehicle.maxCapacity} kg).`);
    }

    // Fetch and Validate driver eligibility
    const driver = db.drivers.find(d => d.id === trip.driverId);
    if (!driver) throw new Error('Selected driver not found.');

    if (isLicenseExpired(driver.expiryDate)) {
      throw new Error(`Cannot assign Driver ${driver.name} - Driving license has expired.`);
    }

    if (driver.status === 'Suspended') {
      throw new Error(`Cannot assign Driver ${driver.name} - Driver status is Suspended.`);
    }

    // Check if driver or vehicle is already active on another trip (only if creating/dispatching)
    if (!trip.id || trip.status === 'Dispatched') {
      const activeTrips = db.trips.filter(t => t.status === 'Dispatched' && t.id !== trip.id);
      
      const vehicleBusy = activeTrips.some(t => t.vehicleReg === trip.vehicleReg);
      if (vehicleBusy) throw new Error(`Vehicle ${vehicle.regNum} is currently dispatched on another trip.`);

      const driverBusy = activeTrips.some(t => t.driverId === trip.driverId);
      if (driverBusy) throw new Error(`Driver ${driver.name} is currently dispatched on another trip.`);
    }

    if (!trip.id) {
      // Create new
      const newTrip = {
        ...trip,
        id: `trip-${Date.now()}`,
        cargoWeight: Number(trip.cargoWeight),
        plannedDistance: Number(trip.plannedDistance),
        revenue: Number(trip.revenue || (trip.plannedDistance * db.settings.revenuePerKm))
      };
      db.trips.push(newTrip);
      
      // Auto transitions if dispatched immediately
      if (newTrip.status === 'Dispatched') {
        const vIdx = db.vehicles.findIndex(v => v.regNum === trip.vehicleReg);
        const dIdx = db.drivers.findIndex(d => d.id === trip.driverId);
        if (vIdx !== -1) db.vehicles[vIdx].status = 'On Trip';
        if (dIdx !== -1) db.drivers[dIdx].status = 'On Trip';
      }
    } else {
      // Edit existing
      const index = db.trips.findIndex(t => t.id === trip.id);
      if (index !== -1) {
        const oldTrip = db.trips[index];
        const newStatus = trip.status;

        db.trips[index] = {
          ...oldTrip,
          ...trip,
          cargoWeight: Number(trip.cargoWeight),
          plannedDistance: Number(trip.plannedDistance),
          revenue: Number(trip.revenue)
        };

        // Handle Status Transitions
        if (oldTrip.status !== newStatus) {
          const vIdx = db.vehicles.findIndex(v => v.regNum === trip.vehicleReg);
          const dIdx = db.drivers.findIndex(d => d.id === trip.driverId);

          if (newStatus === 'Dispatched') {
            if (vIdx !== -1) db.vehicles[vIdx].status = 'On Trip';
            if (dIdx !== -1) db.drivers[dIdx].status = 'On Trip';
          } 
          else if (newStatus === 'Completed') {
            if (vIdx !== -1) {
              db.vehicles[vIdx].status = 'Available';
              if (trip.endOdometer) {
                db.vehicles[vIdx].odometer = Number(trip.endOdometer);
              }
            }
            if (dIdx !== -1) db.drivers[dIdx].status = 'Available';

            // Auto-log fuel if fuel consumed is provided
            if (trip.fuelConsumed && trip.fuelConsumed > 0) {
              const fuelCost = Number(trip.fuelConsumed) * 1.5; // Average cost factor
              db.fuelLogs.push({
                id: `fuel-${Date.now()}`,
                vehicleReg: trip.vehicleReg,
                date: new Date().toISOString().split('T')[0],
                liters: Number(trip.fuelConsumed),
                cost: fuelCost
              });
            }
          } 
          else if (newStatus === 'Cancelled') {
            // Restore status to Available
            if (vIdx !== -1) db.vehicles[vIdx].status = 'Available';
            if (dIdx !== -1) db.drivers[dIdx].status = 'Available';
          }
        }
      }
    }

    saveDb(db);
    return db.trips;
  },

  dispatchTrip: (tripId) => {
    const db = loadDb();
    const trip = db.trips.find(t => t.id === tripId);
    if (!trip) throw new Error('Trip not found');
    
    trip.status = 'Dispatched';
    
    // Set vehicle & driver to On Trip
    const vIdx = db.vehicles.findIndex(v => v.regNum === trip.vehicleReg);
    const dIdx = db.drivers.findIndex(d => d.id === trip.driverId);
    if (vIdx !== -1) db.vehicles[vIdx].status = 'On Trip';
    if (dIdx !== -1) db.drivers[dIdx].status = 'On Trip';

    saveDb(db);
    return db;
  },

  completeTrip: (tripId, finalOdometer, fuelConsumed) => {
    const db = loadDb();
    const tripIdx = db.trips.findIndex(t => t.id === tripId);
    if (tripIdx === -1) throw new Error('Trip not found');
    const trip = db.trips[tripIdx];

    const vIdx = db.vehicles.findIndex(v => v.regNum === trip.vehicleReg);
    if (vIdx !== -1) {
      if (finalOdometer < db.vehicles[vIdx].odometer) {
        throw new Error(`Final odometer (${finalOdometer} km) cannot be less than starting odometer (${db.vehicles[vIdx].odometer} km).`);
      }
      db.vehicles[vIdx].odometer = Number(finalOdometer);
      db.vehicles[vIdx].status = 'Available';
    }

    const dIdx = db.drivers.findIndex(d => d.id === trip.driverId);
    if (dIdx !== -1) {
      db.drivers[dIdx].status = 'Available';
    }

    trip.status = 'Completed';
    trip.endOdometer = Number(finalOdometer);
    trip.fuelConsumed = Number(fuelConsumed);

    // Auto-create a fuel log if fuel consumed is reported
    if (fuelConsumed > 0) {
      db.fuelLogs.push({
        id: `fuel-${Date.now()}`,
        vehicleReg: trip.vehicleReg,
        date: new Date().toISOString().split('T')[0],
        liters: Number(fuelConsumed),
        cost: Number(fuelConsumed) * 1.5 // estimated $1.5/L
      });
    }

    saveDb(db);
    return db;
  },

  cancelTrip: (tripId) => {
    const db = loadDb();
    const tripIdx = db.trips.findIndex(t => t.id === tripId);
    if (tripIdx === -1) throw new Error('Trip not found');
    const trip = db.trips[tripIdx];

    trip.status = 'Cancelled';

    const vIdx = db.vehicles.findIndex(v => v.regNum === trip.vehicleReg);
    const dIdx = db.drivers.findIndex(d => d.id === trip.driverId);
    if (vIdx !== -1) db.vehicles[vIdx].status = 'Available';
    if (dIdx !== -1) db.drivers[dIdx].status = 'Available';

    saveDb(db);
    return db;
  },

  // Maintenance Workflow
  getMaintenanceLogs: () => loadDb().maintenance,

  saveMaintenanceLog: (log) => {
    const db = loadDb();
    if (!log.id) {
      const newLog = {
        ...log,
        id: `maint-${Date.now()}`,
        cost: Number(log.cost || 0)
      };
      db.maintenance.push(newLog);

      // Auto switch status to "In Shop"
      if (newLog.status === 'In Progress') {
        const vIdx = db.vehicles.findIndex(v => v.regNum === log.vehicleReg);
        if (vIdx !== -1) {
          db.vehicles[vIdx].status = 'In Shop';
        }
      }
    } else {
      const index = db.maintenance.findIndex(m => m.id === log.id);
      if (index !== -1) {
        const oldLog = db.maintenance[index];
        db.maintenance[index] = {
          ...oldLog,
          ...log,
          cost: Number(log.cost)
        };

        const vIdx = db.vehicles.findIndex(v => v.regNum === log.vehicleReg);
        if (vIdx !== -1) {
          // If status changes to completed
          if (oldLog.status === 'In Progress' && log.status === 'Completed') {
            // Restore to Available unless retired
            if (db.vehicles[vIdx].status !== 'Retired') {
              db.vehicles[vIdx].status = 'Available';
            }
          } else if (log.status === 'In Progress') {
            db.vehicles[vIdx].status = 'In Shop';
          }
        }
      }
    }
    saveDb(db);
    return db.maintenance;
  },

  closeMaintenance: (logId, finalCost) => {
    const db = loadDb();
    const log = db.maintenance.find(m => m.id === logId);
    if (!log) throw new Error('Maintenance log not found');

    log.status = 'Completed';
    log.cost = Number(finalCost);

    const vIdx = db.vehicles.findIndex(v => v.regNum === log.vehicleReg);
    if (vIdx !== -1) {
      if (db.vehicles[vIdx].status !== 'Retired') {
        db.vehicles[vIdx].status = 'Available';
      }
    }

    saveDb(db);
    return db;
  },

  deleteMaintenanceLog: (id) => {
    const db = loadDb();
    // If deleting an in-progress log, we might want to restore vehicle status
    const log = db.maintenance.find(m => m.id === id);
    if (log && log.status === 'In Progress') {
      const vIdx = db.vehicles.findIndex(v => v.regNum === log.vehicleReg);
      if (vIdx !== -1 && db.vehicles[vIdx].status === 'In Shop') {
        db.vehicles[vIdx].status = 'Available';
      }
    }
    db.maintenance = db.maintenance.filter(m => m.id !== id);
    saveDb(db);
    return db.maintenance;
  },

  // Fuel Logs CRUD
  getFuelLogs: () => loadDb().fuelLogs,
  saveFuelLog: (log) => {
    const db = loadDb();
    if (!log.id) {
      db.fuelLogs.push({
        ...log,
        id: `fuel-${Date.now()}`,
        liters: Number(log.liters),
        cost: Number(log.cost)
      });
    } else {
      const idx = db.fuelLogs.findIndex(f => f.id === log.id);
      if (idx !== -1) {
        db.fuelLogs[idx] = {
          ...db.fuelLogs[idx],
          ...log,
          liters: Number(log.liters),
          cost: Number(log.cost)
        };
      }
    }
    saveDb(db);
    return db.fuelLogs;
  },
  deleteFuelLog: (id) => {
    const db = loadDb();
    db.fuelLogs = db.fuelLogs.filter(f => f.id !== id);
    saveDb(db);
    return db.fuelLogs;
  },

  // Expenses CRUD
  getExpenses: () => loadDb().expenses,
  saveExpense: (expense) => {
    const db = loadDb();
    if (!expense.id) {
      db.expenses.push({
        ...expense,
        id: `exp-${Date.now()}`,
        cost: Number(expense.cost)
      });
    } else {
      const idx = db.expenses.findIndex(e => e.id === expense.id);
      if (idx !== -1) {
        db.expenses[idx] = {
          ...db.expenses[idx],
          ...expense,
          cost: Number(expense.cost)
        };
      }
    }
    saveDb(db);
    return db.expenses;
  },
  deleteExpense: (id) => {
    const db = loadDb();
    db.expenses = db.expenses.filter(e => e.id !== id);
    saveDb(db);
    return db.expenses;
  },

  // Global Settings
  getSettings: () => loadDb().settings,
  saveSettings: (settings) => {
    const db = loadDb();
    db.settings = {
      ...db.settings,
      ...settings,
      revenuePerKm: Number(settings.revenuePerKm),
      licenseWarningDays: Number(settings.licenseWarningDays)
    };
    saveDb(db);
    return db.settings;
  },

  // Aggregate Calculations
  getVehicleOperationalCost: (regNum) => {
    const db = loadDb();
    const fuelCost = db.fuelLogs
      .filter(f => f.vehicleReg === regNum)
      .reduce((sum, f) => sum + f.cost, 0);

    const maintCost = db.maintenance
      .filter(m => m.vehicleReg === regNum && m.status === 'Completed')
      .reduce((sum, m) => sum + m.cost, 0);

    const expCost = db.expenses
      .filter(e => e.vehicleReg === regNum)
      .reduce((sum, e) => sum + e.cost, 0);

    return fuelCost + maintCost + expCost;
  },

  getVehicleRevenue: (regNum) => {
    const db = loadDb();
    return db.trips
      .filter(t => t.vehicleReg === regNum && t.status === 'Completed')
      .reduce((sum, t) => sum + (t.revenue || 0), 0);
  },

  getVehicleDistance: (regNum) => {
    const db = loadDb();
    return db.trips
      .filter(t => t.vehicleReg === regNum && t.status === 'Completed')
      .reduce((sum, t) => sum + (t.plannedDistance || 0), 0);
  },

  getVehicleFuelLiters: (regNum) => {
    const db = loadDb();
    return db.fuelLogs
      .filter(f => f.vehicleReg === regNum)
      .reduce((sum, f) => sum + f.liters, 0);
  }
};
