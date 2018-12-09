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
                    //callback(err);
                    jettison(err);
                } else {
                    //callback(null, res_http);
                    solve(res_http);
                    //console.log('res_http', res_http);
                }
            });
        }, callback);
    }

    post(key, value, callback) {
        // Some get operations could return observables.
        // generally will just be done with an HTTP request.
        return prom_or_cb((solve, jettison) => {
            jsgui.http_post('/resources/' + key, value, (err, res_http) => {
                if (err) {
                    console.log('err', err);
                    //callback(err);
                    jettison(err);
                } else {
                    //callback(null, res_http);
                    solve(res_http);
                    //console.log('res_http', res_http);
                }
            });
        }, callback);
    }
}

module.exports = (Data_Resource);