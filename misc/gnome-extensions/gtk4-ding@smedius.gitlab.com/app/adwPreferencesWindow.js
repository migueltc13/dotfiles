/* Desktop Icons GNOME Shell extension
 *
 * Copyright (C) 2023 Sundeep Mediratta (smedius@gmail.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import {Gtk, Gdk, Gio, GLib, GObject, Adw} from '../dependencies/gi.js';
import {_} from '../dependencies/gettext.js';
import {DesktopFolderUtils} from '../dependencies/localFiles.js';

export {AdwPreferencesWindow};

const appID = 'com.desktop.ding';
const appPath = GLib.build_filenamev(['/', ...appID.split('.')]);

const ListObject = GObject.registerClass({
    GTypeName: 'peferences-list',
    Properties: {
        'indexkey': GObject.ParamSpec.string(
            'indexkey',
            'Indexkey',
            'A read-write string property',
            GObject.ParamFlags.READWRITE,
            ''
        ),
        'description': GObject.ParamSpec.string(
            'description',
            'Description',
            'A read-write string property',
            GObject.ParamFlags.READWRITE,
            ''
        ),
    },
}, class listObject extends GObject.Object {
    constructor(constructProperties = {}) {
        super(constructProperties);
    }

    get indexkey() {
        if (this._indexkey === undefined)
            this._indexkey = '';

        return this._indexkey;
    }

    set indexkey(value) {
        if (this.indexkey === value)
            return;

        this._indexkey = value;
        this.notify('indexkey');
    }

    get description() {
        if (this._description === undefined)
            this._description = '';

        return this._description;
    }

    set description(value) {
        if (this.description === value)
            return;

        this._description = value;
        this.notify('description');
    }
});

const ComboRowWithKey = GObject.registerClass({
    GTypeName: 'ComboRowWithKey',
    Properties: {
        'indexkey': GObject.ParamSpec.string(
            'indexkey',
            'Indexkey',
            'A read-write string property',
            GObject.ParamFlags.READWRITE,
            ''
        ),
    },
}, class ComboRowWithKey extends Adw.ComboRow {
    constructor(constructProperties = {}) {
        super(constructProperties);
        this._indexKey = '';
        this.connect('notify::selected-item', () => {
            let item = this.get_selected_item();
            this.indexkey = item.indexkey;
        });
    }

    makeEnumn(enumexpression) {
        const listStore = new Gio.ListStore(ListObject._$gtype);
        this.enumExpression = {};
        let i = 0;
        for (let key in enumexpression) {
            this.enumExpression[key] = parseInt(i);
            let listObject = new ListObject();
            listObject.indexkey = key;
            listObject.description = enumexpression[key];
            listStore.append(listObject);
            i += 1;
        }

        this.set_model(listStore);

        const listFactory = new Gtk.SignalListItemFactory();
        listFactory.connect('setup', (_actor, listitem) => {
            let label = new Gtk.Label();
            listitem.set_child(label);
        });
        listFactory.connect('bind', (_actor, listitem) => {
            let label = listitem.get_child();
            let item = listitem.get_item();
            label.set_text(item.description);
        });
        this.set_factory(listFactory);

        const expression = new Gtk.PropertyExpression(ListObject,
            null,
            'description'
        );
        this.set_expression(expression);
    }

    get indexkey() {
        if (this._indexkey === undefined)
            this._indexkey = '';

        return this._indexkey;
    }

    set indexkey(value) {
        if (this.indexkey === value)
            return;

        this._indexkey = value;

        if (this.get_selected !== this.enumExpression[value])
            this.set_selected(this.enumExpression[value]);

        this.notify('indexkey');
    }
});

const ShortcutGroup = GObject.registerClass(
class ShortcutGroup extends Adw.PreferencesGroup {
    constructor(params = {}) {
        super({});
        this.set_title(_('Shortcuts'));

        this.shortcutButton = new Adw.ActionRow({
            title: _('Edit Shortcuts...'),
        });
        const icon = Gtk.Image.new_from_icon_name('window-pop-out-symbolic');
        this.shortcutButton.add_suffix(icon);
        this.shortcutButton.set_activatable_widget(icon);

        this.shortcutButton.connect('activated', this.showShortcuts.bind(this));
        this.add(this.shortcutButton);
        this.update(params.remoteActions);
    }

    update(remoteActions) {
        this.remoteActions = remoteActions;
        if (this.remoteActions?.list_actions()) {
            this.shortcutButton.set_sensitive(true);
            this.set_description(_('Edit Application Shortcuts'));
        } else {
            this.shortcutButton.set_sensitive(false);

            this.set_description(
                _('Shortcuts Editable only when Extension Enabled...')
            );
        }
    }

    showShortcuts() {
        this.remoteActions.activate_action('showShortcutViewer', null);
    }
});

const aboutApp = class AboutDialog {
    constructor(params = {}) {
        this.version = params.version;
        this.appID = appID;
        const aboutDialog = Adw.AboutDialog.new();
        this.init(aboutDialog);
        return aboutDialog;
    }

    init(aboutDialog) {
        aboutDialog.modal = true;
        aboutDialog.set_application_icon(this.appID);
        aboutDialog.set_application_name('Adw. Desktop Icons');

        aboutDialog.set_comments(
            'An application to show Icons on the Gnome Desktop'
        );

        aboutDialog.set_copyright('© 2025 Sundeep Mediratta');
        aboutDialog.set_developer_name('Sundeep Mediratta');

        aboutDialog.set_comments(
            'Adw. Desktop Icons is an extension and a program together for ' +
            'the GNOME Shell that renders icons on the desktop. It is a fork ' +
            'from Desktop Icons NG (DING), by Sergio Costas, which itself ' +
            'is a fork/rewrite of the official "Desktop Icons" extension, ' +
            'originally by Carlos Soriano.' +
            '\n\n' +
            'All these came into existence when Nautilus and Gnome decided ' +
            'to drop showing a "Desktop" with Icons!' +
            '\n\n' +
            'Many thanks to the original developers of Desktop Icons NG, ' +
            'specially Sergio Costas for his work on ' +
            'Meta.WaylandClient that makes this privileged window possible in' +
            'the first place and to Florian Müllner for implementing ' +
            'Meta.Windotype.DESKTOP through Meta.WaylandClient, which makes ' +
            'this so much easier!'
        );

        aboutDialog.add_credit_section(
            'Originally developed by',
            [
                'Sergio Costas',
                'Carlos Soriano',
            ]
        );

        aboutDialog.add_acknowledgement_section(
            'For coding Meta.WaylandClient in mutter',
            ['Sergio Costas']
        );

        aboutDialog.add_acknowledgement_section(
            'Enabling Meta.Windowtype.DESKTOP\nthrough Meta.Waylandclient',
            ['Florian Müllner']
        );

        aboutDialog.add_acknowledgement_section(
            'Async code contribution',
            ['Marco Trevisan']
        );

        aboutDialog.add_acknowledgement_section(
            'Gnome Extensions Matrix Channel support',
            [
                'Andy Holmes',
                'Just Perfection',
                'And Others..',
            ]
        );

        aboutDialog.add_acknowledgement_section(
            'GJS Maintainers for GJS\n@ptomato for answering',
            ['@ptomato']
        );

        aboutDialog.set_license_type(Gtk.License.GPL_3_0);

        aboutDialog.set_issue_url(
            'https://gitlab.com/smedius/desktop-icons-ng/-/issues'
        );

        aboutDialog.set_support_url(
            'https://gitlab.com/smedius/desktop-icons-ng/-/blob/main/ISSUES.md?ref_type=heads'
        );

        aboutDialog.set_translator_credits(
            'Weblate Translators, See History.MD on website.'
        );

        aboutDialog.set_version(this.version);
        aboutDialog.set_website('https://gitlab.com/smedius/desktop-icons-ng');

        aboutDialog.add_link(
            _('Help translate in your web browser'),
            'https://hosted.weblate.org/engage/gtk4-desktop-icons-ng'
        );

        aboutDialog.set_release_notes(
            `<p>* Adw version 100.5 for Gnome 45, 46, 47, 48</p>
<ul><li>Set localized default desktop name</li></ul>
<ul><li>Resizable open with dialog</li></ul>
<ul><li>Fix custom icons size</li></ul>
<ul><li>Update to more direct error message</li></ul>
            <p>* Adw version 100.3 for Gnome 45, 46, 47, 48</p>
<ul><li>Draw proper selection rectangle at small sizes</li></ul>
            <p>* Adw version 100.2 for Gnome 45, 46, 47, 48</p>
<ul><li>Remove dependency on xdg-user-dirs</li></ul>
            <p>* Adw version 100.1 for Gnome 45, 46, 47, 48</p>
<p>Minor bug fixes to run on older Adw 1.5, errors on connecting second monitor, fix open terminal shortcut</p>
<p>Yay! Version 100!
Actually version 1.0, started with 0.01, but got tired of writing a 0 before every version.
I believe mostly feature complete, except DBus Activation and packaging as a GJS app.
Change Name to Adw. Desktop Icons :)
</p>
<ul><li> Add a complete shortcut manager with editable local and global shortcuts.</li>
<li> Add Adw.AboutDialog for the application with proper credits and acknowledgements.</li>
<li> Add more actions, to arrange icons directly, that can then have proper keybindings in the shortcut manager.</li>
<li> Redesign the preferences to open the shortcut manger. When opened through gnome extensions settings, shortcut manager is activated over DBus, and only works if the extension/app is enabled. </li>
<li> Add an easily editable boolean constant to gnome shell override so Users wanting to show icons on window picker overview or on thumbnails can choose to do so.</li>
<li> .desktop files on the desktop now show their actions in the right click context menus. All these actions are shown and can be activated if the file is trusted.</li></ul>`
        );
    }
};


const DingPreferencesWindow = class extends DesktopFolderUtils {
    constructor(params) {
        super(params);
        this.iconTheme =
            Gtk.IconTheme.get_for_display(Gdk.Display.get_default());

        this.iconTheme.add_resource_path(`${appPath}/icons`);
    }

    addActionRowSwitch(settings, key, labelText, bindFlags = null) {
        const actionRow = Adw.ActionRow.new();
        const switcher = new Gtk.Switch({active: settings.get_boolean(key)});

        switcher.set_halign(Gtk.Align.END);
        switcher.set_valign(Gtk.Align.CENTER);
        switcher.set_hexpand(false);
        switcher.set_vexpand(false);
        actionRow.set_title(labelText);
        actionRow.add_suffix(switcher);

        if (!bindFlags)
            bindFlags = Gio.SettingsBindFlags.DEFAULT;

        settings.bind(key, switcher, 'active', bindFlags);
        actionRow.set_activatable_widget(switcher);

        return actionRow;
    }

    addActionRowSelector(settings, key, labelText, elements) {
        const actionRow = new ComboRowWithKey();

        actionRow.set_title(labelText);
        actionRow.set_use_subtitle(false);
        actionRow.makeEnumn(elements);
        actionRow.set_selected(settings.get_enum(key));

        settings.bind(key, actionRow, 'indexkey',
            Gio.SettingsBindFlags.DEFAULT);

        return actionRow;
    }

    addActionRowButton(title, subtitle, buttonLabel, action, key = null) {
        const actionRow = Adw.ActionRow.new();

        actionRow.set_title(title);

        if (subtitle) {
            actionRow.use_markup = false;
            actionRow.set_subtitle(subtitle);
            if (Adw.get_minor_version() > 2)
                actionRow.set_subtitle_selectable(true);
        }

        if (buttonLabel && action) {
            const button = Gtk.Button.new_with_label(buttonLabel);

            button.set_size_request(120, -1);
            button.set_halign(Gtk.Align.END);
            button.set_valign(Gtk.Align.CENTER);
            button.set_hexpand(true);
            button.set_vexpand(false);
            button.connect('clicked', action.bind(this, actionRow, button, key));

            actionRow.add_suffix(button);
            actionRow.set_activatable_widget(button);
        }

        return actionRow;
    }

    launchUri(uri) {
        const context = Gdk.Display.get_default().get_app_launch_context();
        context.set_timestamp(Gdk.CURRENT_TIME);

        Gio.AppInfo.launch_default_for_uri(uri, context);
    }
};

const AdwPreferencesWindow = class extends DingPreferencesWindow {
    constructor(
        desktopSettings,
        nautilusSettings,
        gtkSettings,
        version,
        actiongroup = null
    ) {
        super();
        this.desktopSettings = desktopSettings;
        this.nautilusSettings = nautilusSettings;
        this.gtkSettings = gtkSettings;

        if (!actiongroup)
            this.getRemoteActions();
        else
            this.remoteActions = actiongroup;

        this.version = version;
    }

    destroy() {
        if (this.watchNameID)
            Gio.DBus.unwatch_name(this.watchNameID);

        this.watchNameID = 0;
    }

    getRemoteActions() {
        this.watchNameID = Gio.DBus.watch_name(
            Gio.BusType.SESSION,
            appID,
            Gio.BusNameWatcherFlags.NONE,
            (_conn, _name, _nameOwner) => {
                try {
                    this.remoteActions = Gio.DBusActionGroup.get(
                        Gio.DBus.session,
                        appID,
                        appPath
                    );
                    this.shortcutGroup?.update(this.remoteActions);
                } catch (e) {
                    logError(e, 'Error getting action group');
                }
            },
            (_conn, _name) => {
                this.remoteActions = null;
                this.shortcutGroup?.update(this.remoteActions);
            }
        );
    }

    getAdwPreferencesWindow(window = null) {
        var prefsWindow;

        if (window) {
            prefsWindow = window;
        } else {
            prefsWindow = new Adw.PreferencesWindow();
            const app = Gtk.Application.get_default();

            if (app)
                prefsWindow.set_application(app);
        }
        prefsWindow.set_can_navigate_back(true);
        prefsWindow.set_search_enabled(true);

        this.prefsWindow = prefsWindow;
        this.activeWindow = prefsWindow;

        const prefsFrame = new Adw.PreferencesPage();

        prefsFrame.set_name(_('Desktop'));
        prefsFrame.set_title(_('Desktop'));
        prefsFrame.set_icon_name('prefs-desktop-symbolic');

        const filesPrefsFrame = new Adw.PreferencesPage();

        filesPrefsFrame.set_name(_('Files'));
        filesPrefsFrame.set_title(_('Files'));
        filesPrefsFrame.set_icon_name('prefs-files-symbolic');

        const tweaksFrame = new Adw.PreferencesPage();

        tweaksFrame.set_name(_('Tweaks'));
        tweaksFrame.set_title(_('Tweaks'));
        tweaksFrame.set_icon_name('prefs-tweaks-symbolic');

        const aboutFrame = new Adw.PreferencesPage();

        aboutFrame.set_name(_('More'));
        aboutFrame.set_title(_('More'));
        aboutFrame.set_icon_name('prefs-more-symbolic');

        prefsWindow.add(prefsFrame);
        prefsWindow.add(filesPrefsFrame);
        prefsWindow.add(tweaksFrame);
        prefsWindow.add(aboutFrame);
        prefsWindow.set_visible(prefsFrame);

        const desktopGroup = new Adw.PreferencesGroup();

        desktopGroup.set_title(_('Desktop Settings'));
        desktopGroup.set_description(_('Settings for the Desktop Program'));

        prefsFrame.add(desktopGroup);

        this.desktopFolderGroup = new Adw.PreferencesGroup();

        this.desktopFolderGroup.set_title(_('Desktop Folder'));
        this.FolderGroupDescription = _('Current Desktop: ');
        const desktoPath = this.getDesktopDir().get_path();
        this.desktopFolderGroup.set_description(
            `${this.FolderGroupDescription} ${desktoPath}`
        );

        prefsFrame.add(this.desktopFolderGroup);

        const filesGroup = new Adw.PreferencesGroup();

        filesGroup.set_title(_('Files Settings'));
        filesGroup.set_description(_('Settings shared with Gnome Files'));

        filesPrefsFrame.add(filesGroup);

        const tweaksGroup = new Adw.PreferencesGroup();

        tweaksGroup.set_title(_('Tweaks'));
        tweaksGroup.set_description(_('Miscellaneous Tweaks'));
        tweaksFrame.add(tweaksGroup);

        this.shortcutGroup =
            new ShortcutGroup({remoteActions: this.remoteActions});

        aboutFrame.add(this.shortcutGroup);

        const aboutGroup = new Adw.PreferencesGroup();

        aboutGroup.set_title('About Adw. Desktop Icons');
        let versiontitle = _(`Version ${this.version}`);
        aboutGroup.set_description(versiontitle);

        aboutFrame.add(aboutGroup);

        desktopGroup.add(this.addActionRowSelector(this.desktopSettings,
            'icon-size',
            _('Size for the desktop icons'),
            {
                'tiny': _('Tiny'),
                'small': _('Small'),
                'standard': _('Standard'),
                'large': _('Large'),
            }
        ));

        desktopGroup.add(this.addActionRowSelector(this.desktopSettings,
            'start-corner',
            _('New icons alignment'),
            {
                'top-left': _('Top left corner'),
                'top-right': _('Top right corner'),
                'bottom-left': _('Bottom left corner'),
                'bottom-right': _('Bottom right corner'),
            }
        ));

        desktopGroup.add(this.addActionRowSwitch(this.desktopSettings,
            'show-second-monitor',
            _('Add new icons to Secondary Monitors first, if available')));

        desktopGroup.add(this.addActionRowSwitch(this.desktopSettings,
            'free-position-icons',
            _('Snap icons to grid'),
            Gio.SettingsBindFlags.INVERT_BOOLEAN
        ));

        const dropPlaceRow = this.addActionRowSwitch(this.desktopSettings,
            'show-drop-place',
            _('Highlight the drop grid'));

        this.desktopSettings.bind('free-position-icons', dropPlaceRow,
            'sensitive',
            Gio.SettingsBindFlags.INVERT_BOOLEAN);

        desktopGroup.add(dropPlaceRow);

        this.desktopFolderGroup
            .add(this.addActionRowButton(_('New Desktop Folder'),
                _('Set a new folder for the desktop'),
                _('Choose'),
                this.changeDesktop.bind(this)
            ));

        const defaultDesktopPath = this.getSystemLocalizedDesktopDir();
        const secondarytext = _('Set Desktop back to ~/');
        this.defaultDesktopRow =
            this.addActionRowButton(_('Restore Default Desktop Folder'),
                `${secondarytext}${defaultDesktopPath}`,
                _('Restore'),
                this.restoreDefaultDesktop.bind(this)
            );

        this.desktopFolderGroup.add(this.defaultDesktopRow);
        this.defaultDesktopRow.set_sensitive(!this.isDefaultDesktop);


        tweaksGroup.add(this.addActionRowSwitch(this.desktopSettings,
            'show-link-emblem',
            _('Add information emblems for links, encryption')));

        tweaksGroup.add(this.addActionRowSwitch(this.desktopSettings,
            'dark-text-in-labels',
            _('Use dark text in icon labels')
        ));

        tweaksGroup.add(this.addActionRowSwitch(this.desktopSettings,
            'show-home',
            _('Show the personal folder on the desktop')
        ));

        tweaksGroup.add(this.addActionRowSwitch(this.desktopSettings,
            'show-trash',
            _('Show the trash icon on the desktop')
        ));

        tweaksGroup.add(this.addActionRowSwitch(this.desktopSettings,
            'show-volumes',
            _('Show external drives on the desktop')
        ));

        tweaksGroup.add(this.addActionRowSwitch(this.desktopSettings,
            'show-network-volumes',
            _('Show network drives on the desktop')
        ));

        tweaksGroup.add(this.addActionRowSwitch(this.desktopSettings,
            'add-volumes-opposite',
            _('Add new drives to the opposite side of the desktop')
        ));

        filesGroup.add(this.addActionRowSelector(this.nautilusSettings,
            'click-policy',
            _('Action to Open Items'),
            {
                'single': _('Single click'),
                'double': _('Double click'),
            }));

        filesGroup.add(this.addActionRowSelector(this.nautilusSettings,
            'show-image-thumbnails',
            _('Show image thumbnails'),
            {
                'always': _('Always'),
                'local-only': _('On this computer only'),
                'never': _('Never'),
            }));

        filesGroup.add(this.addActionRowSwitch(this.nautilusSettings,
            'show-delete-permanently',
            _('Show a context menu item to delete permanently')
        ));

        filesGroup.add(this.addActionRowSwitch(this.gtkSettings,
            'show-hidden',
            _('Show hidden files')
        ));

        filesGroup.add(this.addActionRowSwitch(this.nautilusSettings,
            'open-folder-on-dnd-hover',
            _('Open folders on drag hover')
        ));

        const aboutButton = new Adw.ActionRow();
        aboutButton.set_title(_('About...'));
        const icon = Gtk.Image.new_from_icon_name('window-pop-out-symbolic');
        aboutButton.add_suffix(icon);
        aboutButton.set_activatable_widget(icon);

        aboutButton.connect('activated', () => {
            const aboutDialog = new aboutApp({version: this.version});
            aboutDialog.present(prefsWindow);
        });

        aboutGroup.add(aboutButton);

        const tranlationGroup = new Adw.PreferencesGroup({
            title: _('Translations'),
            description: _('All tranlations on Weblate..'),
        });

        aboutFrame.add(tranlationGroup);

        tranlationGroup.add(this.addActionRowButton(_('Translations'),
            _('Help translate in your web browser'),
            _('Translate'),
            this.launchWebTranslation.bind(this)
        ));

        prefsWindow.set_default_size(600, 650);

        this._monitorDesktopDirChanges();

        prefsWindow.connect(
            'close-request',
            () => {
                this._stopMonitoring();
                this.activeWindow = null;
            }
        );

        if (!window)
            return prefsWindow;
        else
            return true;
    }

    onDesktopFolderChanged(newDesktopDir) {
        super.onDesktopFolderChanged(newDesktopDir);
        const desktopPath = this._desktopDir.get_path();
        this.desktopFolderGroup.set_description(
            `${this.FolderGroupDescription} ${desktopPath}`
        );

        this.defaultDesktopRow.set_sensitive(!this.isDefaultDesktop);
    }

    launchWebTranslation() {
        const translationUri =
        'https://hosted.weblate.org/engage/gtk4-desktop-icons-ng';
        this.launchUri(translationUri);
    }
};

