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
    }
  );
});
