const test = require('node:test');
const assert = require('node:assert/strict');

const freshRequire = require('./fixtures/fresh-require');
const withGlobals = require('./fixtures/with-globals');
const { FakeXMLHttpRequest } = require('./fixtures/fake-xhr');

test('update_standard_Controls: calls page_context.update_Controls for each control', async () => {
  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');

      const prevControls = jsgui.controls;
      try {
        class Foo {}
        function Bar() {}
        jsgui.controls = { Foo, Bar };

        const calls = [];
        const pageContext = {
          update_Controls: (name, controlSubclass) => calls.push([name, controlSubclass]),
        };

        jsgui.update_standard_Controls(pageContext);
        assert.deepEqual(calls, [
          ['Foo', Foo],
          ['Bar', Bar],
        ]);
      } finally {
        jsgui.controls = prevControls;
      }
    }
  );
});

test('register_server_resources: stores definition on jsgui', async () => {
  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');
      const defs = { status: { name: 'status', type: 'function' } };
      jsgui.register_server_resources(defs);
      assert.equal(jsgui.def_server_resources, defs);
    }
  );
});

test('http + http_post: callback style receives (err, res)', async () => {
  FakeXMLHttpRequest.reset();

  await withGlobals(
    {
      window: { addEventListener() {} },
      document: { body: {} },
      XMLHttpRequest: FakeXMLHttpRequest,
    },
    async () => {
      const jsgui = freshRequire('client.js');

      await new Promise((resolve, reject) => {
        jsgui.http('/api/cb', (err, res) => {
          try {
            assert.equal(err, null);
            assert.deepEqual(res, { ok: true });
            resolve();
          } catch (e) {
            reject(e);
          }
        });
        FakeXMLHttpRequest.instances[0].respond({ status: 200, responseText: JSON.stringify({ ok: true }) });
      });

      await new Promise((resolve, reject) => {
        jsgui.http_post('/api/cb-post', { a: 1 }, (err, res) => {
          try {
            assert.ok(err);
            assert.equal(err.status, 500);
            assert.equal(res, undefined);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
        FakeXMLHttpRequest.instances[1].respond({ status: 500, responseText: 'fail' });
      });
    }
  );
});

