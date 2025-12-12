const test = require('node:test');
const assert = require('node:assert/strict');

test('Client_Resource.get: builds resources/<name>/<path>.json URL', async () => {
  const jsgui = require('jsgui3-html');
  const Client_Resource = require('../resource');

  const urls = [];
  const prevHttp = jsgui.http;
  jsgui.http = (url, cb) => {
    urls.push(url);
    cb(null, { ok: true, url });
  };

  try {
    const res = new Client_Resource({ name: 'my_resource' });

    const a = await res.get('alpha');
    assert.deepEqual(a, { ok: true, url: 'resources/my_resource/alpha.json' });

    const b = await res.get('beta.json');
    assert.deepEqual(b, { ok: true, url: 'resources/my_resource/beta.json' });

    assert.deepEqual(urls, ['resources/my_resource/alpha.json', 'resources/my_resource/beta.json']);
  } finally {
    jsgui.http = prevHttp;
  }
});

test('Client_Resource.status: GETs /resources/<name>/status.json', async () => {
  const jsgui = require('jsgui3-html');
  const Client_Resource = require('../resource');

  let seenUrl;
  const prevHttp = jsgui.http;
  jsgui.http = async (url) => {
    seenUrl = url;
    return { up: true };
  };

  try {
    const res = new Client_Resource({ name: 'svc' });
    const status = await res.status;
    assert.equal(seenUrl, '/resources/svc/status.json');
    assert.deepEqual(status, { up: true });
  } finally {
    jsgui.http = prevHttp;
  }
});

test('Client_Resource: re-emits Data_Object change as resource change', async () => {
  const Client_Resource = require('../resource');
  const res = new Client_Resource({ name: 'r' });

  let seen;
  res.on('change', (...args) => {
    seen = args;
  });

  if (typeof res.data?.set !== 'function') {
    assert.fail('Expected res.data.set to exist (Data_Object)');
  }

  res.data.set('x', 123);
  assert.equal(seen.length >= 1, true);
  assert.equal(typeof seen[0], 'object');
  assert.equal(seen[0].name, 'x');
  assert.equal(seen[0].value, 123);
});
