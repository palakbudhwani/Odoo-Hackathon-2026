import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'app.db.json');

const defaultState = {
  users: [
    { id: 'user-admin', name: 'Fleet Manager', email: 'admin@transitops.com', password: 'password123', role: 'Fleet Manager' },
    { id: 'user-dispatcher', name: 'Dispatcher', email: 'dispatcher@transitops.com', password: 'password123', role: 'Dispatcher' },
    { id: 'user-safety', name: 'Safety Officer', email: 'safety@transitops.com', password: 'password123', role: 'Safety Officer' },
    { id: 'user-finance', name: 'Financial Analyst', email: 'finance@transitops.com', password: 'password123', role: 'Financial Analyst' }
  ],
  vehicles: [],
  drivers: [],
  trips: [],
  maintenance: [],
  fuelLogs: [],
  expenses: [],
  settings: {
    currency: 'USD',
    revenuePerKm: 3,
    licenseWarningDays: 30
  }
};

function ensureDbFile() {
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultState, null, 2));
  }
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(raw);
}

function writeDb(state) {
  ensureDbFile();
  fs.writeFileSync(dbPath, JSON.stringify(state, null, 2));
}

function normalizeCollection(db, collection) {
  if (collection === 'settings') {
    db.settings = db.settings && typeof db.settings === 'object' && !Array.isArray(db.settings) ? db.settings : {};
    return;
  }

  if (!Array.isArray(db[collection])) {
    db[collection] = [];
  }
}

export function resetDataStore() {
  writeDb(defaultState);
}

export function createDataStore() {
  const db = readDb();

  Object.keys(defaultState).forEach((collection) => {
    normalizeCollection(db, collection);
  });

  return {
    list(collection) {
      if (collection === 'settings') {
        return db.settings || {};
      }
      normalizeCollection(db, collection);
      return [...(db[collection] || [])];
    },
    get(collection, id) {
      if (collection === 'settings') {
        return db.settings || null;
      }
      normalizeCollection(db, collection);
      return (db[collection] || []).find((item) => item.id === id) || null;
    },
    create(collection, payload) {
      if (collection === 'settings') {
        db.settings = { ...(db.settings || {}), ...payload };
        writeDb(db);
        return db.settings;
      }
      normalizeCollection(db, collection);
      const items = db[collection] || [];
      const created = { id: `${collection}-${Date.now()}-${Math.round(Math.random() * 1000)}`, ...payload };
      items.push(created);
      db[collection] = items;
      writeDb(db);
      return created;
    },
    update(collection, id, payload) {
      if (collection === 'settings') {
        db.settings = { ...(db.settings || {}), ...payload };
        writeDb(db);
        return db.settings;
      }
      normalizeCollection(db, collection);
      const items = db[collection] || [];
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return null;
      items[index] = { ...items[index], ...payload };
      db[collection] = items;
      writeDb(db);
      return items[index];
    },
    remove(collection, id) {
      if (collection === 'settings') {
        db.settings = {};
        writeDb(db);
        return true;
      }
      normalizeCollection(db, collection);
      const items = db[collection] || [];
      const filtered = items.filter((item) => item.id !== id);
      if (filtered.length === items.length) return false;
      db[collection] = filtered;
      writeDb(db);
      return true;
    },
    getState() {
      return JSON.parse(JSON.stringify(db));
    }
  };
}
