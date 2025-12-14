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
    .e2e-toolbar {
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 10000050;
      display: flex;
      gap: 8px;
    }
    .e2e-toolbar button {
      padding: 6px 10px;
      border-radius: 4px;
    }
    .sse-display { padding: 12px; font-size: 18px; }
    `,
  ].join('\n');

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

class E2E_SSE_Value extends jsgui.Control {
  constructor(spec = {}) {
    super(spec);

    this.dom.attributes['data-testid'] = 'sse-root';

    this.model = new Data_Object();
    this.model.set('value', 0);

    this.display = new jsgui.Control({
      context: this.context,
      tagName: 'div',
      class: 'sse-display',
    });
    this.display.dom.attributes['data-testid'] = 'sse-display';
    this.add(this.display);

    this.model.on('change', (e) => {
      if (e && e.name === 'value') this.updateFromModel();
    });
  }

  get value() {
    return this.model.get('value');
  }

  set value(v) {
    this.model.set('value', v);
  }

  updateFromModel() {
    const v = this.value;
    const el = this.display.dom && this.display.dom.el;
    if (!el) return;
    el.textContent = `SSE value: ${v}`;
  }

  activate() {
    if (!this.__active) {
      super.activate();
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

  const toolbar = new controls.div({ context });
  toolbar.add_class('e2e-toolbar');
  toolbar.dom.attributes['data-testid'] = 'toolbar';

  const btnPush = new controls.button({ context, content: 'Push value 42' });
  btnPush.dom.attributes['data-testid'] = 'sse-push-42';
  toolbar.add(btnPush);
  body.add(toolbar);

  const win = new controls.Window({ context, title: 'SSE (binding)' });
  win.dom.attributes['data-testid'] = 'sse-window';
  win.dom.attributes.style.left = '40px';
  win.dom.attributes.style.top = '60px';
  win.dom.attributes.style['z-index'] = '20';

  const widget = new E2E_SSE_Value({ context });
  win.inner.add(widget);
  body.add(win);

  jsgui.pre_activate(context);
  jsgui.activate(context);

  const push = async (value) => {
    await fetch(`/api/sse-push?value=${encodeURIComponent(String(value))}`);
  };

  btnPush.on('click', () => {
    push(42);
  });

  window.__E2E__ = {
    ready: false,
    sseConnected: false,
    push,
  };

  const es = new EventSource('/sse/value');
  es.addEventListener('open', () => {
    window.__E2E__.sseConnected = true;
  });
  es.addEventListener('message', (evt) => {
    try {
      const parsed = JSON.parse(evt.data);
      if (parsed && typeof parsed.value !== 'undefined') {
        widget.value = parsed.value;
      }
    } catch {}
  });

  window.__E2E__.ready = true;
});
