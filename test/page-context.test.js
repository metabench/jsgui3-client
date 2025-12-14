const test = require('node:test');
const assert = require('node:assert/strict');

const withGlobals = require('./fixtures/with-globals');

test('Client_Page_Context: modal getter memoizes and adds to body', () => {
  const Client_Page_Context = require('../page-context');
  const ctx = new Client_Page_Context({ document: { body: {} } });

  let addCount = 0;
  ctx.body = () => ({ add: () => addCount++ });

  const a = ctx.modal;
  const b = ctx.modal;
  assert.equal(a, b);
  assert.equal(addCount, 1);
});

test('Client_Page_Context: overlay getter memoizes, activates, and supports place("below")', () => {
  const jsgui = require('jsgui3-html');
  const Client_Page_Context = require('../page-context');

  const ctx = new Client_Page_Context({ document: { body: {} } });

  let addCount = 0;
  ctx.body = () => ({
    add: () => addCount++,
    bcr: () => [
      [0, 0],
      [1000, 800],
    ],
  });

  let activateCount = 0;
  const prevActivate = jsgui.Control.prototype.activate;
  jsgui.Control.prototype.activate = function patchedActivate(...args) {
    activateCount++;
    return prevActivate.apply(this, args);
  };

  try {
    const overlayA = ctx.overlay;
    const overlayB = ctx.overlay;
    assert.equal(overlayA, overlayB);
    assert.equal(addCount, 1);
    assert.equal(activateCount, 1);
    assert.equal(typeof overlayA.place, 'function');

    const ctrlTarget = new jsgui.Control({ context: ctx });
    ctrlTarget.bcr = () => [[10, 20], [110, 70]];
    const ctrlToPlace = new jsgui.Control({ context: ctx });

    overlayA.bcr = () => [[0, 0], [400, 300]];
    overlayA.place(ctrlToPlace, ['below', ctrlTarget]);

    assert.deepEqual(ctrlToPlace.pos, [10, 70]);
    assert.equal(ctrlToPlace.dom.attributes.style.position, 'absolute');
    assert.equal(ctrlToPlace.dom.attributes.style['max-height'], '730px');
  } finally {
    jsgui.Control.prototype.activate = prevActivate;
  }
});

test('Client_Page_Context.body: uses ctx.document.body and sets data-jsgui-id', () => {
  const jsgui = require('jsgui3-html');
  const Client_Page_Context = require('../page-context');

  const attrs = new Map();
  const bodyEl = {
    getAttribute: (name) => attrs.get(name),
    setAttribute: (name, value) => attrs.set(name, value),
  };

  const ctx = new Client_Page_Context({ document: { body: bodyEl } });
  ctx.register_control = (ctrl) => {
    ctx.map_controls[ctrl._id()] = ctrl;
  };

  const prevBody = jsgui.body;
  let receivedEl;

  jsgui.body = function StubBody(spec) {
    receivedEl = spec.el;
    this.dom = { el: spec.el };
    this._id = () => 'body_0';
  };

  try {
    const bodyCtrl1 = ctx.body();
    const bodyCtrl2 = ctx.body();

    assert.equal(bodyCtrl1, bodyCtrl2);
    assert.equal(receivedEl, bodyEl);
    assert.equal(bodyEl.getAttribute('data-jsgui-id'), 'body_0');
    assert.equal(ctx.map_controls.body_0, bodyCtrl1);
  } finally {
    jsgui.body = prevBody;
  }
});

test('Client_Page_Context.body: returns existing mapped body control when data-jsgui-id present', () => {
  const Client_Page_Context = require('../page-context');

  const bodyEl = {
    getAttribute: () => 'body_existing',
    setAttribute: () => {},
  };

  const ctx = new Client_Page_Context({ document: { body: bodyEl } });
  const existingCtrl = { name: 'existing-body' };
  ctx.map_controls.body_existing = existingCtrl;

  assert.equal(ctx.body(), existingCtrl);
});

test('Client_Page_Context.body: creates and registers body when data-jsgui-id present but missing from map_controls', () => {
  const jsgui = require('jsgui3-html');
  const Client_Page_Context = require('../page-context');

  const attrs = new Map([['data-jsgui-id', 'body_existing']]);
  const bodyEl = {
    getAttribute: (name) => attrs.get(name),
    setAttribute: (name, value) => attrs.set(name, value),
  };

  const ctx = new Client_Page_Context({ document: { body: bodyEl } });
  ctx.register_control = (ctrl) => {
    ctx.map_controls[ctrl._id()] = ctrl;
  };

  const prevBody = jsgui.body;
  jsgui.body = function StubBody(spec) {
    this.dom = { el: spec.el };
    this._id = () => spec.el.getAttribute('data-jsgui-id');
  };

  try {
    const bodyCtrl = ctx.body();
    assert.ok(bodyCtrl);
    assert.equal(ctx.map_controls.body_existing, bodyCtrl);
  } finally {
    jsgui.body = prevBody;
  }
});

test('Client_Page_Context frame: includes controls added during the frame', async () => {
  const Client_Page_Context = require('../page-context');

  const rafQueue = [];
  const windowStub = {
    addEventListener: () => {},
    requestAnimationFrame: (fn) => rafQueue.push(fn),
  };

  await withGlobals({ window: windowStub }, async () => {
    const ctx = new Client_Page_Context({ document: { body: {} } });

    const addedCtrl = { name: 'added' };
    ctx.map_controls_being_added_in_frame = { added_1: addedCtrl };

    let lastFrame;
    ctx.on('frame', (e) => {
      lastFrame = e;
    });

    ctx.raise('activate', { context: ctx });
    assert.ok(rafQueue.length >= 1);
    rafQueue.shift()(0);

    assert.equal(lastFrame.count_ctrls_added, 1);
    assert.equal(lastFrame.map_dom_controls.added_1, addedCtrl);
  });
});

test('Client_Page_Context frame: removal in first frame does not throw', async () => {
  const Client_Page_Context = require('../page-context');

  const rafQueue = [];
  const windowStub = {
    addEventListener: () => {},
    requestAnimationFrame: (fn) => rafQueue.push(fn),
  };

  await withGlobals({ window: windowStub }, async () => {
    const ctx = new Client_Page_Context({ document: { body: {} } });

    const el = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 10,
        height: 20,
        right: 10,
        bottom: 20,
      }),
    };
    const ctrl = { dom: { el } };
    ctx.map_controls.ctrl_1 = ctrl;
    ctx.map_controls_being_removed_in_frame = { ctrl_1: true };

    let lastFrame;
    ctx.on('frame', (e) => {
      lastFrame = e;
    });

    ctx.raise('activate', { context: ctx });
    assert.ok(rafQueue.length >= 1);
    rafQueue.shift()(0);

    assert.equal(lastFrame.count_ctrls_removed, 1);
    assert.equal(Object.prototype.hasOwnProperty.call(lastFrame.map_dom_controls, 'ctrl_1'), false);
  });
});
