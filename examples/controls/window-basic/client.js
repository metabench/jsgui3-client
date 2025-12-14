const jsgui = require('../../../client.js');

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
    `,
  ].join('\n');

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

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

  const btnOpen = new controls.button({ context, content: 'Open window' });
  btnOpen.dom.attributes['data-testid'] = 'open-window';
  toolbar.add(btnOpen);
  body.add(toolbar);

  // Ensure toolbar + button are activated before binding DOM events.
  jsgui.pre_activate(context);
  jsgui.activate(context);

  let windowCount = 0;

  const openWindow = () => {
    windowCount++;
    const id = windowCount;

    const win = new controls.Window({
      context,
      title: `Window ${id}`,
    });

    win.dom.attributes['data-testid'] = `window-${id}`;
    win.dom.attributes.style.left = `${40 + (id - 1) * 30}px`;
    win.dom.attributes.style.top = `${60 + (id - 1) * 30}px`;
    win.dom.attributes.style['z-index'] = String(10 + id);

    const content = new controls.div({ context, content: `Hello from window ${id}` });
    content.dom.attributes['data-testid'] = `window-${id}-content`;
    win.inner.add(content);

    const titleBar = win.title_bar || win._ctrl_fields?.title_bar;
    if (titleBar) titleBar.dom.attributes['data-testid'] = `window-${id}-titlebar`;

    const btnClose = win._ctrl_fields?.btn_close;
    if (btnClose) btnClose.dom.attributes['data-testid'] = `window-${id}-close`;

    const btnMinimize = win._ctrl_fields?.btn_minimize;
    if (btnMinimize) btnMinimize.dom.attributes['data-testid'] = `window-${id}-minimize`;

    const btnMaximize = win._ctrl_fields?.btn_maximize;
    if (btnMaximize) btnMaximize.dom.attributes['data-testid'] = `window-${id}-maximize`;

    body.add(win);

    jsgui.pre_activate(context);
    jsgui.activate(context);

    return win;
  };

  btnOpen.on('click', () => openWindow());

  openWindow();

  window.__E2E__ = {
    ready: true,
    openWindow: () => openWindow(),
  };
});
