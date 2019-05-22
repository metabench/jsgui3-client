// Data_Resource could be separated from jsgui3.

var jsgui = require('jsgui3-html');
var Client_Resource = require('./resource');

const fnl = require('fnl');
const {prom_or_cb} = fnl;

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

// Client_Server_Resource_Connection

// data-resource-pool on npm
//  resource-pool already taken

// Data_Resource could build differently on the client?
//  Or have Browser_Data_Resource
//  WebClient_Data_Resource
//  Browser sounds most accurate

class Data_Resource extends Client_Resource {
    constructor(spec) {
        super(spec);
        this.data = {};
    }
    get(key, callback) {
        // Some get operations could return observables.
        // generally will just be done with an HTTP request.
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

    post(key, value, callback) {
        return prom_or_cb((solve, jettison) => {

            // HTTP compression of posts within the browser would be nice too.

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
}

module.exports = (Data_Resource);