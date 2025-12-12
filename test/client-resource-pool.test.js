const test = require('node:test');
const assert = require('node:assert/strict');

test('Client_Resource_Pool.start: resolves true (promise + callback)', async () => {
  const Client_Resource_Pool = require('../client-resource-pool');

  const pool = new Client_Resource_Pool({});
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

