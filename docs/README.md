# JSGUI3 Client Documentation

Comprehensive guide to the `jsgui3-client` package, how it extends `jsgui3-html`, and how it fits into the wider JSGUI3 ecosystem alongside `jsgui3-server`.

## Ecosystem at a Glance

- **jsgui3-html**: Core control and rendering layer (HTML abstraction, control base classes). Used by both client and server packages.
- **jsgui3-client** (this package): Browser-focused runtime that layers HTTP helpers, client resource pools, page context, and client-ready controls on top of `jsgui3-html`.
- **jsgui3-server**: Node.js server that bundles/serves JSGUI3 controls, injects CSS, exposes APIs, and coordinates data flow to the browser. It loads the client bundle produced from `jsgui3-client` and your app code.

## What jsgui3-client Provides

- **HTTP utilities**: `http`, `http_post`, `http_delete` helpers with JSON serialization, timeouts, and error handling.
- **Client resources**: `Client_Resource_Pool` plus HTTP-backed data resources (GET/POST/DELETE) for talking to server publishers and APIs.
- **Page context**: `Client_Page_Context` for DOM-aware control activation, modal helpers, and element mapping.
- **Controls**: Uses controls from `jsgui3-html` (for example `Control` and `Modal`) and adds browser-side lifecycle glue around them via `Client_Page_Context`.
- **Integration glue**: Exports a ready-to-use `jsgui` object that merges `jsgui3-html` primitives with client/browser capabilities (HTTP helpers, resources, page context).

## Using jsgui3-client with jsgui3-server

1. **Define your client entry** (commonly `client.js` in your app):
   ```javascript
   const jsgui = require('jsgui3-client');
   const { controls, Client_Page_Context } = jsgui;
   
   class My_App extends controls.Active_HTML_Document {
     constructor(spec = {}) {
       spec.__type_name = spec.__type_name || 'my_app';
       super(spec);
       const { context } = this;
       if (typeof this.body.add_class === 'function') this.body.add_class('my-app');
       if (!spec.el) {
         // Compose controls using jsgui3-html primitives and client helpers.
       }
     }
   }
   
   controls.My_App = My_App;
   module.exports = jsgui;
   ```

2. **Serve it with jsgui3-server** (example `server.js`):
   ```javascript
   const Server = require('jsgui3-server');
   const { My_App } = require('./client').controls;
   
   Server.serve({
     page: { content: My_App, title: 'My App' },
     src_path_client_js: require.resolve('./client.js'),
     api: {
       status: () => ({ ok: true })
     },
     port: 8080
   });
   ```

3. **Call server APIs from the browser** with the client helpers:
   ```javascript
   const jsgui = require('jsgui3-client');
   jsgui.http('/api/status').then(console.log);
   ```

### How the pieces fit

- `jsgui3-server` bundles your `client.js` (which is built on `jsgui3-client` + `jsgui3-html`) and serves it with HTML/CSS/JS injection.
- Client-side code uses `jsgui3-client` HTTP and resource utilities to call server publishers/APIs defined in `jsgui3-server`.
- Controls defined with `jsgui3-html` primitives become interactive in the browser via the `Client_Page_Context` and activation hooks provided here.

## Key Modules in this Package

- `client.js`: Builds the exported `jsgui` object, wiring in HTTP helpers, resource pooling, and client-aware control behavior.
- `client-resource-pool.js`: Manages resource instances that communicate with server endpoints (pairs with server-side publishers/resources).
  - `Client_Resource_Pool.start()`: starts resources that return `true` from `meets_requirements()`; rejects if requirements can’t be satisfied.
- `data-get-post-delete-http-resource.js`: Implements HTTP-based data resource with GET/POST/DELETE, matching common `jsgui3-server` REST patterns.
- `resource.js`: Base client resource abstraction for HTTP-backed data access.
- `page-context.js`: `Client_Page_Context` with DOM integration, modal helpers, and control registration for activation/cleanup.
  - `Client_Page_Context.modal`: lazily creates and adds a `Modal` control.
  - `Client_Page_Context.overlay`: lazily creates an overlay `Control` with a simple `place(...)` helper (`below`, `above`, `right`, `left`).

## Typical Project Layout (client side)

- `client.js`: Defines controls and exports `jsgui` for bundling.
- `controls/`: Custom controls that extend `jsgui3-html` primitives.
- `page-context.js`: Used by controls to manage DOM-backed lifecycle.
- Served by `jsgui3-server` via `Server.serve({ src_path_client_js: require.resolve('./client.js'), ... })`.

## Data and Resource Patterns

- Use `jsgui.http`, `http_post`, `http_delete` for direct calls to server APIs exposed via `jsgui3-server` publishers.
- For reusable endpoints, create instances of `Data_Get_Post_Delete_HTTP_Resource` and register them with `Client_Resource_Pool`.
- JSON is serialized/deserialized automatically; default timeout is 2500ms (tune per request).
- `Client_Resource_Pool` includes a default `data_resource` used by `client.js` to attach server-exposed functions.
  - Set `jsgui.timeout` (number, ms) to override the default timeout for `http`, `http_post`, and `http_delete`.

## Activation and Lifecycle

- Extend `Active_HTML_Document` for top-level pages. In `constructor`, call `super(spec)` and compose controls only when `!spec.el` to avoid double activation.
- Use `activate()` to register DOM/event handlers; always guard with `if (!this.__active) { super.activate(); ... }`.
- Register shared data models or resources on the context so they are cleaned up automatically.

### Node vs browser behavior

`client.js` only wires `jsgui.http`, `jsgui.http_post`, `jsgui.http_delete`, and the automatic `window.onload` activation path when `window` exists:

- In a real browser bundle, those helpers are available and activation happens on `load`.
- In Node (SSR/tests), requiring `jsgui3-client` does not attach those browser helpers unless you provide `global.window` and friends.

### Passing data into the page context

If you need data available on `jsgui.context` immediately after activation, you can call `jsgui.register_context_data(...)` before the page loads; that object is assigned onto the created `Client_Page_Context`.

## Testing

Run:

```bash
npm test
```

E2E (Puppeteer):

```bash
npm run test:e2e
```

Notes:
- Tests use Node’s built-in `node:test` runner (Node.js >= 18 recommended for running the test suite).
- Browser-only code paths are covered by stubbing `window`, `document`, and `XMLHttpRequest` (see `test/fixtures/`).

## Security Notes / Further Review Areas

This package is a browser-side runtime layer. A few areas deserve explicit review in any real application:

- **Server resource names**: `client.js` can expose server-defined “resource functions” onto the client-side data resource. Treat those server-provided names as untrusted input; `__proto__`, `constructor`, and `prototype` are explicitly blocked to avoid prototype-pollution style issues.
- **HTTP helpers**: `jsgui.http`, `http_post`, `http_delete` assume JSON responses on HTTP 200. Invalid JSON now rejects with `{ status, responseText, parse_error: true }`. If you need text/binary responses, implement dedicated helpers rather than weakening JSON parsing.
- **Timeouts/network failures**: XHR timeouts reject with `{ status: 0, timeout: true }`; network errors reject with `{ status: 0, network_error: true }`. Non-200 handling differs per method (see `client.js`).
- **CSRF / auth**: These helpers do not implement CSRF tokens, auth headers, CORS policy, or `withCredentials` configuration. Those must be handled by your application and server.

## Working with CSS

- Attach CSS to controls via static properties (e.g., `My_App.css = '...'`) so `jsgui3-server` can collect and inject styles during bundling.
- This mirrors the pattern in `jsgui3-server` examples where server publishers gather CSS from control definitions.

## Development Notes

- Runtime: Node.js >= 15 for tooling; browser execution is the target environment.
- Dependencies: `jsgui3-html` (core rendering and control base) and `fnl` (observable/functional utilities).
- Serve locally via `jsgui3-server` for quickest feedback; its CLI (`node cli.js serve --port 8080`) will bundle and host your `client.js`.

## Further Reading

- jsgui3-server overview and API: see that project's `README.md` and `docs/simple-server-api-design.md` for full server capabilities and bundling behavior.
- This repository root `README.md`: high-level feature list and quick usage.
