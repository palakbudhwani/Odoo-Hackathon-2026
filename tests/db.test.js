import test from 'node:test';
import assert from 'node:assert/strict';
import { createDataStore, resetDataStore } from '../server/db.js';

test('creates a default store and supports CRUD for vehicles', async () => {
  const store = createDataStore();
  const vehicles = store.list('vehicles');
  assert.deepEqual(vehicles, []);

  const created = store.create('vehicles', {
    regNum: 'ABC-123',
    make: 'Toyota',
    model: 'Hiace',
    status: 'Available'
  });

  assert.equal(created.regNum, 'ABC-123');
  assert.equal(store.list('vehicles').length, 1);

  const updated = store.update('vehicles', created.id, { status: 'In Shop' });
  assert.equal(updated.status, 'In Shop');

  const removed = store.remove('vehicles', created.id);
  assert.equal(removed, true);
  assert.equal(store.list('vehicles').length, 0);

  resetDataStore();
});
