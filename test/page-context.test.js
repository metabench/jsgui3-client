const test = require('node:test');
const assert = require('node:assert/strict');

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
