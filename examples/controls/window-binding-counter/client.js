const jsgui = require('../../../client.js');
const { Data_Object } = require('lang-tools');

const { controls } = jsgui;

const injectCss = () => {
  const css = [
    controls.Window?.css || '',
    jsgui.Client_Page_Context?.css || '',
    `
    html, body { height: 100%; }
    body { margin: 0; overflow: hidden; font-family: Arial, sans-serif; }
    .simple-counter { padding: 12px; }
    .counter-display { font-size: 18px; margin-bottom: 10px; }
    .counter-display.positive { color: #0a7; }
    .counter-display.negative { color: #c33; }
    .counter-buttons { display: flex; gap: 8px; margin-bottom: 10px; }
    .counter-buttons button { padding: 6px 10px; }
    .counter-info { font-size: 13px; color: #333; }
    `,
  ].join('\n');

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

class E2E_Counter extends jsgui.Control {
  constructor(spec = {}) {
    super(spec);
    this.add_class('simple-counter');
    this.dom.attributes['data-testid'] = 'counter-root';

    this.model = new Data_Object();
    this.model.set('count', spec.initialCount ?? 0);

    this.display = new jsgui.Control({
      context: this.context,
      tagName: 'div',
      class: 'counter-display',
    });
    this.display.dom.attributes['data-testid'] = 'counter-display';
    this.add(this.display);

    const buttons = new jsgui.Control({
      context: this.context,
      tagName: 'div',
      class: 'counter-buttons',
    });

    this.btnDecrement = new jsgui.Control({
      context: this.context,
      tagName: 'button',
      content: '−',
    });
    this.btnDecrement.dom.attributes['data-testid'] = 'counter-decrement';
    buttons.add(this.btnDecrement);

    this.btnReset = new jsgui.Control({
      context: this.context,
      tagName: 'button',
      content: 'Reset',
    });
    this.btnReset.dom.attributes['data-testid'] = 'counter-reset';
    buttons.add(this.btnReset);

    this.btnIncrement = new jsgui.Control({
      context: this.context,
      tagName: 'button',
      content: '+',
    });
    this.btnIncrement.dom.attributes['data-testid'] = 'counter-increment';
    buttons.add(this.btnIncrement);

    this.add(buttons);

    this.info = new jsgui.Control({
      context: this.context,
      tagName: 'div',
      class: 'counter-info',
    });
    this.info.dom.attributes['data-testid'] = 'counter-info';
    this.add(this.info);

    this.model.on('change', (e) => {
      if (e && e.name === 'count') this.updateFromModel();
    });
  }

  get count() {
    const current = this.model.get('count');
    return typeof current === 'number' ? current : Number(current) || 0;
  }

  set count(value) {
    this.model.set('count', value);
  }

  increment() {
    this.count = this.count + 1;
  }

  decrement() {
    this.count = this.count - 1;
  }

  reset() {
    this.count = 0;
  }

  updateFromModel() {
    const count = this.count;
    const displayEl = this.display.dom && this.display.dom.el;
    const infoEl = this.info.dom && this.info.dom.el;

    if (!displayEl || !infoEl) return;

    displayEl.textContent = `Count: ${count}`;
    displayEl.classList.toggle('positive', count > 0);
    displayEl.classList.toggle('negative', count <= 0);
    displayEl.classList.toggle('even', count % 2 === 0);
    displayEl.classList.toggle('odd', count % 2 !== 0);

    const sign = count > 0 ? 'positive' : 'negative or zero';
    const parity = count % 2 === 0 ? 'even' : 'odd';
    infoEl.textContent = `The count is ${sign} and ${parity}.`;
  }

  activate() {
    if (!this.__active) {
      super.activate();
      this.btnDecrement.on('click', () => this.decrement());
      this.btnReset.on('click', () => this.reset());
      this.btnIncrement.on('click', () => this.increment());
      this.updateFromModel();
    }
  }
}

// Ensure client.js activation path has safe defaults.
jsgui.register_server_resources({});

jsgui.on('activate', ({ context }) => {
  injectCss();

  const body = context.body();
  jsgui.pre_activate(context);
  jsgui.activate(context);

  const win = new controls.Window({ context, title: 'Counter (binding)' });
  win.dom.attributes['data-testid'] = 'counter-window';
  win.dom.attributes.style.left = '40px';
  win.dom.attributes.style.top = '60px';
  win.dom.attributes.style['z-index'] = '20';

  const btnClose = win._ctrl_fields?.btn_close;
  if (btnClose) btnClose.dom.attributes['data-testid'] = 'counter-window-close';

  const counter = new E2E_Counter({ context, initialCount: 0 });
  win.inner.add(counter);

  body.add(win);
  jsgui.pre_activate(context);
  jsgui.activate(context);

  window.__E2E__ = { ready: true };
});
