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


const fnl = require('fnl');
const prom_or_cb = fnl.prom_or_cb;

// Client_Resource?
//  I think that makes sense, so that we have something specific which has the URL attached.
//   It is able to make HTTP requests to the server resource.

const Data_Resource = require('./data-resource');


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


var fields = {
	'url': String
};
class Client_Resource_Pool extends Resource_Pool {
	//'fields': ,
	constructor(spec) {
		//this._super(spec);
		super(spec);


		// No need to start it in particular?
		//  Sometimes the data resource will operate over websockets

		//  Sometimes SSE would be better.

		let data_resource = new Data_Resource({
			'name': 'Data Resource'
		});
		//console.log('pre add data_resource', data_resource);
		this.add(data_resource);


	}
	'start'(callback) {

		return prom_or_cb((resolve, reject) => {
			//callback(null, true);
			resolve(true);
		}, callback);


		// A simple and automatic data resource would be useful.
		//  Hooks up with provision of server-side data.
		//   Do more work on defining the server-side data provider.



		// download the resource information from the server...
		//  http request.

		// Think that will be in jsgui-client.
		//  It's worth making the jsgui-client bundle

		// Maybe some other jsgui client bundles, like jsgui-client-platform
		//  including all platform client components. Then there could be some other builds that include more thigns still,
		//  like bunches of controls / components for different customers / websites.

		//console.log('Client_Resource_Pool start, window.location ' + window.location);

		// need to get the resources url...


		/*

		var _request_resources = function() {
			var loc = window.location.toString();
			var pos1 = loc.indexOf('//');
			var pos2 = loc.indexOf('/', pos1 + 2);
			var part1 = loc.substr(0, pos2 + 1);
			//console.log('part1 ' + part1);

			var that = this;

			// carry out the HTTP request.
			//  Use the result to initialize the various resource objects in a collection...
			//  or using the pool really.

			// Perhaps the client pool will have been told what resources are there.
			//  Also, the client pool could be used to access a single resource on the server, and have a bunch of resources available on the client.
			//  These resources will be a bit like global variables with an asyncronous interface.

			// Not sure about assuming the server will provide the resources list a /resources

			// We don't want that default, it makes an extra requirement for the server to fulfill.


			//this.set('url', urlResources);



			var urlResources = part1 + 'resources';
			//console.log('urlResources', urlResources);

			this.url = urlResources;

			// An http abstraction may be good for older browsers, or polyfill elsewhere.
			var oReq = new XMLHttpRequest();
			oReq.onload = function(res) {
				console.log('oReq.responseText ' + oReq.responseText);

				var objResponse = JSON.parse(oReq.responseText);

				// Then for each of them we create an object.

				if (tof(objResponse) == 'array') {
					each(objResponse, function(i, v) {
						var tv = tof(v);

						if (tv == 'string') {
							// it's the name of the Resource.

							var resource = new Resource({
								'meta': {
									'name': v,
									'pool': that,
									'url': urlResources + '/' + v
								}
							});
							that.add(resource);
							//console.log('resource', resource);
						}
						if (tv == 'object') {
							//console.log('v', v);
							var resource = new Resource({
								'meta': {
									'name': v.name,
									'pool': that,
									'url': urlResources + '/' + v.name,
									'type_levels': v.type_levels
								}
							});
							that.add(resource);

						}
					})
				}

			};
			oReq.open("get", urlResources, true);
			oReq.send();
		}
		*/


	}

}
module.exports = Client_Resource_Pool;