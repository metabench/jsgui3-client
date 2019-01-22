var jsgui = require('jsgui3-html');

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

var Client_Resource_Pool = require('./client-resource-pool');
//var Selection_Scope = require('./selection-scope');
//console.log('jsgui.Page_Context', jsgui.Page_Context);

class Client_Page_Context extends jsgui.Page_Context {
    constructor(spec) {
        spec = spec || {};
        super(spec);
        //this.set('document', spec.document);
        this.document = spec.document || document;
        this.resource_pool = new Client_Resource_Pool({});
        // get the data_resource out of the resource_pool
        // Looks like I need to fix Collection, its indexing, and use within Resource.
        //console.log('this.resource_pool.resource_names', this.resource_pool.resource_names);
        //console.log('this.resource_pool', this.resource_pool);

        // Should be fixed alongside resource_pool collection indexing.
        this.data_resource = this.resource_pool.resources._arr[0];
        this.map_els = {};
        // The item IDs could be handled here... use the local variable closure here.
        // Client data resource for general purpose data?
    }
    'get_ctrl_el'(ctrl) {
        return this.map_els[ctrl._id()];
    }
    'register_el'(el) {
        let jsgui_id = el.getAttribute('data-jsgui-id');
        //console.log('jsgui_id', jsgui_id);
        if (jsgui_id) {
            this.map_els[jsgui_id] = el;
        }
        //console.log('context registered ' + jsgui_id);
    }

    // change to get body function.

    
    'body'() {
        var doc = this.document;
        //console.log('doc', doc);
        //var bod = doc.childNodes[0].childNodes[1];
        // Gets the body control.
        var bod = doc.body;
        //var bod = doc.body;
        //console.log('bod', bod);
        // Then need to see if a control exists.
        if (!this._body) {

            // Can we connect it through jsgui ids.

            var existing_jsgui_id = bod.getAttribute('jsgui-id');

            if (!existing_jsgui_id) {
                // Those don't use the enhancements...

                var ctrl_body = new jsgui.body({
                    'el': document.body,
                    'context': this
                });
                //ctrl_body.dom.el = bod;
                ctrl_body.dom.el.setAttribute('jsgui-id', ctrl_body._id());

                //var id = ctrl_body._id();

                //this.map_controls[id] = ctrl_body;

                this.register_control(ctrl_body);
                this._body = ctrl_body;
            }
            //console.log('ctrl_body._id()', ctrl_body._id());
        } else {
        }
        return this._body;
    }
}
// Also want a File_Server.
//  Want files to be served from a particular path, as a resource in the URL system.
//  Will be able to post files there with the right permission.
module.exports = Client_Page_Context;