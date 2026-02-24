// Data_Resource could be separated from jsgui3.

var jsgui = require('jsgui3-html');
var Client_Resource = require('./resource');

const fnl = require('fnl');
const { prom_or_cb } = fnl;


/*
var stringify = jsgui.stringify,
    each = jsgui.each,
    arrayify = jsgui.arrayify,
    tof = jsgui.tof;
var filter_map_by_regex = jsgui.filter_map_by_regex;
var Class = jsgui.Class,
    Data_Object = jsgui.Data_Object,
    Enhanced_Data_Object = jsgui.Enhanced_Data_Object;
var fp = jsgui.fp,
    is_defined = jsgui.is_defined;
var Collection = jsgui.Collection;
*/

// Client_Server_Resource_Connection

// data-resource-pool on npm
//  resource-pool already taken

// Data_Resource could build differently on the client?
//  Or have Browser_Data_Resource
//  WebClient_Data_Resource
//  Browser sounds most accurate


// HTTP_Data_Resource

// Some may work with websockets.


// WS_Data_Resources
//  Or the pool

// Want it so that all of the resources are available through a single websockets connection.
// Then it will be a matter of choosing the service method(s).

// In some cases websockets will be better than SSE.
//  Could try binary encoding and message envelopes over websockets.


// Direct HTTP connection to the server here.
// Consider HTTPS as well.

// General purpose and extendable UI for observables and events will be very useful.
//  Should work on that soon.

// Will be like a full screen application. Slightly similar layout to VS code and other editors.
//  Definitely need to do more work on the editor / documents etor view
//  Items_Editor
//  Editor_UI

// Could be its own project.
//  jsgui3-editor-ui
//  jsgui3-multiview

//  make an advanced view system that is much like vs code.
//  make it work full-screen / large window, also as electron app.
//   react-native too?


// Need to make a general purpose business / productivity multiview.
//  Then hook it up with online data
//   Such as for loading and saving docs
//   A file tree
//  Viewing long-running processes
//  Viewing medium-running processes ie downloads and their logs

// Having a variety of (functional) data adapters on the server-side to connect the data (channels) in the app to the db / data storage.

// resource.adapter = ...
//  an adapter proprty on some data resources to connect them with specific DBs / DB instances.

// Should allow for (Data) Transformation Resource too.

// get-post remote resource. Or remotely available. Or http resource.


// resource connection type:
//  local-fn, http?

// Data_Get_Post_Resource?
// Data_KV_Resource?

/**
 * HTTP-based data resource supporting GET, POST, DELETE and paginated query operations.
 * Extends Client_Resource with HTTP methods backed by jsgui.http / http_post / http_delete.
 * All methods support both callback and promise styles via prom_or_cb.
 *
 * @extends Client_Resource
 *
 * @param {object} spec - Configuration object passed to Client_Resource
 * @param {string} [spec.name] - Resource name
 * @param {string} [spec.query_path='/resources/query'] - URL endpoint for query() requests
 *
 * @example
 * // Basic CRUD usage
 * const resource = new Data_Get_Post_Delete_HTTP_Resource({ name: 'users' });
 * const user = await resource.get('users/1');
 * await resource.post('users/1', { name: 'Alice' });
 * await resource.delete('users/1');
 *
 * @example
 * // Paginated query
 * const result = await resource.query({
 *   table: 'users', page: 1, page_size: 25,
 *   sort: { key: 'name', dir: 'asc' },
 *   filters: { active: true }
 * });
 * // result: { rows: [...], total_count: 500, page: 1, page_size: 25 }
 *
 * @example
 * // Data_Grid integration via factory
 * const dataSource = Data_Get_Post_Delete_HTTP_Resource.create_data_source('/api/users/query');
 * const grid = new Data_Grid({ data_source: dataSource });
 */
class Data_Get_Post_Delete_HTTP_Resource extends Client_Resource {

    constructor(spec) {
        super(spec);
        this.data = {};
        this._query_path = (spec && spec.query_path) || '/resources/query';
    }
    /**
     * Fetch a resource by key via HTTP GET.
     * @param {string} key - Resource key (appended to /resources/)
     * @param {function} [callback] - Optional callback(err, result)
     * @returns {Promise<any>}
     */
    get(key, callback) {
        return prom_or_cb((solve, jettison) => {
            jsgui.http('/resources/' + key, (err, res_http) => {
                if (err) {
                    jettison(err);
                } else {
                    solve(res_http);
                }
            });
        }, callback);
    }

    /**
     * Save a value to the server via HTTP POST.
     * @param {string} key - Resource key (appended to /resources/)
     * @param {any} value - Value to post (serialized as JSON)
     * @param {function} [callback] - Optional callback(err, result)
     * @returns {Promise<any>}
     */
    post(key, value, callback) {
        return prom_or_cb((solve, jettison) => {
            jsgui.http_post('/resources/' + key, value, (err, res_http) => {
                if (err) {
                    console.log('err', err);
                    jettison(err);
                } else {
                    solve(res_http);
                }
            });
        }, callback);
    }

    /**
     * Delete a resource by key via HTTP DELETE.
     * @param {string} key - Resource key (appended to /resources/)
     * @param {function} [callback] - Optional callback(err, result)
     * @returns {Promise<any>}
     */
    delete(key, callback) {
        return prom_or_cb((solve, jettison) => {
            jsgui.http_delete('/resources/' + key, (err, res_http) => {
                if (err) {
                    console.log('err', err);
                    jettison(err);
                } else {
                    solve(res_http);
                }
            });
        }, callback);
    }

    /**
     * Query for paginated, sorted, filtered data.
     * 
     * @param {object} params - Query parameters
     * @param {string} params.table - Table/collection name
     * @param {number} params.page - Page number (1-based)
     * @param {number} params.page_size - Rows per page
     * @param {{key: string, dir: 'asc'|'desc'}|null} [params.sort] - Sort specification
     * @param {object|null} [params.filters] - Filter criteria
     * @param {function} [callback] - Optional callback(err, result)
     * @returns {Promise<{rows: Array, total_count: number, page: number, page_size: number}>}
     */
    query(params, callback) {
        return prom_or_cb((solve, jettison) => {
            jsgui.http_post(this._query_path, params, (err, res_http) => {
                if (err) {
                    jettison(err);
                } else {
                    solve(res_http);
                }
            });
        }, callback);
    }
}

/**
 * Create a data source function compatible with Data_Grid's data_source interface.
 * 
 * @param {string} resource_url - URL to POST query params to
 * @returns {function(params): Promise<{rows: Array, total_count: number}>}
 */
Data_Get_Post_Delete_HTTP_Resource.create_data_source = function (resource_url) {
    return function (params) {
        return prom_or_cb((solve, jettison) => {
            jsgui.http_post(resource_url, params, (err, res_http) => {
                if (err) {
                    jettison(err);
                } else {
                    solve(res_http);
                }
            });
        });
    };
};

module.exports = (Data_Get_Post_Delete_HTTP_Resource);