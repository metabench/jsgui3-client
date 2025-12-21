/*
 define(['../../web/jsgui-html', './client-resource', './pool'],

 function(jsgui, Resource, Resource_Pool) {
 */

 // Got a lot of this code to delete / refresh / make more concise once things are more fully working.
 //  Especially regarding parse_mount and controls.
 //   Want to shrink down the package size a lot.

 // Once the API is stable, could create a build that uses many local variables.
 //  Could make a build process that does that.
 //   Would be nice to make a core / small jsgui build that fits in 5KB compressed. 15 would be nice too etc.
 //    Much will be possible with abstractions over the patterns.


var jsgui = require('jsgui3-html');
//var Resource = require('./client-resource');
var Resource_Pool = jsgui.Resource_Pool;
const Data_Get_Post_Delete_HTTP_Resource = require('./data-get-post-delete-http-resource');

const fnl = require('fnl');
const prom_or_cb = fnl.prom_or_cb;

// Client_Resource?
//  I think that makes sense, so that we have something specific which has the URL attached.
//   It is able to make HTTP requests to the server resource.

//const Data_Resource = require('./data-resource');

/*
var stringify = jsgui.stringify,
	each = jsgui.each,
	arrayify = jsgui.arrayify,
	tof = jsgui.tof;
var filter_map_by_regex = jsgui.filter_map_by_regex;
var Class = jsgui.Class,
	Data_Object = jsgui.Data_Object;
var fp = jsgui.fp,
	is_defined = jsgui.is_defined;
var Collection = jsgui.Collection;
*/

//var exec = require('child_process').exec;

// Perhaps this will have HTTP endpoints as well?
//  Maybe we can access it through url/resources/

// Perhaps a resource publisher, or a few of them could be useful.
//  HTTP_Resource_Publisher?
//  Generally publishes a resource over HTTP.
//   Will have some authorization and authentication properties, hooked up with the proper providers.

// This may be the place in which remote access to the resources is given.
//  It would make sense.
//  Perhaps it is worth using a resource publisher? Then is that a resource?
//  I think the resource pool may be the sensible point of access.


// Possibly all websocket communications for all client-side resources will go through the pool.
//  May need to specify which server in particular we connect to over websocket.
//   However, having front-end back-end servers could work well, that redirect to other servers, thereby providing one endpoint, and balance the load.

/*
var fields = {
	'url': String
};
*/
class Client_Resource_Pool extends Resource_Pool {
	//'fields': ,
	constructor(spec) {
		//this._super(spec);
		super(spec);

		// Default data resource used by client.js to attach server-exposed functions.
		this.data_resource = new Data_Get_Post_Delete_HTTP_Resource({
			name: 'data'
		});
		this.add(this.data_resource);

		this._started_resource_names = new Set();

	}
	'start'(callback) {

		return prom_or_cb((resolve, reject) => {
			const start_resource = (resource) => {
				return new Promise((resolve_start, reject_start) => {
					if (!resource || typeof resource.start !== 'function') return resolve_start(true);

					let settled = false;
					const settle_ok = (value) => {
						if (settled) return;
						settled = true;
						resolve_start(value);
					}
					const settle_err = (err) => {
						if (settled) return;
						settled = true;
						reject_start(err);
					}

					const cb = (err, value) => {
						if (err) {
							settle_err(err);
						} else {
							settle_ok(value);
						}
					};

					try {
						const maybe_promise = resource.start(cb);
						if (maybe_promise && typeof maybe_promise.then === 'function') {
							maybe_promise.then(settle_ok, settle_err);
						}
					} catch (e) {
						settle_err(e);
					}
				});
			}

			(async () => {
				try {
					const arr_resources = (this.resources && this.resources._arr) ? Array.from(this.resources._arr) : [];
					const remaining = new Set(arr_resources.filter(r => r && !this._started_resource_names.has(r.name)));
					if (remaining.size === 0) {
						this.__started = true;
						return resolve(true);
					}

					const started = [];
					let progressed = true;
					while (remaining.size && progressed) {
						progressed = false;
						for (const resource of Array.from(remaining)) {
							let meets_requirements = true;
							if (resource && typeof resource.meets_requirements === 'function') {
								meets_requirements = resource.meets_requirements();
							}
							if (meets_requirements) {
								await start_resource(resource);
								remaining.delete(resource);
								started.push(resource);
								this._started_resource_names.add(resource.name);
								progressed = true;
							}
						}
					}

					if (remaining.size) {
						const remaining_names = Array.from(remaining)
							.map(r => r && r.name)
							.filter(Boolean);
						const err = new Error('Unable to start all resources (unmet requirements): ' + remaining_names.join(', '));
						err.code = 'RESOURCE_REQUIREMENTS_UNMET';
						err.remaining_resource_names = remaining_names;
						throw err;
					}

					this.__started = this._started_resource_names.size === arr_resources.length;
					resolve(true);
				} catch (e) {
					reject(e);
				}
			})();
		}, callback);


	}

}
module.exports = Client_Resource_Pool;
