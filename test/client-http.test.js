const test = require('node:test');
const assert = require('node:assert/strict');

const freshRequire = require('./fixtures/fresh-require');
const withGlobals = require('./fixtures/with-globals');
const { FakeXMLHttpRequest } = require('./fixtures/fake-xhr');

test('client.js (browser): wires HTTP helpers and load handler', async (t) => {
  FakeXMLHttpRequest.reset();

  const events = [];
  const windowStub = {
    addEventListener: (name, fn) => events.push([name, fn]),
  };

  await withGlobals(
    {
      window: windowStub,
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');
      assert.equal(typeof jsgui.http, 'function');
      assert.equal(typeof jsgui.http_post, 'function');
      assert.equal(typeof jsgui.http_delete, 'function');
      assert.equal(typeof jsgui.update_standard_Controls, 'function');
      assert.equal(typeof jsgui.register_server_resources, 'function');
      assert.equal(typeof jsgui.register_context_data, 'function');

      const loadHandlers = events.filter(([name]) => name === 'load').map(([, fn]) => fn);
      assert.equal(loadHandlers.length, 1);
      assert.equal(typeof loadHandlers[0], 'function');
    }
  );
});

test('http(GET): sets timeout, parses JSON, resolves', async () => {
  FakeXMLHttpRequest.reset();

  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');

      const promise = jsgui.http('/api/example');
      assert.equal(FakeXMLHttpRequest.instances.length, 1);
      const req = FakeXMLHttpRequest.instances[0];

      assert.equal(req.method, 'GET');
      assert.equal(req.url, '/api/example');
      assert.equal(req.async, true);
      assert.equal(req.timeout, 2500);

      req.respond({ status: 200, responseText: JSON.stringify({ ok: true }) });
      await assert.doesNotReject(promise);
      assert.deepEqual(await promise, { ok: true });
    }
  );
});

test('http(GET): rejects with status on non-200', async () => {
  FakeXMLHttpRequest.reset();

  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');
      const promise = jsgui.http('/api/missing');
      const req = FakeXMLHttpRequest.instances[0];
      req.respond({ status: 404, responseText: 'not found' });
      await assert.rejects(promise, (err) => err === 404);
    }
  );
});

test('http(GET): rejects with {status,responseText,parse_error} on invalid JSON', async () => {
  FakeXMLHttpRequest.reset();

  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');
      const promise = jsgui.http('/api/bad-json');
      const req = FakeXMLHttpRequest.instances[0];
      req.respond({ status: 200, responseText: 'not json' });
      await assert.rejects(promise, (err) => err && err.status === 200 && err.parse_error === true && err.responseText === 'not json');
    }
  );
});

test('http_post: JSON-serializes objects and sets content-type', async () => {
  FakeXMLHttpRequest.reset();

  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');

      const promise = jsgui.http_post('/api/post', { a: 1, b: 'two' });
      const req = FakeXMLHttpRequest.instances[0];

      assert.equal(req.method, 'POST');
      assert.equal(req.url, '/api/post');
      assert.equal(req.timeout, 2500);
      assert.equal(req.requestHeaders['content-type'], 'application/json');
      assert.equal(req.sentBody, JSON.stringify({ a: 1, b: 'two' }));

      req.respond({ status: 200, responseText: JSON.stringify({ saved: true }) });
      assert.deepEqual(await promise, { saved: true });
    }
  );
});

test('http_post: sends strings without forcing JSON content-type', async () => {
  FakeXMLHttpRequest.reset();

  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');

      const promise = jsgui.http_post('/api/post', 'hello');
      const req = FakeXMLHttpRequest.instances[0];

      assert.equal(req.method, 'POST');
      assert.equal(req.url, '/api/post');
      assert.equal(req.requestHeaders['content-type'], undefined);
      assert.equal(req.sentBody, 'hello');

      req.respond({ status: 200, responseText: JSON.stringify({ ok: 1 }) });
      assert.deepEqual(await promise, { ok: 1 });
    }
  );
});

test('http_post: sends buffers as-is', async () => {
  FakeXMLHttpRequest.reset();

  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');

      const buf = Buffer.from([1, 2, 3]);
      const promise = jsgui.http_post('/api/post', buf);
      const req = FakeXMLHttpRequest.instances[0];

      assert.equal(req.sentBody, buf);
      req.respond({ status: 200, responseText: JSON.stringify({ bytes: 3 }) });
      assert.deepEqual(await promise, { bytes: 3 });
    }
  );
});

test('http_post: rejects with {status,responseText} on non-200', async () => {
  FakeXMLHttpRequest.reset();

  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');
      const promise = jsgui.http_post('/api/post', { a: 1 });
      const req = FakeXMLHttpRequest.instances[0];
      req.respond({ status: 500, responseText: 'nope' });
      await assert.rejects(promise, (err) => err && err.status === 500 && err.responseText === 'nope');
    }
  );
});

test('http_delete: uses DELETE and parses JSON', async () => {
  FakeXMLHttpRequest.reset();

  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');
      const promise = jsgui.http_delete('/api/item/1');
      const req = FakeXMLHttpRequest.instances[0];
      assert.equal(req.method, 'DELETE');
      assert.equal(req.url, '/api/item/1');
      assert.equal(req.timeout, 2500);
      req.respond({ status: 200, responseText: JSON.stringify({ deleted: true }) });
      assert.deepEqual(await promise, { deleted: true });
    }
  );
});

test('http_delete: rejects with {status,responseText,parse_error} on invalid JSON', async () => {
  FakeXMLHttpRequest.reset();

  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');
      const promise = jsgui.http_delete('/api/bad-json-del');
      const req = FakeXMLHttpRequest.instances[0];
      req.respond({ status: 200, responseText: 'nope' });
      await assert.rejects(promise, (err) => err && err.status === 200 && err.parse_error === true && err.responseText === 'nope');
    }
  );
});

test('http(GET): supports custom jsgui.timeout', async () => {
  FakeXMLHttpRequest.reset();

  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');
      jsgui.timeout = 1234;

      const promise = jsgui.http('/api/example');
      const req = FakeXMLHttpRequest.instances[0];
      assert.equal(req.timeout, 1234);

      req.respond({ status: 200, responseText: JSON.stringify({ ok: true }) });
      assert.deepEqual(await promise, { ok: true });
    }
  );
});

test('http_post: rejects with {timeout:true} on XHR timeout', async () => {
  FakeXMLHttpRequest.reset();

  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');
      const promise = jsgui.http_post('/api/timeout', { a: 1 });
      const req = FakeXMLHttpRequest.instances[0];
      req.ontimeout();
      await assert.rejects(promise, (err) => err && err.timeout === true && err.status === 0);
    }
  );
});

test('http_delete: rejects with {network_error:true} on XHR error', async () => {
  FakeXMLHttpRequest.reset();

  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');
      const promise = jsgui.http_delete('/api/error');
      const req = FakeXMLHttpRequest.instances[0];
      req.onerror();
      await assert.rejects(promise, (err) => err && err.network_error === true && err.status === 0);
    }
  );
});
