var jsgui = require('jsgui3-html');

jsgui.Resource_Pool = require('./client-resource-pool');
jsgui.Client_Page_Context = require('./page-context');
//console.log('jsgui.Client_Page_Context', jsgui.Client_Page_Context);
//jsgui.Selection_Scope = require('./selection-scope');
// And then can automatically activate?
//

jsgui.Client_Resource = require('./resource');

const fnl = require('fnl');
const prom_or_cb = fnl.prom_or_cb;

/* -- REQUIREMENTS -- */




if (typeof window !== 'undefined') {

    const textToArrayBuffer = (textBuffer, startOffset = 0) => {
        var len = textBuffer.length - startOffset;
        var arrayBuffer = new ArrayBuffer(len);
        var ui8a = new Uint8Array(arrayBuffer, 0);
        for (var i = 0, j = startOffset; i < len; i++, j++)
            ui8a[i] = (textBuffer.charCodeAt(j) & 0xff);

        let buf = new Buffer(arrayBuffer);
        return buf;
    }


    jsgui.http = (url, callback) => {
        return prom_or_cb((resolve, reject) => {
            var oReq = new XMLHttpRequest();

            oReq.onreadystatechange = function() {
                if (this.readyState == 4) {
                    console.log('this.status', this.status);

                    if (this.status == 200) {
                        var o = JSON.parse(this.responseText);
                        //myFunction(myArr);
                        resolve(o);
                    } else {
                        reject(this.status);
                    }
                }
            };

            oReq.open("get", url, true);
            oReq.send();
        }, callback);
    }

    let activate = () => {

        page_context = new jsgui.Client_Page_Context({
            'document': document
        });



        // 


        // maybe need a different register function.

        /*

        jsgui.register_ctrl = (type_name, ctrl_name, Ctrl) => {
            console.log('register_ctrl type_name, ctrl_name', type_name, ctrl_name);
            jsgui[ctrl_name] = Ctrl;
            page_context.update_Controls(type_name, Ctrl);

        }
        */




        // Set up a variety of UI controls here.

        // May be worth looking at some registry of controls.


        window.onload = function () {
            //console.log('pre activate');
            //setTimeout(() => {

            //}, 1000);
            //console.log('!!jsgui.Toggle_Button', !!jsgui.Toggle_Button);

            // A way to have the controls registered by name.
            // foo.constructor.name
            //  then make it lower case.

            // Could go through every object in jsgui, seeing if it's a control.

            var early_load_and_activate = function () {
                page_context.update_Controls('text_field', jsgui.Text_Field);
                page_context.update_Controls('text_item', jsgui.Text_Item);


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
                page_context.update_Controls('color_palette', jsgui.Color_Palette);
                page_context.update_Controls('grid', jsgui.Grid);
                page_context.update_Controls('month_view', jsgui.Month_View);
                page_context.update_Controls('date_picker', jsgui.Date_Picker);
                page_context.update_Controls('button', jsgui.Button);
                page_context.update_Controls('arrow_button', jsgui.Arrow_Button);
                page_context.update_Controls('tile_slider', jsgui.Tile_Slider);
                page_context.update_Controls('left_right_arrows_selector', jsgui.Left_Right_Arrows_Selector);
                page_context.update_Controls('span', jsgui.span);


                page_context.update_Controls('Tabbed_Panel', jsgui.Tabbed_Panel);
                //page_context.update_Controls('span', jsgui.span);

                jsgui.activate(page_context);
                console.log('post jsgui activate');

                // There could be a second activation stage.
                //  post-activate
                //  on activated

                // activate page, after activating controls.
                //  sometimes the control will be the page.
                //  however, we need to activate the page in some situations.

                // .on(active)
                
                // client activate hooks.

                // Injection of further code here...

                // Could load code that has its own dependencies.
                //  That would make sense if loading other bits and pieces.

                // Could also import / load further requirements above.

                //  Editing this client.js file seems like the best way to go.
                //  Could replace one commented area with a list of statements.

                // So it would be able to require various files, then make use of them during activation.

                let context = page_context;

                /* -- ACTIVATE-APP -- */
            }
            early_load_and_activate();
        }
    }
    activate();
}

module.exports = jsgui;