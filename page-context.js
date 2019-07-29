var jsgui = require('jsgui3-html');

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

const {Control, controls, deep_sig} = jsgui;
const {Modal} = controls;

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
        //this.data_resource = this.resource_pool.resources._arr[0];

        this.__is_active = true; // not true on the server.

        this.map_els = {};
        // The item IDs could be handled here... use the local variable closure here.
        // Client data resource for general purpose data?

        // Will have a modal control too, essentially a singleton that can exist within the body.

        // a 'modal' read-only property.

        // will create the control, place it into the body.

        let ctrl_modal;
        
        Object.defineProperty(this, 'modal', {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get() { 
                if (ctrl_modal) {
                    return ctrl_modal;
                } else {
                    ctrl_modal = new Modal({
                        context: this,
                        class: 'modal'
                    });
                    const body = this.body();
                    if (body) {
                        body.add(ctrl_modal);
                    }
                    return ctrl_modal;
                }
            },
            enumerable: true//,
            //configurable: true
        });

        let ctrl_overlay;
        
        Object.defineProperty(this, 'overlay', {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get() { 
                if (ctrl_overlay) {
                    return ctrl_overlay;
                } else {
                    ctrl_overlay = new Control({
                        context: this,
                        class: 'overlay'
                    });
                    const body = this.body();
                    if (body) {
                        body.add(ctrl_overlay);
                        ctrl_overlay.activate();
                    }

                    // Also placing control arrays / collections of controls?

                    ctrl_overlay.place = (ctrl, location) => {

                        // mfp on location?

                        // problem doing deep sig here...
                        //  deep sig should probably stop with control and not go deeper.
                        //  have the type C Control defined here.


                        const sloc = deep_sig(location);
                        //console.log('sloc', sloc);

                        let placement_abs_pos;

                        if (sloc === '[s,C]') {
                            const [str_description, ctrl_target] = location;

                            // then go from descriptions such as 'below'.

                            //  Maybe this will be best with location binding too?
                            //   In case the control under it moves / resizes.
                            //    redimension? move or resize.

                            // get the dimensions (bcr) of the target
                            //console.log('ctrl_target', ctrl_target);

                            const target_bcr = ctrl_target.bcr();
                            const overlay_bcr = ctrl_overlay.bcr();
                            console.log('target_bcr', target_bcr);
                            console.log('overlay_bcr', overlay_bcr);

                            // determine the position where the ctrl goes.

                            // depending on the string

                            if (str_description === 'below') {

                                placement_abs_pos = [target_bcr[0][0], target_bcr[1][1]];
                                //console.log('placement_abs_pos', placement_abs_pos);


                                // Work out how much space below there is.
                                //  Cant be bigger than the amount of space available.
                                //  Could bind this spacing, ie update it when the space increases.

                                // how much space below?
                                const overlay_size = overlay_bcr[1];
                                console.log('overlay_size', overlay_size);

                                const body_size = body.bcr()[1];
                                console.log('body_size', body_size);

                                const height_left_below_placement = body_size[1] - placement_abs_pos[1];
                                console.log('height_left_below_placement', height_left_below_placement);

                                // set max-height.





                                // set the control's position attributes.

                                ctrl.pos = placement_abs_pos;
                                ctrl.dom.attributes.style.position = 'absolute';
                                ctrl.dom.attributes.style['max-height'] = height_left_below_placement + 'px';




                                // 

                            } else {
                                console.trace();
                                throw 'NYI';
                            }

                            // maybe .bind or .place_bind would do that.


                        }

                        ctrl_overlay.add(ctrl);



                    }


                    return ctrl_overlay;
                }
            },
            enumerable: true//,
            //configurable: true
        });

        // Pupup functionality will work with this overlay, for absolute positioning with ease.
        //  Will help to keep the body level node clearer with fewer children, have the elements more nested.

        // A popup layer control as well. called 'overlay'.
        //  That would help.

        // Be able to put things within a 'popup' level.
        //  Maybe could be useful for external control framing too.

        // Somewhat extensive work on the popup system makes sense.
        //  But for the moment, just make use of it.

        // A popup mixin?
        //  Want popups to be in a specific place relative to another control.
        //  Popup positioning and placement within one specific module.
        //   Maybe it will be a mixin.

        // Anyway, should work on and use the overlay for popups.
        //  Drop down should make use of the popup layer.















        // Could popup itself be a modal?

        // Just make a popup layer control for the moment.


        // page_context.popup.add?
        // page_context.overlay.add sounds a bit better. the popups appear in the overlay layer.





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

        //console.log('context body() function');

        var doc = this.document;
        //console.log('doc', doc);
        //var bod = doc.childNodes[0].childNodes[1];
        // Gets the body control.
        var bod = doc.body;
        //var bod = doc.body;
        //console.log('bod', bod);
        // Then need to see if a control exists.

        //console.log('!!this._body', !!this._body);

        if (!this._body) {
            // Can we connect it through jsgui ids.

            var existing_jsgui_id = bod.getAttribute('data-jsgui-id');
            //console.log('existing_jsgui_id', existing_jsgui_id);

            // Probably don't want to create a new body control.
            //  Now it gets activated automatically by default on the client.
            //  Probably worth saving the body control at the point of activation.



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
            } else {
                // Look it up in the map of controls.

                if (this.map_controls[existing_jsgui_id]) {
                    this._body = this.map_controls[existing_jsgui_id];
                }
            }
            //console.log('ctrl_body._id()', ctrl_body._id());
        } else {

        }
        return this._body;
    }
}

// What about normal layer within the body too?
//  then modal.inner? will have relative position?

// modal having absolute position itself makes sense.

Client_Page_Context.css = `
body .modal {
    position: absolute;
    left: 0px;
    top: 0px;
}
body .overlay {
    position: absolute;
    left: 0px;
    top: 0px;
}
`;

// Also want a File_Server.
//  Want files to be served from a particular path, as a resource in the URL system.
//  Will be able to post files there with the right permission.
module.exports = Client_Page_Context;