const test = require('node:test');
const assert = require('node:assert/strict');

// ---------------------------------------------------------------------------
// Helper: save and restore jsgui HTTP stubs around each test
// ---------------------------------------------------------------------------
function withMockHttp(fn) {
  return async () => {
    const jsgui = require('jsgui3-html');
    const Data_Get_Post_Delete_HTTP_Resource = require('../data-get-post-delete-http-resource');

    const prev = {
      http: jsgui.http,
      http_post: jsgui.http_post,
      http_delete: jsgui.http_delete,
    };

    try {
      await fn(jsgui, Data_Get_Post_Delete_HTTP_Resource);
    } finally {
      jsgui.http = prev.http;
      jsgui.http_post = prev.http_post;
      jsgui.http_delete = prev.http_delete;
    }
  };
}

// ===========================================================================
// CRUD basics (original test)
// ===========================================================================

test('get/post/delete call correct HTTP helpers and URLs', withMockHttp(async (jsgui, Res) => {
  const calls = [];

  jsgui.http = (url, cb) => { calls.push(['get', url]); cb(null, { ok: true, url }); };
  jsgui.http_post = (url, value, cb) => { calls.push(['post', url, value]); cb(null, { ok: true, url }); };
  jsgui.http_delete = (url, cb) => { calls.push(['delete', url]); cb(null, { ok: true, url }); };

  const r = new Res({ name: 'dr' });

  assert.deepEqual(await r.get('items/1'), { ok: true, url: '/resources/items/1' });
  assert.deepEqual(await r.post('items/1', { a: 1 }), { ok: true, url: '/resources/items/1' });
  assert.deepEqual(await r.delete('items/1'), { ok: true, url: '/resources/items/1' });

  assert.deepEqual(calls, [
    ['get', '/resources/items/1'],
    ['post', '/resources/items/1', { a: 1 }],
    ['delete', '/resources/items/1'],
  ]);
}));

// ===========================================================================
// query() — happy path
// ===========================================================================

test('query() posts params to default /resources/query URL', withMockHttp(async (jsgui, Res) => {
  const mockResponse = {
    rows: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
    total_count: 50,
    page: 1,
    page_size: 25,
  };

  let capturedUrl, capturedParams;
  jsgui.http_post = (url, value, cb) => {
    capturedUrl = url;
    capturedParams = value;
    cb(null, mockResponse);
  };

  const r = new Res({ name: 'dr' });
  const params = {
    table: 'users',
    page: 1,
    page_size: 25,
    sort: { key: 'name', dir: 'asc' },
    filters: { active: true },
  };

  const result = await r.query(params);

  assert.equal(capturedUrl, '/resources/query');
  assert.deepEqual(capturedParams, params);
  assert.deepEqual(result, mockResponse);
  assert.equal(result.rows.length, 2);
  assert.equal(result.total_count, 50);
}));

// ===========================================================================
// query() — custom query_path
// ===========================================================================

test('query() uses custom query_path from spec', withMockHttp(async (jsgui, Res) => {
  let capturedUrl;
  jsgui.http_post = (url, _value, cb) => {
    capturedUrl = url;
    cb(null, { rows: [], total_count: 0, page: 1, page_size: 10 });
  };

  const r = new Res({ name: 'dr', query_path: '/api/v2/data/query' });

  await r.query({ table: 'orders', page: 1, page_size: 10 });
  assert.equal(capturedUrl, '/api/v2/data/query');
}));

// ===========================================================================
// query() — callback style
// ===========================================================================

test('query() works with callback style', withMockHttp(async (jsgui, Res) => {
  const mockResponse = { rows: [{ id: 1 }], total_count: 1, page: 1, page_size: 10 };
  jsgui.http_post = (_url, _value, cb) => cb(null, mockResponse);

  const r = new Res({ name: 'dr' });

  const result = await new Promise((resolve, reject) => {
    r.query({ table: 'items', page: 1, page_size: 10 }, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

  assert.deepEqual(result, mockResponse);
}));

// ===========================================================================
// query() — error handling
// ===========================================================================

test('query() rejects promise on HTTP error', withMockHttp(async (jsgui, Res) => {
  const expectedError = new Error('Network failure');
  jsgui.http_post = (_url, _value, cb) => cb(expectedError);

  const r = new Res({ name: 'dr' });

  await assert.rejects(
    () => r.query({ table: 'items', page: 1, page_size: 10 }),
    (err) => {
      assert.equal(err, expectedError);
      assert.equal(err.message, 'Network failure');
      return true;
    }
  );
}));

test('query() passes error to callback on HTTP error', withMockHttp(async (jsgui, Res) => {
  const expectedError = new Error('Server error 500');
  jsgui.http_post = (_url, _value, cb) => cb(expectedError);

  const r = new Res({ name: 'dr' });

  const result = await new Promise((resolve) => {
    r.query({ table: 'items', page: 1, page_size: 10 }, (err, res) => {
      resolve({ err, res });
    });
  });

  assert.equal(result.err, expectedError);
  assert.equal(result.res, undefined);
}));

// ===========================================================================
// query() — edge cases with null/undefined optional params
// ===========================================================================

test('query() sends null sort and filters correctly', withMockHttp(async (jsgui, Res) => {
  let capturedParams;
  jsgui.http_post = (_url, value, cb) => {
    capturedParams = value;
    cb(null, { rows: [], total_count: 0, page: 1, page_size: 50 });
  };

  const r = new Res({ name: 'dr' });
  const params = { table: 'logs', page: 1, page_size: 50, sort: null, filters: null };
  await r.query(params);

  assert.equal(capturedParams.sort, null);
  assert.equal(capturedParams.filters, null);
  assert.equal(capturedParams.table, 'logs');
}));

test('query() sends minimal params (only required fields)', withMockHttp(async (jsgui, Res) => {
  let capturedParams;
  jsgui.http_post = (_url, value, cb) => {
    capturedParams = value;
    cb(null, { rows: [], total_count: 0, page: 1, page_size: 20 });
  };

  const r = new Res({ name: 'dr' });
  await r.query({ table: 'events', page: 1, page_size: 20 });

  assert.equal(capturedParams.table, 'events');
  assert.equal(capturedParams.page, 1);
  assert.equal(capturedParams.page_size, 20);
  assert.equal(capturedParams.sort, undefined);
  assert.equal(capturedParams.filters, undefined);
}));

// ===========================================================================
// create_data_source() — happy path
// ===========================================================================

test('create_data_source() returns a working data source function', withMockHttp(async (jsgui, Res) => {
  const mockResponse = {
    rows: [{ id: 10, title: 'Item 10' }],
    total_count: 100,
    page: 3,
    page_size: 10,
  };

  let capturedUrl, capturedParams;
  jsgui.http_post = (url, value, cb) => {
    capturedUrl = url;
    capturedParams = value;
    cb(null, mockResponse);
  };

  const dataSource = Res.create_data_source('/api/items/query');

  assert.equal(typeof dataSource, 'function');

  const params = { table: 'items', page: 3, page_size: 10, sort: null, filters: null };
  const result = await dataSource(params);

  assert.equal(capturedUrl, '/api/items/query');
  assert.deepEqual(capturedParams, params);
  assert.deepEqual(result, mockResponse);
}));

// ===========================================================================
// create_data_source() — error handling
// ===========================================================================

test('create_data_source() rejects on HTTP error', withMockHttp(async (jsgui, Res) => {
  const expectedError = new Error('Connection refused');
  jsgui.http_post = (_url, _value, cb) => cb(expectedError);

  const dataSource = Res.create_data_source('/api/broken');

  await assert.rejects(
    () => dataSource({ table: 'x', page: 1, page_size: 10 }),
    (err) => {
      assert.equal(err.message, 'Connection refused');
      return true;
    }
  );
}));

// ===========================================================================
// create_data_source() — reusability
// ===========================================================================

test('create_data_source() function is reusable across multiple calls', withMockHttp(async (jsgui, Res) => {
  let callCount = 0;
  jsgui.http_post = (_url, value, cb) => {
    callCount++;
    cb(null, { rows: [], total_count: callCount * 10, page: value.page, page_size: value.page_size });
  };

  const dataSource = Res.create_data_source('/api/data/query');

  const result1 = await dataSource({ table: 'a', page: 1, page_size: 5 });
  const result2 = await dataSource({ table: 'a', page: 2, page_size: 5 });
  const result3 = await dataSource({ table: 'b', page: 1, page_size: 10 });

  assert.equal(callCount, 3);
  assert.equal(result1.total_count, 10);
  assert.equal(result2.total_count, 20);
  assert.equal(result2.page, 2);
  assert.equal(result3.total_count, 30);
  assert.equal(result3.page_size, 10);
}));

// ===========================================================================
// Constructor defaults
// ===========================================================================

test('constructor defaults query_path to /resources/query', withMockHttp(async (jsgui, Res) => {
  let capturedUrl;
  jsgui.http_post = (url, _value, cb) => {
    capturedUrl = url;
    cb(null, { rows: [], total_count: 0, page: 1, page_size: 10 });
  };

  // No query_path in spec
  const r = new Res({ name: 'dr' });
  await r.query({ table: 'test', page: 1, page_size: 10 });
  assert.equal(capturedUrl, '/resources/query');
}));
