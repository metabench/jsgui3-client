// Making it a global variable.
const jsgui = require('jsgui3-html');

jsgui.Resource_Pool = require('./client-resource-pool');
jsgui.Client_Page_Context = require('./page-context');
//console.log('jsgui.Client_Page_Context', jsgui.Client_Page_Context);
//jsgui.Selection_Scope = require('./selection-scope');
// And then can automatically activate?
//

jsgui.Client_Resource = require('./resource');
jsgui.SSE_Resource = require('./sse-resource');
jsgui.Remote_Observable = require('./remote-observable');
const fnl = require('fnl');
const prom_or_cb = fnl.prom_or_cb;

const { each, tf } = jsgui;

// Add bindRemote() to Control for reactive data binding
const Control = jsgui.Control;
if (Control && Control.prototype && !Control.prototype.bindRemote) {
    /**
     * Bind a Remote_Observable to the control's data model
     * Updates data.model automatically when observable emits 'next'
     * 
     * @param {Remote_Observable|string} observable - Observable instance or URL
     * @param {object} [options]
     * @param {string[]} [options.properties] - Only bind these properties
     * @param {Function} [options.transform] - Transform data before setting
     * @param {boolean} [options.autoConnect=true] - Auto-connect if URL provided
     */
    Control.prototype.bindRemote = function (observable, options = {}) {
        const { properties, transform, autoConnect = true } = options;

        // Create observable from URL if string provided
        let obs = observable;
        if (typeof observable === 'string') {
            obs = new jsgui.Remote_Observable({ url: observable });
            if (autoConnect) {
                obs.connect();
            }
        }

        // Ensure we have a data model
        const dataModel = this.data && this.data.model;
        if (!dataModel || typeof dataModel.set !== 'function') {
            console.warn('[bindRemote] Control has no data.model with set()');
            return obs;
        }

        // Handle 'next' events
        obs.on('next', (data) => {
            const mapped = typeof transform === 'function' ? transform(data) : data;
            if (!mapped || typeof mapped !== 'object') return;

            if (Array.isArray(properties) && properties.length > 0) {
                // Only update specified properties
                properties.forEach(key => {
                    if (key in mapped) {
                        dataModel.set(key, mapped[key]);
                    }
                });
            } else {
                // Update all properties
                Object.entries(mapped).forEach(([key, value]) => {
                    dataModel.set(key, value);
                });
            }
        });

        // Auto-cleanup on destroy
        if (typeof this.on === 'function') {
            this.on('destroy', () => {
                if (obs && typeof obs.disconnect === 'function') {
                    obs.disconnect();
                }
            });
        }

        // Store reference for manual access
        this._boundObservables = this._boundObservables || [];
        this._boundObservables.push(obs);

        return obs;
    };
}

// Should move some / all html that is client-side to here.

// Leave the line below
/* -- REQUIREMENTS -- */
// Leave the line above

if (typeof window !== 'undefined') {
    // Maybe use the vhl dl function? Or similar observable?

    // need to use https really

    // timeout...
    let context;
    let page_context;

    jsgui.http = (url, callback) => {
        return prom_or_cb((resolve, reject) => {
            let timeout = 2500;
            if (Number.isFinite(jsgui.timeout)) timeout = jsgui.timeout;
            var oReq = new XMLHttpRequest();
            let settled = false;
            const settle_ok = (value) => {
                if (settled) return;
                settled = true;
                resolve(value);
            };
            const settle_err = (err) => {
                if (settled) return;
                settled = true;
                reject(err);
            };
            oReq.timeout = timeout;
            oReq.ontimeout = () => settle_err({ status: 0, timeout: true });
            oReq.onerror = () => settle_err({ status: 0, network_error: true });
            oReq.onreadystatechange = function () {
                //console.log('this.readyState', this.readyState);
                //console.log('this.status', this.status);
                if (this.readyState === 4) {
                    //console.log('this.status', this.status);
                    if (this.status === 200) {
                        try {
                            var o = JSON.parse(this.responseText);
                            //myFunction(myArr);
                            settle_ok(o);
                        } catch (e) {
                            settle_err({
                                status: this.status,
                                responseText: this.responseText,
                                parse_error: true
                            });
                        }
                    } else {
                        settle_err(this.status);
                    }
                }
            };
            oReq.open("GET", url, true);
            oReq.send();
        }, callback);
    }

    jsgui.http_post = (url, value, callback) => {
        return prom_or_cb((resolve, reject) => {

            var oReq = new XMLHttpRequest();
            let timeout = 2500;
            if (Number.isFinite(jsgui.timeout)) timeout = jsgui.timeout;
            let settled = false;
            const settle_ok = (value) => {
                if (settled) return;
                settled = true;
                resolve(value);
            };
            const settle_err = (err) => {
                if (settled) return;
                settled = true;
                reject(err);
            };
            oReq.timeout = timeout;
            oReq.ontimeout = () => settle_err({ status: 0, timeout: true });
            oReq.onerror = () => settle_err({ status: 0, network_error: true });
            oReq.onreadystatechange = function () {
                if (this.readyState === 4) {
                    //console.log('this.status', this.status);
                    if (this.status === 200) {
                        try {
                            var o = JSON.parse(this.responseText);
                            //myFunction(myArr);
                            settle_ok(o);
                        } catch (e) {
                            settle_err({
                                status: this.status,
                                responseText: this.responseText,
                                parse_error: true
                            });
                        }
                    } else {
                        //console.log('this.status', this.status);
                        settle_err({
                            status: this.status,
                            responseText: this.responseText
                        });
                    }
                }
            };

            oReq.open("POST", url, true);
            // set any headers here, such as content-type

            //let s_value;
            // always send a buffer?

            let o_to_send;
            let tval = tf(value)

            //console.log('***** tval', tval);
            //console.log('value', value);
            //console.log('value.length', value.length);

            if (tval === 's') {
                // text string
                o_to_send = value;
            } else if (tval === 'B') {
                o_to_send = value;
            } else if (tval === 'a' || tval === 'o') {
                const json = JSON.stringify(value);
                o_to_send = json;
                oReq.setRequestHeader('content-type', 'application/json');
            }

            //console.log('o_to_send', o_to_send);
            //console.trace();

            oReq.send(o_to_send);
        }, callback);
    }

    jsgui.http_delete = (url, callback) => {
        return prom_or_cb((resolve, reject) => {
            var oReq = new XMLHttpRequest();
            let timeout = 2500;
            if (Number.isFinite(jsgui.timeout)) timeout = jsgui.timeout;
            let settled = false;
            const settle_ok = (value) => {
                if (settled) return;
                settled = true;
                resolve(value);
            };
            const settle_err = (err) => {
                if (settled) return;
                settled = true;
                reject(err);
            };
            oReq.timeout = timeout;
            oReq.ontimeout = () => settle_err({ status: 0, timeout: true });
            oReq.onerror = () => settle_err({ status: 0, network_error: true });
            oReq.onreadystatechange = function () {
                if (this.readyState === 4) {
                    //console.log('this.status', this.status);
                    if (this.status === 200) {
                        try {
                            var o = JSON.parse(this.responseText);
                            //myFunction(myArr);
                            settle_ok(o);
                        } catch (e) {
                            settle_err({
                                status: this.status,
                                responseText: this.responseText,
                                parse_error: true
                            });
                        }
                    } else {
                        settle_err(this.status);
                    }
                }
            };
            oReq.open("DELETE", url, true);
            oReq.send();
        }, callback);
    }

    jsgui.http_put = (url, value, callback) => {
        return prom_or_cb((resolve, reject) => {
            var oReq = new XMLHttpRequest();
            let timeout = 2500;
            if (Number.isFinite(jsgui.timeout)) timeout = jsgui.timeout;
            let settled = false;
            const settle_ok = (val) => {
                if (settled) return;
                settled = true;
                resolve(val);
            };
            const settle_err = (err) => {
                if (settled) return;
                settled = true;
                reject(err);
            };
            oReq.timeout = timeout;
            oReq.ontimeout = () => settle_err({ status: 0, timeout: true });
            oReq.onerror = () => settle_err({ status: 0, network_error: true });
            oReq.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        try {
                            var o = JSON.parse(this.responseText);
                            settle_ok(o);
                        } catch (e) {
                            settle_err({
                                status: this.status,
                                responseText: this.responseText,
                                parse_error: true
                            });
                        }
                    } else {
                        settle_err({
                            status: this.status,
                            responseText: this.responseText
                        });
                    }
                }
            };
            oReq.open("PUT", url, true);
            let o_to_send;
            let tval = tf(value);
            if (tval === 's') {
                o_to_send = value;
            } else if (tval === 'B') {
                o_to_send = value;
            } else if (tval === 'a' || tval === 'o') {
                const json = JSON.stringify(value);
                o_to_send = json;
                oReq.setRequestHeader('content-type', 'application/json');
            }
            oReq.send(o_to_send);
        }, callback);
    }

    jsgui.http_patch = (url, value, callback) => {
        return prom_or_cb((resolve, reject) => {
            var oReq = new XMLHttpRequest();
            let timeout = 2500;
            if (Number.isFinite(jsgui.timeout)) timeout = jsgui.timeout;
            let settled = false;
            const settle_ok = (val) => {
                if (settled) return;
                settled = true;
                resolve(val);
            };
            const settle_err = (err) => {
                if (settled) return;
                settled = true;
                reject(err);
            };
            oReq.timeout = timeout;
            oReq.ontimeout = () => settle_err({ status: 0, timeout: true });
            oReq.onerror = () => settle_err({ status: 0, network_error: true });
            oReq.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        try {
                            var o = JSON.parse(this.responseText);
                            settle_ok(o);
                        } catch (e) {
                            settle_err({
                                status: this.status,
                                responseText: this.responseText,
                                parse_error: true
                            });
                        }
                    } else {
                        settle_err({
                            status: this.status,
                            responseText: this.responseText
                        });
                    }
                }
            };
            oReq.open("PATCH", url, true);
            let o_to_send;
            let tval = tf(value);
            if (tval === 's') {
                o_to_send = value;
            } else if (tval === 'B') {
                o_to_send = value;
            } else if (tval === 'a' || tval === 'o') {
                const json = JSON.stringify(value);
                o_to_send = json;
                oReq.setRequestHeader('content-type', 'application/json');
            }
            oReq.send(o_to_send);
        }, callback);
    }


    jsgui.update_standard_Controls = page_context => {
        each(jsgui.controls, (Control_Subclass, name) => {
            page_context.update_Controls(name, Control_Subclass);
        });
    }
    // Can this be given the context as well?
    //  Could set up the data adapter functions that way too.



    let context_data;


    jsgui.register_server_resources = (o_server_resources) => {
        //console.log('jsgui.register_server_resources o_server_resources', o_server_resources);

        //console.log('!!!!! this log should appear');
        //console.trace();

        // Setting up the Data_Resource makes sense.

        // Creating automatic function calls that communicate with the server.
        //  So it's very easy to call from the app in a normal way. Will be v. simple to use. More concise code too.

        // Do we have access to the context?
        //  The resource registration call is in a separate block of js code. Need to be careful.

        //console.log('** Object.keys(jsgui)', Object.keys(jsgui));

        jsgui.def_server_resources = o_server_resources;
        // then will consult this upon activation, when the context is available.
    }

    jsgui.register_context_data = o_context_data => {
        context_data = o_context_data;
    }




    //console.log('Client-side app ready for activation');
    //console.log('next line');

    // Standard controls update
    // Standard controls import?

    // jsgui.update_page_context_default_controls()

    // Maybe activation within the client js would be most reliable and normal.

    // Automatic creation of page_context is best

    // Or generate the context, then activate.
    //  Or activation itself ensures and returns the page context.

    // Better id page_context is created here.

    let activate = () => {
        //console.log('client.js activate');
        const { def_server_resources } = jsgui;
        //console.log('def_server_resources', def_server_resources);
        page_context = new jsgui.Client_Page_Context({
            'document': document
        });
        context = page_context;
        jsgui.context = page_context;

        if (context_data) {
            Object.assign(page_context, context_data);

            // So would be able to read mime types from the context, if they are provided.
            //  Other useful pieces of data too.
        }

        jsgui.update_standard_Controls(page_context);


        /*
        jsgui.raise('pre-activate', {
            context: context
        });
        */

        jsgui.pre_activate(page_context);

        jsgui.activate(page_context);



        // Could set up the data_resource function calls here.
        //  Seems like a sensible place to do it, but maybe call a function that is elsewhere.
        //   These function calls will need to talk to the server.

        // context resources data resource.
        //  will create the function call here.

        //console.log('Object.keys(context)', Object.keys(context));
        //console.log('Object.keys(context.resource_pool)', Object.keys(context.resource_pool));
        //console.log('Object.keys(context.resource_pool.resources)', Object.keys(context.resource_pool.resources));

        const resource_pool = context.resource_pool;
        const arr_resources = resource_pool.resources._arr;
        const data_resource = resource_pool.data_resource || resource_pool.data || arr_resources[0];

        //console.log('data_resource', data_resource);

        const activate_server_resource_fn = (obj_def) => {
            //console.log('obj_def', obj_def);

            const { name, type } = obj_def;
            if (type === 'function') {
                const blocked_names = new Set(['__proto__', 'prototype', 'constructor']);
                if (typeof name !== 'string' || blocked_names.has(name)) {
                    console.warn('Refusing to register unsafe server resource name:', name);
                    return;
                }
                const fn_remote_call = async (single_param) => {
                    // do jsgui put.
                    // Fn call should be done with put.
                    //const json_single_param = JSON.stringify(single_param);
                    // Then do jsgui post.
                    //jsgui.http_post = (url, value, callback) => {
                    //  optional callback

                    const res_dl = await jsgui.http_post('/' + name, single_param);
                    console.log('res_dl', res_dl);
                    return res_dl;
                }
                //return fn_remote_call;

                data_resource[name] = fn_remote_call;
            }
            // Create a function that does the remote call.
        }

        const activate_server_resource_fns = () => {
            // will use http post for these function calls.
            each(def_server_resources, (server_resource_def, name) => {
                //console.log('name', name);
                //console.log('server_resource_def', server_resource_def);

                // activte server resource function.

                // with no schema defined.

                // with schema / grammar, may set up mfp / ofp / whatever for calling this function.
                activate_server_resource_fn(server_resource_def);
            })
        }

        activate_server_resource_fns();
        // jsgui.def_server_resources

        jsgui.raise('activate', {
            context: context
        });
        page_context.raise('activate', {
            context: context
        });

        // Set up a variety of UI controls here.
        // May be worth looking at some registry of controls.
    }
    // Multiple onload items being added.
    //  Seems like the 

    window.addEventListener('load', () => {
        console.log('client.js window onload');
        activate();
    });

}

module.exports = jsgui;
