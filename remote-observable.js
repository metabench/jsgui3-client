"use strict";

/**
 * Remote_Observable - Client-side observable for SSE streams
 * 
 * Connects to jsgui3-server's Observable_Publisher and handles the standard
 * SSE named events protocol:
 * - Default 'message' events for data → emits 'next'
 * - Named events: 'paused', 'resumed', 'stopped', 'complete', 'error'
 * 
 * Usage:
 *   const obs = new Remote_Observable({ url: '/api/status' });
 *   obs.on('next', (value) => dataModel.set('status', value));
 *   obs.on('paused', () => console.log('Stream paused'));
 *   obs.connect();
 * 
 * With control actions:
 *   await obs.pause();
 *   await obs.resume();
 */

const SSE_Resource = require('./sse-resource');

// Standard SSE event names used by Observable_Publisher
const SSE_EVENTS = {
    PAUSED: 'paused',
    RESUMED: 'resumed',
    STOPPED: 'stopped',
    COMPLETE: 'complete',
    ERROR: 'error'
};

class Remote_Observable extends SSE_Resource {
    /**
     * @param {object} spec
     * @param {string} spec.url - SSE endpoint URL (GET for stream, POST for control)
     * @param {boolean} [spec.reconnect=true] - Auto-reconnect on disconnect
     * @param {object} [spec.backoff] - Backoff configuration
     */
    constructor(spec = {}) {
        // Enable JSON parsing for message data
        super({ ...spec, parseJSON: true, name: spec.name || 'remote_observable' });

        this._latest = null;
        this._isPaused = false;

        // Subscribe to named SSE events from Observable_Publisher
        Object.values(SSE_EVENTS).forEach(eventName => {
            this.subscribe(eventName);
        });
    }

    /**
     * Override _handleMessage to transform SSE events to observable events
     * SSE_Resource calls this for both 'message' and named events
     */
    _handleMessage(event) {
        let data = event.data;

        // Parse JSON if needed
        if (this.parseJSON && typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                // Not JSON, use raw string
            }
        }

        const eventType = event.type;

        // Handle based on event type
        if (eventType === 'message') {
            // Skip the initial "OK" handshake from Observable_Publisher
            if (data === 'OK' || data === '"OK"') {
                return;
            }
            this._latest = data;
            this.raise('next', data);
        } else if (eventType === SSE_EVENTS.PAUSED) {
            this._isPaused = true;
            this.raise('paused', data);
        } else if (eventType === SSE_EVENTS.RESUMED) {
            this._isPaused = false;
            this.raise('resumed', data);
        } else if (eventType === SSE_EVENTS.STOPPED) {
            this.raise('stopped', data);
        } else if (eventType === SSE_EVENTS.COMPLETE) {
            this.raise('complete', data);
        } else if (eventType === SSE_EVENTS.ERROR) {
            const message = (data && data.message) || 'Remote error';
            this.raise('error', new Error(message));
        } else {
            // Unknown event type - raise as-is
            this.raise(eventType, data);
        }
    }

    /**
     * Get the latest received value
     * @returns {any}
     */
    getLatest() {
        return this._latest;
    }

    /**
     * Check if stream is paused
     * @returns {boolean}
     */
    isPaused() {
        return this._isPaused;
    }

    /**
     * Send a control action to the server
     * Uses the same endpoint with POST method
     * 
     * @param {string} action - 'pause', 'resume', 'stop', or 'status'
     * @returns {Promise<object>}
     */
    async control(action) {
        if (typeof fetch === 'undefined') {
            throw new Error('fetch not available');
        }

        const response = await fetch(this.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });

        if (!response.ok) {
            throw new Error(`Control action failed: ${response.status}`);
        }

        const result = await response.json();

        // Update local state based on response
        if (result.status === 'paused') {
            this._isPaused = true;
        } else if (result.status === 'ok') {
            this._isPaused = false;
        }

        return result;
    }

    /**
     * Convenience: pause the remote observable
     */
    async pause() {
        return this.control('pause');
    }

    /**
     * Convenience: resume the remote observable
     */
    async resume() {
        return this.control('resume');
    }

    /**
     * Convenience: stop the remote observable
     */
    async stop() {
        return this.control('stop');
    }

    /**
     * Convenience: get status
     */
    async status() {
        return this.control('status');
    }
}

// Export event names for reference
Remote_Observable.SSE_EVENTS = SSE_EVENTS;

module.exports = Remote_Observable;
