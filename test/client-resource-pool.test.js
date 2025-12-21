const test = require('node:test');
const assert = require('node:assert/strict');

test('Client_Resource_Pool.start: resolves true (promise + callback)', async () => {
  const Client_Resource_Pool = require('../client-resource-pool');

  const pool = new Client_Resource_Pool({});
  assert.ok(pool.data_resource);
  assert.equal(await pool.start(), true);

  await new Promise((resolve, reject) => {
    pool.start((err, res) => {
      if (err) return reject(err);
      try {
        assert.equal(res, true);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
});

test('Client_Resource_Pool.start: starts resources once requirements are met (multi-pass)', async () => {
  const Client_Resource_Pool = require('../client-resource-pool');

  const pool = new Client_Resource_Pool({});
  await pool.start();

  let startedA = false;
  const startOrder = [];

  const resB = {
    name: 'b',
    meets_requirements: () => startedA,
    start: (cb) => {
      startOrder.push('b');
      cb(null, true);
    },
  };

  const resA = {
    name: 'a',
    meets_requirements: () => true,
    start: (cb) => {
      startOrder.push('a');
      startedA = true;
      cb(null, true);
    },
  };

  // Add in an order that forces a second pass (b checked before a).
  pool.add(resB);
  pool.add(resA);

  assert.equal(await pool.start(), true);
  assert.deepEqual(startOrder, ['a', 'b']);
});

test('Client_Resource_Pool.start: rejects when requirements cannot be met', async () => {
  const Client_Resource_Pool = require('../client-resource-pool');

  const pool = new Client_Resource_Pool({});
  await pool.start();

  pool.add({
    name: 'never',
    meets_requirements: () => false,
    start: (cb) => cb(null, true),
  });

  await assert.rejects(
    pool.start(),
    (err) => err && err.code === 'RESOURCE_REQUIREMENTS_UNMET' && Array.isArray(err.remaining_resource_names) && err.remaining_resource_names.includes('never')
  );
});
