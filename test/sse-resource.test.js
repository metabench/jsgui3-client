const test = require('node:test');
const assert = require('node:assert/strict');

const freshRequire = require('./fixtures/fresh-require');
const withGlobals = require('./fixtures/with-globals');

// Mock EventSource for testing
class MockEventSource {
    static instances = [];
    static reset() { MockEventSource.instances = []; }

    constructor(url, options = {}) {
        this.url = url;
        this.withCredentials = options.withCredentials || false;
        this.readyState = 0; // CONNECTING
        this._listeners = {};
        MockEventSource.instances.push(this);
    }

    addEventListener(type, handler) {
        if (!this._listeners[type]) {
            this._listeners[type] = [];
        }
        this._listeners[type].push(handler);
    }

    removeEventListener(type, handler) {
        if (this._listeners[type]) {
            this._listeners[type] = this._listeners[type].filter(h => h !== handler);
        }
    }

    close() {
        this.readyState = 2; // CLOSED
    }

    // Test helpers
    simulateOpen() {
        this.readyState = 1; // OPEN
        this._fire('open', {});
    }

    simulateMessage(data, type = 'message') {
        this._fire(type, {
            type: type,
            data: data,
            lastEventId: '',
            origin: 'http://localhost'
        });
    }

    simulateError() {
        this.readyState = 2; // CLOSED
        this._fire('error', {});
    }

    _fire(type, event) {
        const handlers = this._listeners[type] || [];
        handlers.forEach(h => h(event));
    }
}

test('SSE_Resource: constructor sets defaults', async () => {
    MockEventSource.reset();

    await withGlobals(
        {
            window: { addEventListener() { } },
            document: { body: {} },
            EventSource: MockEventSource,
            XMLHttpRequest: function () { }
        },
        async () => {
            const jsgui = freshRequire('client.js');
            const SSE_Resource = jsgui.SSE_Resource;

            const sse = new SSE_Resource({ url: '/api/events' });

            assert.equal(sse.url, '/api/events');
            assert.equal(sse.reconnect, true);
            assert.equal(sse.parseJSON, true);
            assert.equal(sse.isConnected(), false);
        }
    );
});

test('SSE_Resource: connect creates EventSource', async () => {
    MockEventSource.reset();

    await withGlobals(
        {
            window: { addEventListener() { } },
            document: { body: {} },
            EventSource: MockEventSource,
            XMLHttpRequest: function () { }
        },
        async () => {
            const jsgui = freshRequire('client.js');
            const SSE_Resource = jsgui.SSE_Resource;

            const sse = new SSE_Resource({ url: '/api/events' });
            const result = sse.connect();

            assert.equal(result, true);
            assert.equal(MockEventSource.instances.length, 1);
            assert.equal(MockEventSource.instances[0].url, '/api/events');
        }
    );
});

test('SSE_Resource: emits connect on open', async () => {
    MockEventSource.reset();

    await withGlobals(
        {
            window: { addEventListener() { } },
            document: { body: {} },
            EventSource: MockEventSource,
            XMLHttpRequest: function () { }
        },
        async () => {
            const jsgui = freshRequire('client.js');
            const SSE_Resource = jsgui.SSE_Resource;

            const sse = new SSE_Resource({ url: '/api/events' });
            let connected = false;
            sse.on('connect', () => { connected = true; });

            sse.connect();
            MockEventSource.instances[0].simulateOpen();

            assert.equal(connected, true);
            assert.equal(sse.isConnected(), true);
        }
    );
});

test('SSE_Resource: parses JSON messages by default', async () => {
    MockEventSource.reset();

    await withGlobals(
        {
            window: { addEventListener() { } },
            document: { body: {} },
            EventSource: MockEventSource,
            XMLHttpRequest: function () { }
        },
        async () => {
            const jsgui = freshRequire('client.js');
            const SSE_Resource = jsgui.SSE_Resource;

            const sse = new SSE_Resource({ url: '/api/events' });
            let receivedData = null;
            sse.on('message', (evt) => { receivedData = evt.data; });

            sse.connect();
            MockEventSource.instances[0].simulateOpen();
            MockEventSource.instances[0].simulateMessage('{"status":"ok"}');

            assert.deepEqual(receivedData, { status: 'ok' });
        }
    );
});

test('SSE_Resource: disconnect closes EventSource', async () => {
    MockEventSource.reset();

    await withGlobals(
        {
            window: { addEventListener() { } },
            document: { body: {} },
            EventSource: MockEventSource,
            XMLHttpRequest: function () { }
        },
        async () => {
            const jsgui = freshRequire('client.js');
            const SSE_Resource = jsgui.SSE_Resource;

            const sse = new SSE_Resource({ url: '/api/events' });
            sse.connect();
            MockEventSource.instances[0].simulateOpen();

            let disconnected = false;
            sse.on('disconnect', () => { disconnected = true; });

            sse.disconnect();

            assert.equal(disconnected, true);
            assert.equal(sse.isConnected(), false);
            assert.equal(MockEventSource.instances[0].readyState, 2); // CLOSED
        }
    );
});

test('SSE_Resource: isSupported checks for EventSource', async () => {
    await withGlobals(
        {
            window: { addEventListener() { } },
            document: { body: {} },
            XMLHttpRequest: function () { }
        },
        async () => {
            const jsgui = freshRequire('client.js');
            const SSE_Resource = jsgui.SSE_Resource;

            // No EventSource in globals
            assert.equal(SSE_Resource.isSupported(), false);
        }
    );
});

test('SSE_Resource: subscribe adds custom event listener', async () => {
    MockEventSource.reset();

    await withGlobals(
        {
            window: { addEventListener() { } },
            document: { body: {} },
            EventSource: MockEventSource,
            XMLHttpRequest: function () { }
        },
        async () => {
            const jsgui = freshRequire('client.js');
            const SSE_Resource = jsgui.SSE_Resource;

            const sse = new SSE_Resource({ url: '/api/events' });
            sse.subscribe('status');
            sse.connect();
            MockEventSource.instances[0].simulateOpen();

            let statusData = null;
            sse.on('status', (evt) => { statusData = evt.data; });

            MockEventSource.instances[0].simulateMessage('{"active":true}', 'status');

            assert.deepEqual(statusData, { active: true });
        }
    );
});
