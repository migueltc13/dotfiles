const PanelMenu = imports.ui.panelMenu;
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Main = imports.ui.main;
const Keymap = imports.gi.Gdk.Keymap;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Config = imports.misc.config;
const [VersionMajor, VersionMinor] = Config.PACKAGE_VERSION.split('.');
const Version = parseInt(VersionMajor) == 3 ? parseInt(VersionMinor) : parseInt(VersionMajor);
const GLib = imports.gi.GLib;

let _x11;

let indicator;

function getKeymap()
{
    if (Version > 36 && !_x11)
        return Clutter.get_default_backend().get_default_seat().get_keymap();

    return Keymap.get_default();
}

function updateState()
{
    let numlock_state = getKeymap().get_num_lock_state(), capslock_state = getKeymap().get_caps_lock_state();

    if ((indicator.actor.visible = (numlock_state | capslock_state)) == false)
        return;

    numlock_state ? indicator.numIcon.show() : indicator.numIcon.hide();
    capslock_state ? indicator.capsIcon.show() : indicator.capsIcon.hide();
}

function init()
{
    _x11 = GLib.getenv('XDG_SESSION_TYPE') == 'x11';
}

function enable()
{
    indicator = new PanelMenu.Button();

    indicator.numIcon = new St.Icon({ gicon: Gio.icon_new_for_string(Me.path + '/numlock-symbolic.svg'), style_class: 'system-status-icon icon-style' });
    indicator.capsIcon = new St.Icon({ gicon: Gio.icon_new_for_string(Me.path + '/capslock-symbolic.svg'), style_class: 'system-status-icon icon-style' });

    let layoutManager = new St.BoxLayout({style_class: 'icon-box'});
    layoutManager.add_child(indicator.numIcon);
    layoutManager.add_child(indicator.capsIcon);

    indicator.actor.add_actor(layoutManager);

    Main.panel.addToStatusArea('lockkeys', indicator, 2);
    indicator._keyboardStateChangedId = getKeymap().connect('state-changed', updateState);
    updateState();
}

function disable()
{
    getKeymap().disconnect(indicator._keyboardStateChangedId);
    indicator.destroy();
}
