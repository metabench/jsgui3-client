const test = require('node:test');
const assert = require('node:assert/strict');

test('Data_Get_Post_Delete_HTTP_Resource: get/post/delete call correct HTTP helpers', async () => {
  const jsgui = require('jsgui3-html');
  const Data_Get_Post_Delete_HTTP_Resource = require('../data-get-post-delete-http-resource');

  const calls = [];

  const prev = {
    http: jsgui.http,
    http_post: jsgui.http_post,
    http_delete: jsgui.http_delete,
  };

  jsgui.http = (url, cb) => {
    calls.push(['get', url]);
    cb(null, { ok: true, url });
  };
  jsgui.http_post = (url, value, cb) => {
    calls.push(['post', url, value]);
    cb(null, { ok: true, url });
  };
  jsgui.http_delete = (url, cb) => {
    calls.push(['delete', url]);
    cb(null, { ok: true, url });
  };

  try {
    const r = new Data_Get_Post_Delete_HTTP_Resource({ name: 'dr' });

    assert.deepEqual(await r.get('items/1'), { ok: true, url: '/resources/items/1' });
    assert.deepEqual(await r.post('items/1', { a: 1 }), { ok: true, url: '/resources/items/1' });
    assert.deepEqual(await r.delete('items/1'), { ok: true, url: '/resources/items/1' });

    assert.deepEqual(calls, [
      ['get', '/resources/items/1'],
      ['post', '/resources/items/1', { a: 1 }],
      ['delete', '/resources/items/1'],
    ]);
  } finally {
    jsgui.http = prev.http;
    jsgui.http_post = prev.http_post;
    jsgui.http_delete = prev.http_delete;
  }
});

