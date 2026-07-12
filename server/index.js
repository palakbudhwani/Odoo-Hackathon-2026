import express from 'express';
import cors from 'cors';
import { createDataStore, resetDataStore } from './db.js';

const app = express();
const port = process.env.PORT || 5000;
const allowedCollections = ['users', 'vehicles', 'drivers', 'trips', 'maintenance', 'fuelLogs', 'expenses', 'settings'];

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'TransitOps backend is running' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const store = createDataStore();
  const user = store.list('users').find((entry) => entry.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post('/api/signup', (req, res) => {
  const store = createDataStore();
  const payload = req.body || {};
  const user = store.create('users', {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role || 'Fleet Manager'
  });
  return res.status(201).json(user);
});

app.post('/api/reset', (_req, res) => {
  resetDataStore();
  return res.json({ success: true });
});

app.get('/api/:collection', (req, res) => {
  const store = createDataStore();
  const { collection } = req.params;
  if (!allowedCollections.includes(collection)) {
    return res.status(404).json({ message: 'Collection not found' });
  }

  return res.json(store.list(collection));
});

app.post('/api/:collection', (req, res) => {
  const store = createDataStore();
  const { collection } = req.params;
  const payload = req.body;

  if (!allowedCollections.includes(collection)) {
    return res.status(404).json({ message: 'Collection not found' });
  }

  return res.status(201).json(store.create(collection, payload));
});

app.put('/api/:collection/:id', (req, res) => {
  const store = createDataStore();
  const { collection, id } = req.params;
  const payload = req.body;

  if (!allowedCollections.includes(collection)) {
    return res.status(404).json({ message: 'Collection not found' });
  }

  const updated = store.update(collection, id, payload);
  if (!updated) {
    return res.status(404).json({ message: 'Item not found' });
  }

  return res.json(updated);
});

app.delete('/api/:collection/:id', (req, res) => {
  const store = createDataStore();
  const { collection, id } = req.params;

  if (!allowedCollections.includes(collection)) {
    return res.status(404).json({ message: 'Collection not found' });
  }

  const removed = store.remove(collection, id);
  if (!removed) {
    return res.status(404).json({ message: 'Item not found' });
  }

  return res.json({ success: true });
});

app.listen(port, () => {
  console.log(`TransitOps backend listening on port ${port}`);
});
