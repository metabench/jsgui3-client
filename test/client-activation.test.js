const test = require('node:test');
const assert = require('node:assert/strict');

const freshRequire = require('./fixtures/fresh-require');
const withGlobals = require('./fixtures/with-globals');

test('client.js activate path: creates context and calls pre_activate/activate', async () => {
  const handlers = new Map();
  const windowStub = {
    addEventListener: (name, fn) => handlers.set(name, fn),
    requestAnimationFrame: () => {},
  };

  await withGlobals(
    {
      window: windowStub,
      document: { body: {} },
    },
    async () => {
      const jsgui = freshRequire('client.js');

      let preActivateArg;
      let activateArg;

      jsgui.pre_activate = (ctx) => {
        preActivateArg = ctx;
      };
      jsgui.activate = (ctx) => {
        activateArg = ctx;
      };
      jsgui.update_standard_Controls = () => {};
      jsgui.def_server_resources = {};

      const prevLog = console.log;
      console.log = () => {};
      try {
        const onLoad = handlers.get('load');
        assert.equal(typeof onLoad, 'function');
        onLoad();
      } finally {
        console.log = prevLog;
      }

      assert.ok(jsgui.context);
      assert.equal(preActivateArg, jsgui.context);
      assert.equal(activateArg, jsgui.context);
      assert.equal(global.page_context, undefined);
    }
  );
});

test('client.js activate path: refuses unsafe server resource names', async () => {
  const handlers = new Map();
  const windowStub = {
    addEventListener: (name, fn) => handlers.set(name, fn),
    requestAnimationFrame: () => {},
  };

  await withGlobals(
    {
      window: windowStub,
      document: { body: {} },
    },
    async () => {
      const jsgui = freshRequire('client.js');

      jsgui.pre_activate = () => {};
      jsgui.activate = () => {};
      jsgui.update_standard_Controls = () => {};
      jsgui.def_server_resources = {
        safe: { name: 'safe', type: 'function' },
        bad: { name: '__proto__', type: 'function' },
      };

      const prevWarn = console.warn;
      console.warn = () => {};
      try {
        const onLoad = handlers.get('load');
        onLoad();
      } finally {
        console.warn = prevWarn;
      }

      const dataResource = jsgui.context.resource_pool.data_resource;
      assert.equal(typeof dataResource.safe, 'function');
      assert.equal(Object.prototype.hasOwnProperty.call(dataResource, '__proto__'), false);
      assert.equal(({}).polluted, undefined);
    }
  );
});
