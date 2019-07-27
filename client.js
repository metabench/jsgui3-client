// Making it a global variable.
jsgui = require('jsgui3-html');
jsgui.Resource_Pool = require('./client-resource-pool');
jsgui.Client_Page_Context = require('./page-context');
//console.log('jsgui.Client_Page_Context', jsgui.Client_Page_Context);
//jsgui.Selection_Scope = require('./selection-scope');
// And then can automatically activate?
//

jsgui.Client_Resource = require('./resource');
const fnl = require('fnl');
const prom_or_cb = fnl.prom_or_cb;

const {each, tf} = jsgui;

// Should move some / all html that is client-side to here.

// Leave the line below
/* -- REQUIREMENTS -- */
// Leave the line above

if (typeof window !== 'undefined') {
    // Maybe use the vhl dl function? Or similar observable?

    // need to use https really

    // timeout...
    let context;

    jsgui.http = (url, callback) => {
        return prom_or_cb((resolve, reject) => {
            let timeout = 2500;
            //if (jsgui.timeout) timeout = jsgui.timeout;
            //console.log('timeout', timeout);
            var oReq = new XMLHttpRequest();
            oReq.timeout = timeout;
            oReq.onreadystatechange = function () {
                //console.log('this.readyState', this.readyState);
                //console.log('this.status', this.status);
                if (this.readyState === 4) {
                    //console.log('this.status', this.status);
                    if (this.status === 200) {
                        var o = JSON.parse(this.responseText);
                        //myFunction(myArr);
                        resolve(o);
                    } else {
                        reject(this.status);
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
            oReq.onreadystatechange = function () {
                if (this.readyState === 4) {
                    //console.log('this.status', this.status);
                    if (this.status === 200) {
                        var o = JSON.parse(this.responseText);
                        //myFunction(myArr);
                        resolve(o);
                    } else {
                        //console.log('this.status', this.status);
                        reject({
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
            oReq.onreadystatechange = function () {
                if (this.readyState === 4) {
                    //console.log('this.status', this.status);
                    if (this.status === 200) {
                        var o = JSON.parse(this.responseText);
                        //myFunction(myArr);
                        resolve(o);
                    } else {
                        reject(this.status);
                    }
                }
            };
            oReq.open("DELETE", url, true);
            oReq.send();
        }, callback);
    }

    
    jsgui.update_standard_Controls = page_context => {
        //console.log('client.js update_standard_Controls');
        //console.trace();

        // jsgui.controls
        //  put them there before the registration phase.
        //   and update all of them with one function call.
        // jsgui.ctrls

        each(jsgui.controls, (Control_Subclass, name) => {
            page_context.update_Controls(name, Control_Subclass);
        });
        /*

        page_context.update_Controls('text_field', jsgui.Text_Field);
        page_context.update_Controls('text_item', jsgui.Text_Item);
        page_context.update_Controls('tree', jsgui.Tree);
        page_context.update_Controls('tree_node', jsgui.Tree_Node);
        page_context.update_Controls('panel', jsgui.Panel);
        page_context.update_Controls('title_bar', jsgui.Title_Bar);
        page_context.update_Controls('vertical_expander', jsgui.Vertical_Expander);
        page_context.update_Controls('resize_handle', jsgui.Resize_Handle);
        page_context.update_Controls('toggle_button', jsgui.Toggle_Button);
        page_context.update_Controls('start_stop_toggle_button', jsgui.Start_Stop_Toggle_Button);
        page_context.update_Controls('plus_minus_toggle_button', jsgui.Plus_Minus_Toggle_Button);
        page_context.update_Controls('list', jsgui.List);
        page_context.update_Controls('item', jsgui.Item);
        page_context.update_Controls('item_view', jsgui.Item_View);
        page_context.update_Controls('item_selector', jsgui.Item_Selector);
        page_context.update_Controls('combo_box', jsgui.Combo_Box);
        page_context.update_Controls('popup_menu_button', jsgui.Popup_Menu_Button);
        //page_context.update_Controls('color_palette', jsgui.Color_Palette);
        page_context.update_Controls('grid', jsgui.Grid);
        page_context.update_Controls('grid_cell', jsgui.Grid.Cell);
        //page_context.update_Controls('month_view', jsgui.Month_View);
        //page_context.update_Controls('date_picker', jsgui.Date_Picker);
        page_context.update_Controls('button', jsgui.Button);
        page_context.update_Controls('multi_layout_mode', jsgui.Multi_Layout_Mode);
        page_context.update_Controls('horizontal_slider', jsgui.Horizontal_Slider);
        //page_context.update_Controls('tile_slider', jsgui.Tile_Slider);
        page_context.update_Controls('left_right_arrows_selector', jsgui.Left_Right_Arrows_Selector);
        page_context.update_Controls('span', jsgui.span);

        page_context.update_Controls('month_view', jsgui.Month_View);
        //context = page_context;
        */
        
        //console.log('jsgui.controls', jsgui.controls);
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
        console.log('client.js activate');
        const {def_server_resources} = jsgui;
        console.log('def_server_resources', def_server_resources);
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

        

        jsgui.raise('pre-activate', {
            context: context
        });

        jsgui.activate(page_context);

        

        // Could set up the data_resource function calls here.
        //  Seems like a sensible place to do it, but maybe call a function that is elsewhere.
        //   These function calls will need to talk to the server.

        // context resources data resource.
        //  will create the function call here.

        //console.log('Object.keys(context)', Object.keys(context));
        //console.log('Object.keys(context.resource_pool)', Object.keys(context.resource_pool));
        //console.log('Object.keys(context.resource_pool.resources)', Object.keys(context.resource_pool.resources));

        const arr_resources = context.resource_pool.resources._arr;
        const data_resource = arr_resources[0];

        //console.log('data_resource', data_resource);

        const activate_server_resource_fn = (obj_def) => {
            //console.log('obj_def', obj_def);

            const {name, type} = obj_def;
            if (type === 'function') {
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

        // Set up a variety of UI controls here.
        // May be worth looking at some registry of controls.
    }
    // Multiple onload items being added.
    //  Seems like the 

    window.addEventListener('load', () => {
        console.log('client.js window onload');
        activate();
    });

    // Maybe body could be used a lot more for event handling, using delegation.
    //  Worth building a body event delegation system that works seprately.
    //  Can make it an option for adding events, rather than the default way.

    // Seems a problem right now where the body is not recognising / responding to items being added to it.
    
    /*
    window.onload = () => {
        console.log('client.js window onload');
        activate();
    }
    */

    // Problem for the moment - context is not showing up in the client-side code.

    // LEAVE THIS
    /* -- ACTIVATE-APP -- */

    /*
            }
            early_load_and_activate();
        }
    }
    //activate();
    */

}

module.exports = jsgui;