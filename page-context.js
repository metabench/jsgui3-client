var jsgui = require('jsgui3-html');

// 01/08/2019 - Wide ranging changes here, dealing with dimensions, dimension changes.
//  Want a new and more efficient of finding control dimension changes, and also changing dimensions at some point.
//   Looking for dimension changes between frames will be of use.
//   Then will notice those dimension changes, and be able to update DOM properties of the elements.
//    That will be a relatively fast and simple way of accessing control dimensions.
//     Won't require calling so many functions.
//      Things could be inlined where needed in the dims part.
//       Or other parts could programmatically refer back to those dims values in the ta.









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

const {Control, controls, deep_sig, each} = jsgui;
const {Modal} = controls;

var Client_Resource_Pool = require('./client-resource-pool');
//var Selection_Scope = require('./selection-scope');
//console.log('jsgui.Page_Context', jsgui.Page_Context);

const X = 0, Y = 1, H = 2, W = 3, R = 4, B = 5, TX = 6, TY = 7;
// constant for the moment.
//  32 of them allocated at the moment... only 8 used
//   will use some of them for colors.
//    maybe a secondary size? like font size?

// or a map of the properties from the numbers?




class Client_Page_Context extends jsgui.Page_Context {
    constructor(spec) {
        spec = spec || {};
        super(spec);
        //this.set('document', spec.document);

        /*
        
        var map_Controls = this.map_Controls = {};
        //  they are constructors
        var map_controls = this.map_controls = {};

        // map_control_iids
        //  mapping from the jgsui name to the int ids.
        //  iid  = int id.
        this.map_control_iids = {};
        this.next_iid = 1;

        */

        // iid may not be the best way to do it.
        //  only controls within the DOM will have iids.

        // i_dom_id?
        //  will be useful for referring to positions in typed arrays.
        //   things only need to be changed when controls are added / removed from the DOM.


        // Only set some things up, involving frames, once the doc has been activated.


        const {map_controls, map_control_iids, next_iid} = this;

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

                    // Binding controls within the overlay...
                    //  add_bound
                    //  add(ctrl, {bind: {...}});


                    // Does look like position binding will be useful.
                    //  A system that will recalculate and reposition, resize controls whenever a specific control (or any of a control?) has changed dimensions.

                    // redim
                    //  resize or move...?

                    // 'dim' event makes sense.
                    //  when the dimensions of any control has changed (for any reason).
                    //   requestanimationframe will debounce it while still keeping it fast.

                    // .dim
                    //   a function?
                    //   a property?
                    //  .dims is the dimension property.
                    
                    //  makes sense to have it as a defined property.
                    //   .dims for dimensions.
                    //  returning a typed array would make sense.

                    //  context holding a large typed array of dimensions of all the controls.


                    // Being able to write to this dims object...?
                    //  Would be able to detect changes there within the frames.

                    // page_context.dims
                    //  all dimension of all controls.
                    //  each control will have a numeric id as well.
                    //   that id will be used to refer to its place in the .dims typed array.


                    ctrl_overlay = new Control({
                        context: this,
                        class: 'overlay'
                    });
                    const body = this.body();
                    if (body) {
                        body.add(ctrl_overlay);
                        ctrl_overlay.activate();
                        // Automatic activation will help a lot.
                        //  Whenever a control is placed into an active control.
                    }

                    // Also placing control arrays / collections of controls?

                    // Maybe will use functionality elsewhere.
                    //  Could write functions above here for placement and binding, but move to mixins or wherever is appropriate.

                    // mixin that binds the position of one control within another.
                    //  position and size of the control always defined relative to another.
                    //   but can be in an overlay / background layer of the DOM rather than using css relative with its requirements.


                    // bind mixin?
                    // bind-dims?
                    // bind-dimensions?

                    // binding one control to another...
                    //  and binding so that it can work within an overlay? always works within overlay or separate layer?

                    // Placing something into the overlay - may wish to bind the position.
                    // Add it to the overlay control, then do position binding.

                    // Binding using the dimensions system will help make things more efficient.
                    //  Looking at or using mutation observart results?
                    //  For the moment, keeping track of changes to a map of controls within the DOM between frames, so no mutation observer is necessary.
                    
                    // The controls within the DOM at the starting point?
                    //  Done when a control within the DOM is found by the searching for controls in the DOM at the beginning.

                    // 'place' mixin?
                    //  place one control within another
                    //   bind positioning.
                    //    through a body-relative 0 offset control.
                    //  that way 'place' would be within its own mixin.
                    //   a way to place relative to this.
                    //    could find offset in some cases by using a placeholder.


                    // Not so sure about making a 'place' mixin? place_bind? Binds a control within the control, but it could be bound to dimensions from another control or calculation.
                    //  Changing the order of the typed array?
                    //   Because its really the size which goes alongside the top left position.
                    //   The bottom right position is there because it can be helpful too.

                    // Do some more work on the red box example / demo
                    //  Therefore work on the js compilation in order to create a client-side js version of the code.

                    //  








                    ctrl_overlay.place = (ctrl, location) => {
                        // mfp on location?
                        // problem doing deep sig here...
                        //  deep sig should probably stop with control and not go deeper.
                        //  have the type C Control defined here.

                        // And the location refers to another control.
                        //  A bind mixin function could be of a lot of use.
                        //  Would replace the code written here.

                        //mx_bind(ctrl, location);

                        const sloc = deep_sig(location);
                        //console.log('sloc', sloc);
                        // Dimension binding through a mixin looks like a better way of doing this.
                        //  Binding will respond to DOM updates so that the bound control gets its dimensions refreshed / kept updated.


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

        // window resize events etc?
        //  then in response to such an event can measure and compare sizes
        //   can compare sizes with what was in the previous frame.

        // Want a frame loop / cycle.
        //  Some kind of integrated events / processing.

        // Keeping track of size changes for specific controls...

        // list of controls that will need to have their sizes checked, done for each frame.
        //  want some size / position binding functionality to be delivered conveniently in the background.

        // raise a page context frame event?
        //  maybe getting 

        let frame_num = 0;
        let last_timestamp;
        let was_resized = false;

        // a map of the controls being removed in the frame?
        //  just the control names with true?
        //  ctrl names mapping to the controls would help.
        //   mean it wouldnt be assigned twise.

        this.map_controls_being_removed_in_frame = false;
        this.map_controls_being_added_in_frame = false;

        // keep track of which controls are within the DOM.
        //  a single map obj?
        //  could recreate the obj each frame / whenever it changes.
        //   that would work nicely.
        //   would help keep things relatively efficient.

        let map_ctrls_in_last_frame = {};
        let map_ctrls_in_this_frame;




        // The ta for the last frame?
        // The iid: jsgui_id index.
        //  Bear in mind this index can change / be recreated between frames.
        //  Will detect changes there. Want to avoid unnecessary changes there.

        // Maybe some of this should go in another file?
        //  Maybe the ta of properties within jsgui core?






        // Construction of the typed array for all controls.
        //  Then specific controls can refer to part of it.


        // Colors and opacity would definitely be useful to hold in these.
        //  primary color (bg if it has one)
        //  secondary color (may be unused, ie with text)
        //  tertiery color (may be unused). could be for a border. depends on the control.

        
        // Copy the typed array (with each frame? only once a change was detected.)

        let count_dom_ctrls = 0;
        // Activation should set this value somewhere...?

        // For the moment, lets iterate through the document's controls.
        //  Do this within the constructor?

        // to start with, go through map_ctrls and see if they have an attached .el?
        //  if so, they are dom controls (post activation).

        // Context having an activate event?
        //  Make sense.

        const num_data_points_per_ctrl = 32;

        // const X = 0, Y = 1, H = 2, W = 3, R = 4, B = 5, TX = 6, TY = 7;

        this.on('activate', () => {

            console.log('activated client page_context.... ***** map_controls', map_controls);

            //const {map_controls} = this;
            each(map_controls, (ctrl, jsgui_id) => {
                console.log('');
                console.log('jsgui_id', jsgui_id);
                console.log('!!ctrl.dom.el', !!ctrl.dom.el);

                if (ctrl.dom.el) {
                    map_ctrls_in_last_frame[jsgui_id] = ctrl;
                    count_dom_ctrls++;
                }
            });

            console.log('map_ctrls_in_last_frame', map_ctrls_in_last_frame);


            let ta_last_frame;
            let ta_current_frame_stored;
            let ta_current_frame_for_user;

            let ta_user_frame_changes;
            let map_current_dom_ctrl_iids;
            let map_current_dom_ctrls_by_iid = {};



            // bring over the controls which have not been removed...

            // Don't want this to be all that complex, I hope...
            //  However, complexity here is complexity in the platform layer rather than the app layer.

            // Assigning different int ids to the controls in the DOM...?
            //  That part is useful / relevant for maintaining / using a larger typed array that contains a lot of info about controls.
            //  Tracking all controls' dimensions?
            //   Or make it simple to track the dimensions of a variety of controls, as required.
            //   Then make the typed array including the relevant controls.

            // Want to get this working for spatial binding.
            //  A bit more work to do with that.
            //  Binding a popup list into the available space below another control.

            // Will need to listen for reposition events from that other control.
            //  This is why making a demo app or multiple demo apps will help for trying and showing these principles will help.
            //  More parsing / separation of a single JS file will be used to make it isomorphic.
            //   The js resource will handle that.

            const create_controls_number_props_ta = () => {
                // create it from the map of dom ctrls...?
                //  will set the ta properties.

                // want to check for ta changes between frames too.
                //  will copy this ta (if needed) when a frame is presented.

                // go through all the controls...
                
                // plenty will be available for later use. Can optimize down too.
                const ta_length = num_data_points_per_ctrl * count_dom_ctrls;
                const res = new Float32Array(ta_length);
                // Go through the controls, getting some specific values.
                //  Can do this for movement detection to.

                // Document offset positions being stored too...
                // Need to assign the integer ids to the controls.
                // map_control_iids???
                // or a different map of these?

                const create_map_ctrls_iids = (map_dom_ctrls) => {
                    const keys = Object.keys(map_dom_ctrls);
                    const res = {};
                    // and an array of controls in order?
                    //  would it be quicker? useful?
                    each(keys, (jsgui_id, i) => {
                        // 0 indexed - yes
                        res[jsgui_id] = i;

                        // side effect? lets do it now....
                        map_current_dom_ctrls_by_iid[i] = map_dom_ctrls[jsgui_id];
                    })
                    return res;
                }
                // 

                map_current_dom_ctrl_iids = create_map_ctrls_iids(map_ctrls_in_last_frame);
                console.log('map_current_dom_ctrl_iids', map_current_dom_ctrl_iids);

                const record_ctrls_info = (map_dom_ctrls, map_dom_ctrl_iids, ta) => {

                    // no need to create the ta here...

                    each(map_dom_ctrls, (ctrl, jsgui_id) => {

                        // Record the ctrl having the .ta property that is its relevant slice?
                        // console.log(uint8.subarray(1, 3));
                        //  use subarray, not slice.

                        // offset positions
                        //  bounding client rect
                        const iid = map_dom_ctrl_iids[jsgui_id];
                        const el = ctrl.dom.el;
                        const bcr = el.getBoundingClientRect();

                        // record these...
                        //console.log('');
                        //console.log('jsgui_id', jsgui_id);
                        //console.log('iid', iid);
                        //console.log('bcr', bcr);

                        const start_pos = iid * num_data_points_per_ctrl;
                        //let end_pos = start_pos + num_data_points_per_ctrl;

                        // However, want to give the ta a slice of the user's version.



                        let wpos = start_pos;
                        //console.log('wpos', wpos);

                        ta[wpos++] = bcr.left;
                        ta[wpos++] = bcr.top;
                        ta[wpos++] = bcr.width;
                        ta[wpos++] = bcr.height;
                        ta[wpos++] = bcr.right;
                        ta[wpos++] = bcr.bottom;
                        //const 

                    });
                }

                record_ctrls_info(map_ctrls_in_last_frame, map_current_dom_ctrl_iids, res);
                //console.log('res', res);

                return res;
            }

            const assign_ctrls_ta_subarrays = (ta_current_frame_for_user, map_dom_controls, map_iids) => {
                // go through the map of controls.
                //  set the .ta property.
                console.log('assign_ctrls_ta_subarrays');
                console.log('map_dom_controls', map_dom_controls);

                each(map_dom_controls, (ctrl, jsgui_id) => {
                    const ctrl_iid = map_iids[jsgui_id];

                    const pos_start = ctrl_iid * num_data_points_per_ctrl;
                    const pos_end = pos_start + num_data_points_per_ctrl;
                    ctrl.ta = ta_current_frame_for_user.subarray(pos_start, pos_end);
                });

            }
            //
            //console.log('post assign_ctrls_ta_subarrays');

            const frame_process = (timestamp) => {
                frame_num++;
                //let has_adds_or_removals = false;


                // Detect changes to ta_current_frame_for_user
                //  See which indexes have changed?
                //  Or just now see which control has had any of its value changed.
                //   find jsgui ids for all changed controls...?


                // return an account of which values have changed...
                //  just the control with the value changed.
                
                // left, top, height, 

                const find_control_numeric_values_changed = () => {
                    // Optimised scan?
                    //  Can leave out invisible tag controls at an earlier stage too.

                    // A faster lower level way of comparing? Not right now. ta will be quite fast anyway.

                    let i_ctrl = 0;
                    // go through the arrays comparing them...
                    let pos = 0;

                    const l = ta_current_frame_for_user.length;
                    // map_current_dom_ctrls_by_iid

                    // left, right, width, height
                    //  put together a ta of the changes?
                    //   with a new map index?
                    // or use vector subtraction to find the differences?
                    // ta_user_ctrls_numeric_values_user_changes

                    // at a slightly later stage, will update the DOM according to these changes that were found.

                    // list of the indexes of the changes?

                    let has_change;
                    // precording the change indexes could be of use....

                    // indexes of the controls which have changed...
                    //  or use direct processing when we know the property.

                    // arr_idx_ctrls_with_value_changes
                    //  or array with the positions...?
                    // an array of controls' names...?

                    //  an array of the iids of the controls that have changed?
                    //   

                    // array of ctrls with the changes would help to speed things up.
                    //  and num_changes to go with it (so it doesn't need to be zeroed?)

                    //console.log('count_dom_ctrls', count_dom_ctrls);

                    // not making a new ta would help here.
                    const ta_controls_which_have_changed_iids = new Int8Array(count_dom_ctrls);
                    ta_controls_which_have_changed_iids.fill(-1);
                    let tacwhci_wpos = 0;

                    // simple maths here.
                    while (pos < l) {
                        //console.log('i_ctrl', i_ctrl);
                        const change = ta_current_frame_for_user[pos] - ta_current_frame_stored[pos];

                        let ctrl_iid = Math.floor(pos / num_data_points_per_ctrl);

                        if (change !== 0) {
                            has_change = true;
                            ta_controls_which_have_changed_iids[tacwhci_wpos++] = ctrl_iid;
                        }
                        ta_user_frame_changes[pos] = change;
                        pos++;
                    }

                    if (has_change) {
                        //console.log('ta_user_frame_changes', ta_user_frame_changes);

                        // for the next frame, can't have changes.
                        //  maybe swap the typed arrays???

                        // then go through ta_controls_which_have_changed_iids
                        //  will look up the various changes.
                        
                        //  will apply the changes (directly?) to the controls.
                        //   setting dom.attributes.style could make sense...?
                        //    not using / referring to dom.attributes.style?

                        // may want to stop using proxy there...
                        //  should optimize later.

                        // right now, do this the full jsgui way.
                        //  a shorter code path would be a lot more efficient.

                        let c = 0;
                        let l = ta_user_frame_changes.length;
                        let stop = false;

                        while (!stop && c < l) {
                            const ctrl_iid = ta_controls_which_have_changed_iids[c];

                            if (ctrl_iid === -1) {
                                stop = true;
                            } else {
                                // get the ctrl itself...
                                //console.log('ctrl_iid', ctrl_iid);
                                //console.log('map_current_dom_ctrls_by_iid', map_current_dom_ctrls_by_iid);
                                const changed_ctrl = map_current_dom_ctrls_by_iid[ctrl_iid];

                                //console.log('changed_ctrl', changed_ctrl);
                                const ta_ctrl_changes = ta_user_frame_changes.subarray(ctrl_iid * num_data_points_per_ctrl, (ctrl_iid + 1) * num_data_points_per_ctrl);
                                //console.log('ta_ctrl_changes', ta_ctrl_changes);
                                const ctrl_ta = changed_ctrl.ta; // the new values.

                                let i = 0, l = ctrl_ta.length;

                                let changed_transform = false;

                                for (i = 0; i < l; i++) {
                                    if (ta_ctrl_changes[i] !== 0) {
                                        const new_val = ctrl_ta[i];
                                        //console.log('[i, new_val]', [i, new_val]);

                                        const X = 0, Y = 1, H = 2, W = 3, R = 4, B = 5, TX = 6, TY = 7;

                                        // map of functions could be a little slow.

                                        if (i === 1) {

                                        } else if (i === 2) {
                                            

                                        } else if (i === 3) {
                                            
                                        } else if (i === 4) {
                                            
                                        } else if (i === 5) {
                                            
                                        } else if (i === 6 || i === 7) {

                                            if (!changed_transform) {
                                                // create that new transformed style property.
                                                const tx = ctrl_ta[6];
                                                const ty = ctrl_ta[7];
                                                // transform: translate3d(42px, -62px, -135px);

                                                // Likely do want this to me more immediate.
                                                //  Update and optimise this code path. (dom attrs style subproprty change).

                                                changed_ctrl.dom.attributes.style.transform =  'translate3d(' + tx + 'px, ' + ty + 'px, 0px)';
                                                changed_transform = true;
                                                // then overwrite the ta_current_frame_stored

                                                // need to overwrite it in the specific locations.
                                                //  then reassign the subarray?
                                                //   seems no need for that luckily.
                                                // just overwriting will be fine, I think.

                                                // can copy from the subarray?
                                                //  maybe a loop will be OK.

                                                // ctrl_iid

                                                
                                                // then overwrite.

                                                
                                            }
                                            // TX
                                            // changed_ctrl.dom.attributes.style.transform...
                                        }
                                    }
                                }

                                let w_pos_ctrl = ctrl_iid * num_data_points_per_ctrl;
                                for (let i = 0; i < l; i++) {
                                    ta_current_frame_stored[w_pos_ctrl++] = ctrl_ta[i];
                                }

                                // Will need to carry out the changes....
                                //  Also want the ta of new values.
                                //   overwrite existing ta...


                            }
                            c++;
                        }




                        // 


                    }

                    //console.log('ta_controls_which_have_changed_iids', ta_controls_which_have_changed_iids);
                    //  then will use those to process the specific changes.

                    //
                }

                if (frame_num > 1) {
                    find_control_numeric_values_changed();
                } else {
                    //console.log('will assign ctrls tas');
                    //console.log('map_current_dom_ctrl_iids', map_current_dom_ctrl_iids);
                    assign_ctrls_ta_subarrays(ta_current_frame_for_user, map_ctrls_in_last_frame, map_current_dom_ctrl_iids);

                }







                let count_add = 0;
                let count_remove = 0;

                if (frame_num === 1) {
                    //map_ctrls_in_this_frame = map_ctrls_in_last_frame;
                } else {
                    map_ctrls_in_this_frame = {};
                }

                //let has_add_remove_change = false;

                // Need to deal with any controls that have been added to or removed from the DOM between frames.
                //  an array of controls_being_removed_in_frame
                //   have a look at this, and see if they have been removed yet.

                // A map of controls added during a frame...
                //  Will use this to update the dom controls.
                //   And see if it's added into a control that itself is in the DOM.
                //  Then the dom int ids can be set for the controls, always referring to the controls that are in the DOM.
                //   This map will then be used to refer to dimension data within one large typed array.

                // ctrl.is_in_dom
                //  nice if that got updated when it gets put into the DOM
                //   and removed from the DOM of course.
                //   best to use jsgui itself for this rather than dom mutation events.
                // a further quick stage once any content gets rendered to the DOM?
                //  automatic activation when anything is put into an active control will help as well.

                // context.arr_controls_being_removed_in_frame
                //  a bit long for compression, but optimize later on.

                if (this.map_controls_being_removed_in_frame) {
                    console.log('this.map_controls_being_removed_in_frame', this.map_controls_being_removed_in_frame);
                    // See if those items have been removed?
                    //  Or its more about removing them from the map of controls in the dom.
                    each(map_ctrls_in_last_frame, (ctrl_in_last_frame, ctrl_id) => {
                        if (!this.map_controls_being_removed_in_frame[ctrl_id]) {
                            map_ctrls_in_this_frame[ctrl_id] = ctrl_in_last_frame;
                        }
                    });
                    count_remove += Object.keys(this.map_controls_being_removed_in_frame).length;
                    this.map_controls_being_removed_in_frame = false;
                } else {
                    map_ctrls_in_this_frame = map_ctrls_in_last_frame; // clone?
                }

                if (this.map_controls_being_added_in_frame) {
                    console.log('this.map_controls_being_added_in_frame', this.map_controls_being_added_in_frame);
                    // See if those items have been removed?
                    //  Or its more about removing them from the map of controls in the dom.
                    this.map_controls_being_added_in_frame = false;
                    each(this.map_controls_being_added_in_frame, (ctrl_added, ctrl_id) => {
                        map_ctrls_in_this_frame[ctrl_id] = ctrl_added;
                        count_add++;
                    })
                }


                // 

                // count_ctrls_removed
                // count_ctrls_added

                // maybe return the maps of controls removed and added too.
                //  doing more change notification through the frames system may help to keep things most in sync.

                // a reference to all the ctrls in the frame...?
                //  will need to get this info post-activation.
                // 

                this.raise('frame', {
                    number: frame_num,
                    timestamp: timestamp,
                    window_was_resized: was_resized,
                    count_ctrls_added: count_add,
                    count_ctrls_removed: count_remove,
                    map_dom_controls: map_ctrls_in_this_frame,
                    count_dom_ctrls: count_dom_ctrls,
                    ta_dom_controls_numeric_values: ta_current_frame_for_user,
                    map_dom_ctrl_iids: map_current_dom_ctrl_iids
                });   // inefficient?

                last_timestamp = timestamp;
                window.requestAnimationFrame(frame_process);
                was_resized = false;
                map_ctrls_in_last_frame = map_ctrls_in_this_frame;
            }

            window.requestAnimationFrame(frame_process);
            window.addEventListener('resize', e => {
                was_resized = true;
                this.raise('window-resize', e);
            });

            console.log('count_dom_ctrls', count_dom_ctrls);

            // create the controls integer id map.
            //  best to consider these int ids to be stable within a frame.
            //  ta may get redone between frames in some way.

            // tas:
            //  for last frame...
            //  for the current
            //  copy of the current one
            //   for the next frame.
            //  will go through the ta provided to the coder, seeing if it's been changed in any places.

            ta_current_frame_stored = create_controls_number_props_ta();
            console.log('ta_current_frame_stored.length', ta_current_frame_stored.length);

            ta_current_frame_for_user = new Float32Array(ta_current_frame_stored.length);
            ta_user_frame_changes = new Float32Array(ta_current_frame_stored.length);
            //  then assign the controls their subarray.

            //ta_current_frame_stored.copyWithin()
            ta_current_frame_for_user.set(ta_current_frame_stored);

            


            // 



            // then make integer indexes for the controls.
            //  dont rely on these integer indexes being stable between frames.
            //   maybe they will be???


            // Create a new ta when controls get removed?
            //  Probably better to zero out the data and stop referencing it for the moment
            //   keep a list of free indexes.













        })


        











        

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

        // a typed array of all of the dimensions of all of the controls...?

        // .ctrl_count
        //  and use this to allocate the dims ta.

        // x, y, r, b, h, w
        //  6 dimension properties per object
        //   floating point number
        //    64? 32?

        // A function to create the dims ta...?
        //  Easy access to the count of controls will be useful.
        //   Would be nice if the system kept track of it...
        
        // Or go up the the next available index when allocating.
        //  And maybe allocate with space for some more.

        // Extending a Typed Array object?

        // dimension object for the last frame
        // for the current frame
        // for the next frame - where dimensions can be set.

        // Create a dims object for every frame?
        //  Or can selectively create / modify the dims object.

        // Variety of functons (lower level in some ways) for processing the dims object.
        //  Then present a very simple API with options that allow for some more complexity.

        // create_ta_dims_from_current_ctrls
        // create_dims_from_current_ctrls

        // const {map_controls, map_control_iids, next_iid} = this;

        // Will continue working on this within the CMS UI for the moment.

        // Collection of controls which are in the DOM...?


        // .map_dom_controls
        // .map_used_controls?

        // be able to go through the map_controls looking for the controls which are actually in use in the DOM...?
        //  maybe keep track of this in other placed too. Don't want to do many lookups at this stage.

        // map_controls_in_dom
        //  will help to have this kept track of in different stages.
        //   so it's ready to be referred to here.

        // ta_ctrls_numeric_data

        // how many data positions are allocated per control...?

        // tl: 2
        // size: 2
        // br: 2
        // 3 colors : 12
        // translate x, y : 2
        // rotate: 1

        // total: 21
        //  4 bytes each value (Float32) makes 84 bytes total.
        //  

        // 84 bytes is not so much....
        //  

        // Need to construct the ta_ctrls_values when we have access to the rendered ctrls.
        //  Need to be able to modify the deeper props of ctrls when these values are set...?
        //   Maybe it will need to bypass some things.
        //    Or the getter of these properties will refer to this ta...?
        //    Maybe setters will interact with it too.
        //     To do with css properties.
        //     Many of them will be held differently.
        //      In such a way that many can be set quickly (efficient code)
        //      Read and updated quickly too. Only updated in DOM when there is a change.

        // Maybe server context should hold positions of controls too?
        //  So the control will refer back to its context.

        // May have a property of the ctrl such as using_context_props
        
        // For the moment, let's make the basic implementation.





















        // Problem with this function: It deals with every control in map_controls.
        //  Shows that some unneeded controls (with the dom els) get retained in the map.

        // Need a better way to destroy and dereference controls.
        //  Remove it from the context, all maps etc.
        //   Keeping some dom nodes (such as with popup lists) enables them to be put back into the DOM quickly.

        // Definitely want there to be a system of checking for 


        const trial_fns_now_unused = () => {

            const create_dims_from_current_ctrls = this.create_dims_from_current_ctrls = () => {
                // Results are sparse because not every possibly index gets used in the control...?
                //  All the iids are there...
                //  Likely because many such as <script> tags are at 0,0 with size 0. That seems most likely.
    
                const {next_iid} = this;
                //console.log('next_iid', next_iid);
                
                const ctrl_length = 6;
                const ta_res = new Float32Array(next_iid * ctrl_length);
    
                // then go through all controls
                let wpos = 0;
    
                // Want a way to reassign iids...?
                //  Deal with controls being removed / deregistered?
                //  ctrl.destroy()?
                //   including deregistering the control.
                //    freeing up its iid.
                //    want to reuse iids.
    
                // would take more work on deregistering controls as well...?
    
                // or only the number of controls in map_controls?
                //  that would be the controls without null references.
    
                // This would mean tightening up on some assignment and allocation.
                //  Want a system of keeping track of controls and providing updates for them.
    
                // An integer number, not sparse, for each control, is something worth making sure of.
                //  Dealing with controls being removed...
    
                // Specifically tracking controls within the DOM here, not just all controls.
                //  Allow jsgui to deal with controls not within the dom.
    
                // iid should correspond to it being in the DOM.
                //  correspond to its position within the DOM?
    
                // some of the controls won't be within the DOM.
    
                // keeping track of map_controls_within_dom
                //  if it has dom.el reference.
    
                // Yes, definitely want to keep track of what's in the DOM better.
                //  Then there will / may be some monitoring of those controls.
                //  Such as automatically checking dimensions of controls in some situations.
    
                // Automatically checking the dimensions of some controls in some situations.
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
                each(map_controls, (ctrl, id) => {
                    const ctrl_iid = ctrl.iid;
                    console.log('ctrl_iid', ctrl_iid);
    
                    wpos = ctrl_iid * ctrl_length;
                    // get the ta bcr?
                    //  direct bounding client rectangle will be faster.
                    //  whole bunch of optimizations can avoid using each and use for loops instead. fewer function calls.
                    //   could look into macro / compilation replacement too.
    
                    console.log('ctrl.dom.el', ctrl.dom.el);
    
                    if (ctrl.dom && ctrl.dom.el) {
                        const bcr = ctrl.dom.el.getBoundingClientRect();
                        //console.log('bcr', bcr);
                        ta_res[wpos++] = bcr.left;
                        ta_res[wpos++] = bcr.top;
                        ta_res[wpos++] = bcr.right;
                        ta_res[wpos++] = bcr.bottom;
                        ta_res[wpos++] = bcr.width;
                        ta_res[wpos++] = bcr.height;
                    }
    
                    /*
                    var bcr = el.getBoundingClientRect();
                    var res = [
                        [bcr.left, bcr.top],
                        [bcr.right, bcr.bottom],
                        [bcr.width, bcr.height]
                    ];
                    */
    
                });
                return ta_res;
            }

        }

        






        /*

        Object.defineProperty(this, 'dims', {

            get() { 
                // Create the dimension object?
                //  Needs to be the dimension object for the latest frame.

                // Just return the dimension object?
                //  Return a copied / cloned dimension object in order to detect changes made?







            },
            enumerable: true//,
            //configurable: true
        });
        */












        //console.log('end client page-context constructor');



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