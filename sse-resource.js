"use strict";

/**
 * SSE_Resource - Server-Sent Events client for jsgui3
 * 
 * Provides a reusable abstraction for consuming SSE streams from jsgui3-server.
 * 
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Event type filtering
 * - JSON parsing of event data
 * - Integration with jsgui3 Resource pattern
 * 
 * Usage:
 *   const stream = new SSE_Resource({
 *     url: '/api/status-stream',
 *     reconnect: true,
 *     backoff: { initial: 1000, max: 30000 }
 *   });
 *   
 *   stream.on('message', (data) => console.log(data));
 *   stream.on('error', (err) => console.error(err));
 *   stream.connect();
 */

const jsgui = require('jsgui3-html');
const { Evented_Class } = jsgui;

const DEFAULT_BACKOFF_INITIAL = 1000;
const DEFAULT_BACKOFF_MAX = 30000;
const DEFAULT_BACKOFF_MULTIPLIER = 2;

class SSE_Resource extends Evented_Class {
    /**
     * @param {object} spec
     * @param {string} spec.url - SSE endpoint URL
     * @param {string} [spec.name] - Resource name for identification
     * @param {boolean} [spec.reconnect=true] - Auto-reconnect on disconnect
     * @param {object} [spec.backoff] - Backoff configuration
     * @param {number} [spec.backoff.initial=1000] - Initial backoff delay (ms)
     * @param {number} [spec.backoff.max=30000] - Maximum backoff delay (ms)
     * @param {number} [spec.backoff.multiplier=2] - Backoff multiplier
     * @param {boolean} [spec.parseJSON=true] - Auto-parse JSON event data
     * @param {boolean} [spec.withCredentials=false] - Include credentials in request
     */
    constructor(spec = {}) {
        super();

        this.name = spec.name || 'sse_resource';
        this.url = spec.url;
        this.reconnect = spec.reconnect !== false;
        this.parseJSON = spec.parseJSON !== false;
        this.withCredentials = !!spec.withCredentials;

        // Backoff configuration
        const backoff = spec.backoff || {};
        this._backoffInitial = backoff.initial || DEFAULT_BACKOFF_INITIAL;
        this._backoffMax = backoff.max || DEFAULT_BACKOFF_MAX;
        this._backoffMultiplier = backoff.multiplier || DEFAULT_BACKOFF_MULTIPLIER;
        this._backoffCurrent = this._backoffInitial;

        // State
        this._eventSource = null;
        this._connected = false;
        this._connecting = false;
        this._reconnectTimer = null;
        this._eventTypes = new Set(['message']);

        // Bind handlers for proper removal
        this._onOpen = this._handleOpen.bind(this);
        this._onError = this._handleError.bind(this);
        this._onMessage = this._handleMessage.bind(this);
    }

    /**
     * Check if EventSource is available in the environment
     */
    static isSupported() {
        return typeof EventSource !== 'undefined';
    }

    /**
     * Connect to the SSE stream
     * @returns {boolean} true if connection initiated
     */
    connect() {
        if (this._connected || this._connecting) {
            return false;
        }

        if (!SSE_Resource.isSupported()) {
            this.raise('error', { type: 'unsupported', message: 'EventSource not supported' });
            return false;
        }

        if (!this.url) {
            this.raise('error', { type: 'config', message: 'URL is required' });
            return false;
        }

        this._connecting = true;

        try {
            this._eventSource = new EventSource(this.url, {
                withCredentials: this.withCredentials
            });

            this._eventSource.addEventListener('open', this._onOpen);
            this._eventSource.addEventListener('error', this._onError);

            // Add message listener for default events
            this._eventSource.addEventListener('message', this._onMessage);

            // Add listeners for custom event types
            for (const eventType of this._eventTypes) {
                if (eventType !== 'message') {
                    this._eventSource.addEventListener(eventType, this._onMessage);
                }
            }

            return true;
        } catch (err) {
            this._connecting = false;
            this.raise('error', { type: 'connection', message: err.message, error: err });
            return false;
        }
    }

    /**
     * Disconnect from the SSE stream
     */
    disconnect() {
        this._clearReconnectTimer();

        if (this._eventSource) {
            this._eventSource.removeEventListener('open', this._onOpen);
            this._eventSource.removeEventListener('error', this._onError);
            this._eventSource.removeEventListener('message', this._onMessage);

            for (const eventType of this._eventTypes) {
                if (eventType !== 'message') {
                    this._eventSource.removeEventListener(eventType, this._onMessage);
                }
            }

            this._eventSource.close();
            this._eventSource = null;
        }

        const wasConnected = this._connected;
        this._connected = false;
        this._connecting = false;
        this._backoffCurrent = this._backoffInitial;

        if (wasConnected) {
            this.raise('disconnect');
        }
    }

    /**
     * Subscribe to a custom event type
     * @param {string} eventType - Event type name
     */
    subscribe(eventType) {
        if (!eventType || this._eventTypes.has(eventType)) {
            return;
        }

        this._eventTypes.add(eventType);

        if (this._eventSource) {
            this._eventSource.addEventListener(eventType, this._onMessage);
        }
    }

    /**
     * Unsubscribe from a custom event type
     * @param {string} eventType - Event type name
     */
    unsubscribe(eventType) {
        if (!eventType || eventType === 'message') {
            return;
        }

        this._eventTypes.delete(eventType);

        if (this._eventSource) {
            this._eventSource.removeEventListener(eventType, this._onMessage);
        }
    }

    /**
     * Check if currently connected
     * @returns {boolean}
     */
    isConnected() {
        return this._connected;
    }

    /**
     * Get the current EventSource ready state
     * @returns {number|null} 0=CONNECTING, 1=OPEN, 2=CLOSED
     */
    getReadyState() {
        return this._eventSource ? this._eventSource.readyState : null;
    }

    // ==================== Private Methods ====================

    _handleOpen() {
        this._connected = true;
        this._connecting = false;
        this._backoffCurrent = this._backoffInitial;
        this.raise('connect');
    }

    _handleError(event) {
        const wasConnected = this._connected;
        this._connected = false;
        this._connecting = false;

        this.raise('error', {
            type: 'stream',
            readyState: this._eventSource ? this._eventSource.readyState : null
        });

        if (wasConnected && this.reconnect) {
            this._scheduleReconnect();
        }
    }

    _handleMessage(event) {
        let data = event.data;

        if (this.parseJSON && typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                // Not JSON, use raw string
            }
        }

        this.raise('message', {
            type: event.type,
            data: data,
            lastEventId: event.lastEventId,
            origin: event.origin
        });

        // Also raise specific event type
        if (event.type !== 'message') {
            this.raise(event.type, {
                data: data,
                lastEventId: event.lastEventId,
                origin: event.origin
            });
        }
    }

    _scheduleReconnect() {
        this._clearReconnectTimer();

        this.raise('reconnecting', { delay: this._backoffCurrent });

        this._reconnectTimer = setTimeout(() => {
            this._reconnectTimer = null;
            this.connect();
        }, this._backoffCurrent);

        // Increase backoff for next attempt
        this._backoffCurrent = Math.min(
            this._backoffCurrent * this._backoffMultiplier,
            this._backoffMax
        );
    }

    _clearReconnectTimer() {
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }
    }
}

module.exports = SSE_Resource;
