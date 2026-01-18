const test = require('node:test');
const assert = require('node:assert/strict');

const freshRequire = require('./fixtures/fresh-require');
const withGlobals = require('./fixtures/with-globals');

// Mock EventSource that supports named events
class MockEventSource {
    static instances = [];
    static reset() { MockEventSource.instances = []; }

    constructor(url, options = {}) {
        this.url = url;
        this.withCredentials = options.withCredentials || false;
        this.readyState = 0;
        this._listeners = {};
        MockEventSource.instances.push(this);
    }

    addEventListener(type, handler) {
        if (!this._listeners[type]) this._listeners[type] = [];
        this._listeners[type].push(handler);
    }

    removeEventListener(type, handler) {
        if (this._listeners[type]) {
            this._listeners[type] = this._listeners[type].filter(h => h !== handler);
        }
    }

    close() { this.readyState = 2; }

    simulateOpen() {
        this.readyState = 1;
        this._fire('open', {});
    }

    // Simulate default 'message' event (data-only)
    simulateMessage(data) {
        this._fire('message', {
            type: 'message',
            data: typeof data === 'object' ? JSON.stringify(data) : data,
            lastEventId: '',
            origin: 'http://localhost'
        });
    }

    // Simulate named SSE event (event: paused\ndata: {...})
    simulateNamedEvent(eventName, data) {
        this._fire(eventName, {
            type: eventName,
            data: typeof data === 'object' ? data : JSON.parse(data),
            lastEventId: '',
            origin: 'http://localhost'
        });
    }

    _fire(type, event) {
        (this._listeners[type] || []).forEach(h => h(event));
    }
}

test('Remote_Observable: constructor extends SSE_Resource', async () => {
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
            const Remote_Observable = jsgui.Remote_Observable;

            const obs = new Remote_Observable({ url: '/api/status' });

            assert.equal(obs.url, '/api/status');
            assert.equal(obs.reconnect, true);
            assert.equal(typeof obs.connect, 'function');
            assert.equal(typeof obs.control, 'function');
        }
    );
});

test('Remote_Observable: emits next on data messages', async () => {
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
            const Remote_Observable = jsgui.Remote_Observable;

            const obs = new Remote_Observable({ url: '/api/status' });
            let receivedValue = null;
            obs.on('next', (value) => { receivedValue = value; });

            obs.connect();
            MockEventSource.instances[0].simulateOpen();
            MockEventSource.instances[0].simulateMessage({ progress: 50 });

            assert.deepEqual(receivedValue, { progress: 50 });
            assert.deepEqual(obs.getLatest(), { progress: 50 });
        }
    );
});

test('Remote_Observable: skips OK handshake', async () => {
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
            const Remote_Observable = jsgui.Remote_Observable;

            const obs = new Remote_Observable({ url: '/api/status' });
            let nextCount = 0;
            obs.on('next', () => { nextCount++; });

            obs.connect();
            MockEventSource.instances[0].simulateOpen();
            MockEventSource.instances[0].simulateMessage('OK');  // Should be skipped
            MockEventSource.instances[0].simulateMessage({ data: 'real' });

            assert.equal(nextCount, 1);  // Only the real message
        }
    );
});

test('Remote_Observable: handles paused event', async () => {
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
            const Remote_Observable = jsgui.Remote_Observable;

            const obs = new Remote_Observable({ url: '/api/status' });
            let pausedData = null;
            obs.on('paused', (data) => { pausedData = data; });

            obs.connect();
            MockEventSource.instances[0].simulateOpen();
            MockEventSource.instances[0].simulateNamedEvent('paused', { status: 'paused' });

            assert.deepEqual(pausedData, { status: 'paused' });
            assert.equal(obs.isPaused(), true);
        }
    );
});

test('Remote_Observable: handles complete event', async () => {
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
            const Remote_Observable = jsgui.Remote_Observable;

            const obs = new Remote_Observable({ url: '/api/status' });
            let completed = false;
            obs.on('complete', () => { completed = true; });

            obs.connect();
            MockEventSource.instances[0].simulateOpen();
            MockEventSource.instances[0].simulateNamedEvent('complete', {});

            assert.equal(completed, true);
        }
    );
});

test('Remote_Observable: control() posts action to same URL', async () => {
    MockEventSource.reset();
    let capturedRequest = null;

    await withGlobals(
        {
            window: { addEventListener() { } },
            document: { body: {} },
            EventSource: MockEventSource,
            XMLHttpRequest: function () { },
            fetch: async (url, options) => {
                capturedRequest = { url, options };
                return { ok: true, json: () => Promise.resolve({ ok: true, status: 'paused' }) };
            }
        },
        async () => {
            const jsgui = freshRequire('client.js');
            const Remote_Observable = jsgui.Remote_Observable;

            const obs = new Remote_Observable({ url: '/api/status' });
            const result = await obs.control('pause');

            assert.equal(capturedRequest.url, '/api/status');
            assert.equal(capturedRequest.options.method, 'POST');
            const body = JSON.parse(capturedRequest.options.body);
            assert.equal(body.action, 'pause');
            assert.equal(result.ok, true);
            assert.equal(obs.isPaused(), true);
        }
    );
});

test('Remote_Observable: SSE_EVENTS exported', async () => {
    await withGlobals(
        {
            window: { addEventListener() { } },
            document: { body: {} },
            XMLHttpRequest: function () { }
        },
        async () => {
            const jsgui = freshRequire('client.js');
            const Remote_Observable = jsgui.Remote_Observable;

            assert.equal(Remote_Observable.SSE_EVENTS.PAUSED, 'paused');
            assert.equal(Remote_Observable.SSE_EVENTS.RESUMED, 'resumed');
            assert.equal(Remote_Observable.SSE_EVENTS.COMPLETE, 'complete');
            assert.equal(Remote_Observable.SSE_EVENTS.ERROR, 'error');
        }
    );
});
