/* DING: Desktop Icons New Generation for GNOME Shell
 *
 * Gtk4 Port Copyright (C) 2022, 2025 Sundeep Mediratta (smedius@gmail.com)
 * Copyright (C) 2019 Sergio Costas (rastersoft@gmail.com)
 * Based on code original (C) Carlos Soriano
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import {Adw, GLib, Gtk, Gio, Gdk} from '../dependencies/gi.js';
import {_} from '../dependencies/gettext.js';

export {Preferences};

const GioSSS = Gio.SettingsSchemaSource;

const Preferences = class {
    constructor(Data, AdwPreferencesWindow) {
        this._extensionPath = Data.extensionPath;
        this._programVersion = Data.programversion;
        this._mainApp = Data.mainApp;
        this._Enums = Data.Enums;
        let schemaSource = GioSSS.get_default();
        this._desktopManager = null;

        // Adw Style Manager
        this._adwStyleManager =
            Adw.StyleManager.get_default();

        try {
            if (this._adwStyleManager.get_system_supports_accent_colors()) {
                console.log('System supports accent colors');
                this.accentColorsAvailable = true;
            }
        } catch (e) {
            console.log('System does not support accent colors');
            this.accentColorsAvailable = false;
        }

        // Gtk
        const schemaGtk = schemaSource.lookup(this._Enums.SCHEMA_GTK, true);
        this.gtkSettings = new Gio.Settings({settings_schema: schemaGtk});

        // Gnome Files
        const schemaObj =
            schemaSource.lookup(this._Enums.SCHEMA_NAUTILUS, true);

        if (!schemaObj) {
            this.nautilusSettings = null;
            this.CLICK_POLICY_SINGLE = false;
            this.openFolderOnDndHover = false;
        } else {
            this.nautilusSettings =
                new Gio.Settings({settings_schema: schemaObj});
        }

        this._gnomeFilesAppInfo =
            Gio.DesktopAppInfo.new('org.gnome.Nautilus.desktop');


        // Compression
        const compressionSchema =
            schemaSource.lookup(this._Enums.SCHEMA_NAUTILUS_COMPRESSION, true);

        if (!compressionSchema) {
            this.nautilusCompression = null;
        } else {
            this.nautilusCompression =
                new Gio.Settings({settings_schema: compressionSchema});
        }

        // Mutter Settings
        this.usingX11 =
            Gdk.Display.get_default()
            .constructor
            .$gtype.name === 'GdkX11Display';

        const schemaMutter =
            schemaSource.lookup(this._Enums.SCHEMA_MUTTER, true);

        if (schemaMutter) {
            this.mutterSettings =
                new Gio.Settings({settings_schema: schemaMutter});
        }

        // Depreciated Gnome Default Terminal Settings
        const schemaTerminalSettings =
            schemaSource.lookup(this._Enums.TERMINAL_SCHEMA, true);

        if (schemaTerminalSettings) {
            this.schemaTerminalSettings =
                new Gio.Settings({settings_schema: schemaTerminalSettings});
        } else {
            this.schemaTerminalSettings = null;
        }

        // Our Settings
        this.desktopSettings = this._get_schema(this._Enums.SCHEMA);

        this._cacheInitialSettings();

        // Gnome Theme settings for fallback for older
        // Adw and Gnome versions accent colors
        const schemaGnomeSettings =
            schemaSource.lookup(this._Enums.SCHEMA_GNOME_SETTINGS, true);

        if (schemaGnomeSettings) {
            this.schemaGnomeThemeSettings =
                new Gio.Settings({settings_schema: schemaGnomeSettings});
        }

        this._adwPreferencesWindow =
            new AdwPreferencesWindow.AdwPreferencesWindow(
                this.desktopSettings,
                this.nautilusSettings,
                this.gtkSettings,
                this._programVersion,
                this._mainApp
            );
    }

    _get_schema(schema) {
        // check if this extension was built with "make zip-file", and thus
        // has the schema files in a subfolder
        // otherwise assume that extension has been installed in the
        // same prefix as gnome-shell (and therefore schemas are available
        // in the standard folders)
        let schemaSource;

        const schemaFile =
            Gio.File.new_for_path(
                GLib.build_filenamev(
                    [this._extensionPath, 'schemas', 'gschemas.compiled']
                )
            );

        if (schemaFile.query_exists(null)) {
            schemaSource =
                GioSSS.new_from_directory(
                    GLib.build_filenamev([this._extensionPath, 'schemas']),
                    GioSSS.get_default(),
                    false
                );
        } else {
            schemaSource = GioSSS.get_default();
        }


        let schemaObj = schemaSource.lookup(schema, true);
        if (!schemaObj) {
            console.log('schemaObj does not exist!');
            console.log('Current extension path:', this._extensionPath);
            console.log('Current schemaFile:', schemaFile.get_path());
            console.log('Schema File exists:', schemaFile.query_exists(null));

            throw new Error(
                `Schema ${schema} could not be found for extension.` +
                ' Please check your installation.'
            );
        }

        return new Gio.Settings({settings_schema: schemaObj});
    }

    _cacheInitialSettings() {
        this._updateIconSize();

        this._StartCorner =
            this._Enums.START_CORNER[
                this.desktopSettings.get_string('start-corner')
            ];

        this._UnstackList = this.desktopSettings.get_strv('unstackedtypes');

        this.sortOrder =
            this.desktopSettings.get_enum(this._Enums.SortOrder.ORDER);

        this.addVolumesOpposite =
            this.desktopSettings.get_boolean('add-volumes-opposite');

        this.showHidden = this.gtkSettings.get_boolean('show-hidden');

        this._showDropPlace =
            this.desktopSettings.get_boolean('show-drop-place');

        this.showLinkEmblem =
            this.desktopSettings.get_boolean('show-link-emblem');

        this.darkText = this.desktopSettings.get_boolean('dark-text-in-labels');
        this.keepStacked = this.desktopSettings.get_boolean('keep-stacked');
        this.keepArranged = this.desktopSettings.get_boolean('keep-arranged');

        this.sortSpecialFolders =
            this.desktopSettings.get_boolean('sort-special-folders');

        this.showOnSecondaryMonitor =
            this.desktopSettings.get_boolean('show-second-monitor');

        this.freePositionIcons =
            this.desktopSettings.get_boolean('free-position-icons');

        this.CLICK_POLICY_SINGLE =
            this.nautilusSettings.get_string('click-policy') === 'single';

        this.openFolderOnDndHover =
            this.nautilusSettings.get_boolean('open-folder-on-dnd-hover');

        this.showImageThumbnails =
            this.nautilusSettings
            .get_string('show-image-thumbnails') !== 'never';

        this.darkmode = this._adwStyleManager.get_dark();
        this._premultiplied = this._getPreMultiplied();
    }

    getAdwPreferencesWindow() {
        this.AdwPreferencesWindow =
            this._adwPreferencesWindow.getAdwPreferencesWindow();

        return this.AdwPreferencesWindow;
    }

    // Updaters
    _updateIconSize() {
        let iconSize = this.desktopSettings.get_string('icon-size');
        this.IconSize = this._Enums.ICON_SIZE[iconSize];
        this.DesiredWidth = this._Enums.ICON_WIDTH[iconSize];
        this.DesiredHeight = this._Enums.ICON_HEIGHT[iconSize];
    }

    // Monitoring
    init(desktopManager) {
        this._desktopManager = desktopManager;
        this._desktopIconsUtil = desktopManager.DesktopIconsUtil;
        this._configureSelectionColor();
        this._configureHoverColor();
        this._setCSSColors();
        this._initLocalCSSprovider();
        this._monitorDesktopSettings();
        this._monitorTerminalSettings();
    }

    _monitorDesktopSettings() {
        if (!this._desktopManager)
            return;

        // Desktop Settings
        this.desktopSettings.connect('changed', (obj, key) => {
            if (key === 'dark-text-in-labels')  {
                this.darkText =
                    this.desktopSettings.get_boolean('dark-text-in-labels');

                this._desktopManager.redrawDesktop()
                .catch(e => {
                    console.log(
                        'Exception while updating desktop after "Dark Text"' +
                        ` changed: ${e.message}\n${e.stack}`
                    );
                });

                return;
            }

            if (key === 'show-link-emblem') {
                this.showLinkEmblem =
                    this.desktopSettings.get_boolean('show-link-emblem');

                this._desktopManager.redrawDesktop()
                .catch(e => {
                    console.log(
                        'Exception while updating desktop after ' +
                        `"Show Emblems" changed: ${e.message}\n${e.stack}`
                    );
                });

                return;
            }

            if (key === 'sort-special-folders') {
                this.sortSpecialFolders =
                    this.desktopSettings.get_boolean('sort-special-folders');

                return;
            }

            if (key === 'add-volumes-opposite') {
                this.addVolumesOpposite =
                    this.desktopSettings.get_boolean('add-volumes-opposite');

                return;
            }

            if (key === 'show-second-monitor') {
                this.showOnSecondaryMonitor =
                    this.desktopSettings.get_boolean('show-second-monitor');

                // The initialRead parameter insures tha grid positions are
                // recalculated and remapped to new monitors. Recaculated
                //  postions of all fileItems will be re-written to disk with
                // write mode 'OVERWRITE'
                if (this.showOnSecondaryMonitor) {
                    this._desktopManager.refreshDesktop();
                } else {
                    const mainApp = this._desktopManager.mainApp;
                    mainApp.lookup_action('cleanUpIcons').activate(null);
                }

                return;
            }

            if (key === 'icon-size') {
                this._updateIconSize();
                this._desktopManager.onIconSizeChanged();

                return;
            }

            if (key === this._Enums.SortOrder.ORDER) {
                this.sortOrder =
                    this.desktopSettings.get_enum(this._Enums.SortOrder.ORDER);

                const value =
                    GLib.Variant.new_string(
                        this.desktopSettings
                        .get_string(this._Enums.SortOrder.ORDER)
                    );

                const mainApp = this._desktopManager.mainApp;
                mainApp.activate_action('arrangeaction', value);

                return;
            }

            if (key === 'unstackedtypes') {
                this._UnstackList =
                    this.desktopSettings.get_strv('unstackedtypes');

                this._desktopManager.onUnstackedTypesChanged();

                return;
            }

            if (key === 'keep-stacked') {
                this.keepStacked =
                    this.desktopSettings.get_boolean('keep-stacked');

                this._desktopManager.onkeepStackedChanged();

                return;
            }

            if (key === 'keep-arranged') {
                this.keepArranged =
                    this.desktopSettings.get_boolean('keep-arranged');

                this._desktopManager.onKeepArrangedChanged();

                return;
            }

            if (key === 'show-drop-place') {
                this._showDropPlace =
                    this.desktopSettings.get_boolean('show-drop-place');

                return;
            }

            if (key === 'start-corner') {
                this._StartCorner =
                    this._Enums.START_CORNER[
                        this.desktopSettings.get_string('start-corner')
                    ];

                return;
            }

            if (key === 'free-position-icons') {
                this.freePositionIcons =
                    this.desktopSettings.get_boolean('free-position-icons');
            }

            // fallthrough
            this._desktopManager.reLoadDesktop()
            .catch(e => {
                console.log('Exception while updating Desktop after the' +
                    ` settings changed: ${e.message}\n${e.stack}`
                );
            });
        });

        // Gtk Settings
        this.gtkSettings.connect('changed', (obj, key) => {
            if (key === 'show-hidden') {
                this.showHidden = this.gtkSettings.get_boolean('show-hidden');

                this._desktopManager.onGtkSettingsChanged()
                .catch(e => {
                    console.log('Exception while updating desktop after' +
                        ` "Show Hidden" changed: ${e.message}\n${e.stack}`
                    );
                });
            }
        });

        // Gnome Files Settings
        this.nautilusSettings.connect('changed', (obj, key) => {
            if (key === 'show-image-thumbnails') {
                this.showImageThumbnails =
                    this.nautilusSettings
                    .get_string('show-image-thumbnails') !== 'never';

                this._desktopManager.redrawDesktop()
                .catch(e => {
                    console.log('Exception while updating Desktop after the' +
                       ` GNOME Files settings changed: ${e.message}\n${e.stack}`
                    );
                });

                return;
            }

            if (key === 'click-policy') {
                this.CLICK_POLICY_SINGLE =
                    this.nautilusSettings
                    .get_string('click-policy') === 'single';
            }

            if (key === 'open-folder-on-dnd-hover') {
                this.openFolderOnDndHover =
                    this.nautilusSettings
                    .get_boolean('open-folder-on-dnd-hover');
            }
        });

        // Icon Theme Changes
        this._gtkIconTheme =
            Gtk.IconTheme.get_for_display(Gdk.Display.get_default());

        this._gtkIconTheme.connect('changed', () => {
            this._refreshDesktopAndColors();
        });

        // Gtk Theme Changes
        this._gtkSettings =
            Gtk.Settings.get_for_display(Gdk.Display.get_default());

        this._gtkSettings.connect('notify::gtk-theme-name', () => {
            this._refreshDesktopAndColors();
        });

        // Callback to handle accent color changes
        this._adwStyleManager.connect('notify::accent-color', () => {
            this._refreshBackgroundColor();
        });

        // Callback to handle theme (color scheme) changes
        this._adwStyleManager.connect('notify::dark', () => {
            this.darkmode = this._adwStyleManager.get_dark();
            this._refreshBackgroundColor();
        });

        // Terminal settings Changes
        this.schemaTerminalSettings?.connect('changed', () => {
            this._updateTerminalSettings()
            .catch(e => logError(e));
        });

        // Mutter settings
        this.mutterSettings.connect('changed', () => {
            this._premultiplied = this._getPreMultiplied();
            this._desktopManager.onMutterSettingsChanged();
        });

        if (this.accentColorsAvailable)
            return;

        // Gnome Theme Settings monitoring for older gnome and Adw versions
        this.schemaGnomeThemeSettings?.connect('changed', (obj, key) => {
            if (key === 'accent-color') {
                // Color changes do not seem to be applied immediately, wait..
                if (this.cssColorDefinitionChangeID)
                    GLib.source_remove(this.cssColorDefinitionChangeID);

                this.cssColorDefinitionChangeID =
                    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
                        this._refreshDesktopAndColors();
                        this.cssColorDefinitionChangeID = 0;

                        return GLib.SOURCE_REMOVE;
                    });
            }
        });
    }

    _configureHoverColor() {
        const box = new Gtk.Label();
        const styleContext = box.get_style_context();
        styleContext.add_class('view');
        const [exists, color] = styleContext.lookup_color('accent_fg_color');
        if (exists) {
            this.hoverColor = color;
        } else {
            this.hoverColor =  new Gdk.RGBA({
                red: 0.9,
                green: 0.9,
                blue: 0.9,
                alpha: 1.0,
            });
        }
    }

    _configureSelectionColor() {
        try {
            if (this.accentColorsAvailable) {
                this.selectColor =
                    this._adwStyleManager.get_accent_color_rgba();
            } else {
                const box = new Gtk.Label();
                const styleContext = box.get_style_context();
                styleContext.add_class('view');

                const [exists, color] =
                    styleContext.lookup_color('accent_bg_color');

                if (exists) {
                    this.selectColor = color;
                } else {
                    throw new Error(
                        'Style Context does not provide accent_bg_color'
                    );
                }
            }
        } catch (e) {
            console.log(e.message);
            console.log('Setting default accent color to blue');
            this.selectColor =  new Gdk.RGBA({
                red: 0,
                green: 0,
                blue: 0.9,
                alpha: 1.0,
            });
        }
    }

    _setCSSColors() {
        const cssColorDefinition =
        `@define-color desktop_icons_fg_color ${this.hoverColor.to_string()};
        @define-color desktop_icons_bg_color ${this.selectColor.to_string()};`;

        this._cssColorProviderSelection = new Gtk.CssProvider();

        // fix for api change Gtk 4.9
        try {
            this._cssColorProviderSelection.load_from_data(cssColorDefinition);
        } catch (e) {
            const gsizeLength = -1; // NULL terminated string
            this._cssColorProviderSelection.load_from_data(
                cssColorDefinition,
                gsizeLength
            );
        }

        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default(),
            this._cssColorProviderSelection,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        );
    }

    _refreshColors() {
        Gtk.StyleContext.remove_provider_for_display(
            Gdk.Display.get_default(),
            this._cssColorProviderSelection);

        this._configureSelectionColor();
        this._configureHoverColor();
        this._setCSSColors();
    }

    _refreshBackgroundColor() {
        Gtk.StyleContext.remove_provider_for_display(
            Gdk.Display.get_default(),
            this._cssColorProviderSelection);

        this._configureSelectionColor();
        this._setCSSColors();
    }

    _refreshDesktopAndColors() {
        this._refreshColors();

        this._desktopManager.redrawDesktop()
        .catch(e => {
            console.log(
                'Exception while updating desktop after an GTK icon-theme' +
                ` change: ${e.message}\n${e.stack}`
            );
        });
    }

    _initLocalCSSprovider() {
        const cssProvider = new Gtk.CssProvider();
        const resourcePath = this._mainApp.get_resource_base_path();

        cssProvider.load_from_resource(`${resourcePath}/stylesheet.css`);

        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default(),
            cssProvider,
            Gtk.STYLE_PROVIDER_PRIORITY_USER
        );
    }

    _setupTerminalMonitors() {
        this._xdgTerminalMonitors = [];
        const systemFiles = this._xdgSystemConf.concat(this._xdgSystemData);
        const userFiles = [this._xdgUserConf, this._xdgUserData];
        const filesToMonitor = userFiles.concat(systemFiles);

        filesToMonitor.forEach(f => {
            const fileMonitor =
                f.monitor(
                    Gio.FileMonitorFlags.WATCH_MOVES,
                    null
                );

            fileMonitor.set_rate_limit(1000);

            fileMonitor.connect('changed', () => {
                this._updateTerminalSettings()
                .catch(e => {
                    console.log(
                        'Exception while updating entries in System Terminal' +
                        ` monitor: ${e.message}\n${e.stack}`
                    );
                });
            });

            this._xdgTerminalMonitors.push(fileMonitor);
        });
    }

    _monitorTerminalSettings() {
        this._xdgUserConf = this._desktopIconsUtil.getUserTerminalConfFile();

        this._xdgSystemConf =
            this._desktopIconsUtil.getSystemTerminalConfFile();

        this._xdgUserData = this._desktopIconsUtil.getUserDataTerminalDir();

        this._xdgSystemData =
            this._desktopIconsUtil.getSystemDataTerminalDirs();

        this._setupTerminalMonitors();

        this._updateTerminalSettings().catch(e => logError(e));
    }

    _updateTerminalDconfSettings() {
        let defaultTerminal = null;

        if (this.schemaTerminalSettings) {
            defaultTerminal =
                this.schemaTerminalSettings
                .get_string(this._Enums.DCONF_TERMINAL_EXEC_KEY);
        }

        let terminal;
        let terminalappinfo;

        switch (defaultTerminal) {
        case 'gnome-terminal':
            terminal = 'org.gnome.Terminal.desktop';
            terminalappinfo = Gio.DesktopAppInfo.new(terminal);
            if (!terminalappinfo) {
                terminal = 'org.gnome.Ptyxis.desktop';
                terminalappinfo = Gio.DesktopAppInfo.new(terminal);
            }

            break;
        case 'gnome-console':
        default:
            terminal = 'org.gnome.Console.desktop';
            terminalappinfo = Gio.DesktopAppInfo.new(terminal);
        }

        return  terminalappinfo ? [terminalappinfo] : [];
    }

    async _updateTerminalXdgConf() {
        let userfileList = [];
        let systemfileList = [];

        if (this._xdgUserConf.query_exists(null)) {
            let userfilecontents;

            try {
                userfilecontents =
                    await this._desktopIconsUtil
                    .readFileContentsAsync(
                        this._xdgUserConf
                    )
                    .catch(e => console.error(e));

                if (userfilecontents) {
                    userfileList =
                        this._desktopIconsUtil
                        .parseTerminalList(userfilecontents);
                }
            } catch (e) {
                console.error(e);
            }
        }

        for (let f of this._xdgSystemConf) {
            if (f.query_exists(null)) {
                const systemFileContent =
                    // eslint-disable-next-line no-await-in-loop
                    await this._desktopIconsUtil.readFileContentsAsync(f);

                const x =
                    this._desktopIconsUtil.parseTerminalList(systemFileContent);

                systemfileList = systemfileList.concat(x);
            }
        }

        return userfileList.concat(systemfileList);
    }

    async _updateTerminalXdgData() {
        let xdgDataFiles = [];
        let scanFolders = [];

        scanFolders = [this._xdgUserData, ...this._xdgSystemData];

        for (let f of scanFolders) {
            if (f.query_exists(null)) {
                const iter =
                    // eslint-disable-next-line no-await-in-loop
                    await f.enumerate_children_async(
                        'standard::*',
                        Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
                        GLib.PRIORITY_DEFAULT,
                        null
                    );

                // eslint-disable-next-line no-await-in-loop
                for await (const fileInfo of iter) {
                    const fileName = fileInfo.get_name();

                    if (!fileName.endsWith('.desktop'))
                        continue;

                    const fpath =
                        GLib.build_filenamev([f.get_path(), fileName]);

                    const appinfo =
                        Gio.DesktopAppInfo.new_from_filename(fpath);

                    if (appinfo)
                        xdgDataFiles.push(appinfo);
                }
            }
        }

        return xdgDataFiles;
    }

    async _updateTerminalSettings() {
        this._terminalGioDesktopAppInfoList = [];

        const a =
            await this._updateTerminalXdgConf()
            .catch(e => console.error(e));

        const b =
            await this._updateTerminalXdgData()
            .catch(e => console.error(e));

        const c = this._updateTerminalDconfSettings();

        this._terminalGioDesktopAppInfoList = a.concat(b.concat(c));

        if (!this._terminalGioDesktopAppInfoList.length)
            return;

        this._terminal = this._terminalGioDesktopAppInfoList[0];

        this._terminalExecString =
            this._terminal
            ?.get_string(this._Enums.DESKTOPFILE_TERMINAL_EXEC_SWITCH);

        if (!this._terminalExecString)
            this._terminalExecString = '-e';
    }

    _getPreMultiplied() {
        if (this.usingX11)
            return false;

        const scalingEnabled = 'scale-monitor-framebuffer';

        try {
            return this.mutterSettings
                .get_strv('experimental-features')
                .includes(scalingEnabled);
        } catch (e) {}

        return false;
    }

    _setPreMultiplied(premultiplied) {
        if (this.usingX11)
            return;

        const scalingEnabled = 'scale-monitor-framebuffer';

        try {
            const featurearray =
                this.mutterSettings.get_strv('experimental-features');

            if (premultiplied && !featurearray.includes(scalingEnabled))
                featurearray.push(scalingEnabled);

            if (!premultiplied && featurearray.includes(scalingEnabled)) {
                const index = featurearray.indexOf(scalingEnabled);
                featurearray.splice(index, 1);
            }

            this.mutterSettings.set_strv('experimental-features', featurearray);
        } catch (e) {
            console.log('Error setting premultiplied:', e);
        }
    }

    // Setters
    /**
     * @param {any} order
     */
    set SortOrder(order) {
        this._sortOrder = order;
        this.desktopSettings.set_enum(this._Enums.SortOrder.ORDER, order);
    }

    set UnstackList(array) {
        this._UnstackList = array;
        this.desktopSettings.set_strv('unstackedtypes', array);
    }

    set fractionalScaling(boolean) {
        this._setPreMultiplied(boolean);
    }

    // Getters
    get StartCorner() {
        // Return a shallow copy that can be mutated without affecting other
        //  icons with cornerinversion in DesktopGrid
        return [...this._StartCorner];
    }

    get UnstackList() {
        // Return a shallow copy that can be mutated without
        // affecting the original
        return [...this._UnstackList];
    }

    get Terminal() {
        return this._terminal ?? null;
    }

    get TerminalGioList() {
        return this._terminalGioDesktopAppInfoList;
    }

    get TerminalExecString() {
        return this._terminalExecString;
    }

    get TerminalName() {
        if (this._terminal)
            return this._terminal.get_locale_string('Name');
        else
            return _('Console');
    }

    get NautilusName() {
        return this._gnomeFilesAppInfo.get_locale_string('Name');
    }

    get showDropPlace() {
        return this._showDropPlace && !this.freePositionIcons;
    }

    get fractionalScaling() {
        if (this.usingX11)
            return false;
        return this._premultiplied;
    }
};
