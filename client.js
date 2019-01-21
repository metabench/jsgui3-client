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

// Leave the line below
/* -- REQUIREMENTS -- */
// Leave the line above

if (typeof window !== 'undefined') {


    // need to use https really

    jsgui.http = (url, callback) => {
            return prom_or_cb((resolve, reject) => {
                var oReq = new XMLHttpRequest();
                oReq.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        //console.log('this.status', this.status);
                        if (this.status == 200) {
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
        },
        jsgui.http_post = (url, value, callback) => {
            return prom_or_cb((resolve, reject) => {
                var oReq = new XMLHttpRequest();
                oReq.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        //console.log('this.status', this.status);
                        if (this.status == 200) {
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
                let s_value;
                if (typeof value !== 'string') {
                    s_value = JSON.stringify(value);
                } else {
                    s_value = value;
                }
                oReq.open("POST", url, true);
                oReq.send(s_value);
            }, callback);
        }

    jsgui.update_standard_Controls = page_context => {
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
    }

    // Standard controls update
    // Standard controls import?

    // jsgui.update_page_context_default_controls()


    /*

    let activate = () => {
        page_context = new jsgui.Client_Page_Context({
            'document': document
        });
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

                let context = page_context;

                */

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