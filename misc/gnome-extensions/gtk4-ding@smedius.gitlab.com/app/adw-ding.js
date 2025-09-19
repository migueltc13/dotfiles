#!/usr/bin/env -S gjs -m

/* ADW-DING: Desktop Icons New Generation for GNOME Shell
 *
 * Copyright (C) 2025 Sundeep Mediratta
 * Based on code original (C) Carlos Soriano (C) Sergio Costas
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

import {Gio, GLib, Adw, GObject} from '../dependencies/gi.js';
import * as Gettext from 'gettext';
import {
    Preferences,
    AdwPreferencesWindow,
    Enums,
    DBusUtils,
    DesktopIconsUtil,
    DesktopManager,
    Thumbnails
} from '../dependencies/localFiles.js';

import * as FileUtils from '../utils/fileUtils.js';
import * as System from 'system';

Gio._promisify(Gio.AppInfo, 'launch_default_for_uri_async');
Gio._promisify(Gio.FileEnumerator.prototype, 'close_async');
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');
Gio._promisify(Gio.Subprocess.prototype, 'wait_check_async');

const fileProto = imports.system.version >= 17200
    ? Gio.File.prototype : Gio._LocalFilePrototype;

Gio._promisify(fileProto, 'delete_async');
Gio._promisify(fileProto, 'enumerate_children_async');
Gio._promisify(fileProto, 'load_bytes_async');
Gio._promisify(fileProto, 'make_directory_async');
Gio._promisify(fileProto, 'query_info_async');
Gio._promisify(fileProto, 'set_attributes_async');
Gio._promisify(fileProto, 'replace_contents_async');
Gio._promisify(fileProto, 'load_contents_async');

const getTextDomain = 'gtk4-ding';
const appID = 'com.desktop.ding';
const testAppID = `${appID}test`;

const adWDingApp = GObject.registerClass(
    class adwDingApp extends Adw.Application {
        constructor(asDesktop = false) {
            super({
                application_id: asDesktop ? appID : testAppID,
                resource_base_path: `/${appID.split('.').join('/')}`,
                flags:
                    Gio.ApplicationFlags.HANDLES_COMMAND_LINE |
                    Gio.ApplicationFlags.REPLACE,
            });
            this.asDesktop = asDesktop;

            // Connect application signals
            this.connect('startup', this._onStartup.bind(this));
            this.connect('command-line', this._onCommandLine.bind(this));
            this.connect('activate', this._onActivate.bind(this));
            this.connect('shutdown', this._onShutdown.bind(this));
        }

        _onStartup() {
            this.codePath =
                GLib.path_get_dirname(System.programPath);

            this.systemInstall = this.codePath.startsWith('/usr');

            this.extensionDir = GLib.path_get_dirname(this.codePath);

            const localePath = GLib.build_filenamev(
                [this.extensionDir, 'locale']
            );

            if (Gio.File.new_for_path(localePath).query_exists(null))
                Gettext.bindtextdomain(getTextDomain, localePath);

            const resourcePath = GLib.build_filenamev(
                [this.codePath, `${appID}.data.gresource`]);

            const resource = Gio.Resource.load(resourcePath);
            resource._register();

            this._initializeOptions();

            if (!this.systemInstall) {
                console.log('Local install detected, updating icon cache...');
                this._updateIconCache().catch(e => logError(e));
                this._updateAppInfoCache().catch(e => logError(e));
            }
        }

        _onShutdown() {
            if (this.systemInstall)
                return;

            if (this.appIcon)
                this._removeFile(this.appIcon);
            if (this.appDesktopFile)
                this._removeFile(this.appDesktopFile);
        }

        // eslint-disable-next-line consistent-return
        _onCommandLine(app, commandLine) {
            let argv = [];
            argv = commandLine.get_arguments();
            try {
                // Parse options from the main arguments
                this._parseOptions(argv);
                this._initializeDesktopOptions();
            } catch (e) {
                console.log(`Error parsing options: ${e.message}`);
                this.errorFound = true;
            }

            if (!this.errorFound && !this.showHelp) {
                if (commandLine.get_is_remote()) {
                    this.desktops = this.newdesktops;
                    const windowManager = this.desktopManager.windowManager;
                    windowManager.updateGridWindows(this.desktops);
                // If testing Dbus activations, comment the above
                // and uncomment the following -
                // or get remote actions from the app and activate
                // this.desktopVariants = this.newDesktopsVariants;
                // this.remoteDingActions.activate_action('updateGridWindows',
                //    new GLib.Variant('av', this.desktopVariants));
                // OR smiply activate the app action directly
                // app.activate_action(
                //     'updateGridWindows',
                //     new GLib.Variant('av', this.desktopVariants)
                // );
                } else {
                    this._finishStartUp(app);
                    app.activate();
                }
                commandLine.set_exit_status(0);
                return 0;
            }

            if (this.showHelp) {
                this._printUsage();
                commandLine.set_exit_status(0);
                return 0;
            }

            if (this.errorFound) {
                this._printUsage();
                commandLine.set_exit_status(1);
                return 1;
            }
        }

        _finishStartUp(app) {
            this.Data = {
                'codePath': this.codePath,
                'extensionPath': this.extensionDir,
                Enums,
                'gnomeversion': this.gnomeversion,
                'programversion': this.programversion,
                'uuid': this.uuid,
                'mainApp': app,
            };
            this.Utils = {FileUtils};

            this.Utils.DBusUtils =
                new DBusUtils.DBusUtils(app);

            this.Utils.ThumbnailLoader =
                new Thumbnails.ThumbnailLoader(this.Utils.FileUtils);

            this.Utils.Preferences =
                new Preferences.Preferences(this.Data, AdwPreferencesWindow);

            this.Utils.DesktopIconsUtil =
                new DesktopIconsUtil.DesktopIconsUtil(this.Data, this.Utils);
        }

        _onActivate() {
            if (!this.desktopManager) {
                this.desktops = this.newdesktops;
                this.desktopManager = new DesktopManager.DesktopManager(
                    this.Data,
                    this.Utils,
                    this.desktops,
                    this.codePath,
                    this.asDesktop,
                    this.primaryIndex
                );
            }
        }

        _parseOptions(args) {
            this.newdesktops = [];
            this.newDesktopsVariants = [];

            // modified for GJS to work like passing optioncontext
            args.forEach((arg, index, array) => {
                this.options.some(entry => {
                    const longname = arg === `--${entry.long_name}`;
                    const shortname = arg === `-${entry.short_name}`;

                    if (longname || shortname) {
                        const assignFunction = entry.arg_data;

                        if (entry.arg === GLib.OptionArg.NONE) {
                            assignFunction();
                            return true;
                        }

                        let value;

                        if (longname && entry.long_name.includes('='))
                            value = entry.split('=')[1];
                        else
                            value = array[index += 1] ?? null;

                        assignFunction(value);

                        return true;
                    }
                    return false;
                });
            });
        }

        _printUsage() {
            // OptionContext does not work in GJS, modifed version
            // const helptext = this.optionsContext.get_help(false, null);
            let helpMessage =
                'Usage: gjs -m adw-ding.js [OPTIONS]\n\nOptions:\n';

            this.options.forEach(entry => {
                const shortOption = entry.short_name
                    ? `-${entry.short_name}` : '';

                const argDescription = entry.arg_description
                    ? ` ${entry.arg_description}` : '';

                helpMessage += `  ${shortOption},  --${entry.long_name}` +
                    `   ${argDescription}\n\n`;

                if (this.showHelp)
                    helpMessage += `    ${entry.description}\n\n`;
            });
            print(helpMessage);
        }

        _initializeObjects() {
            this.errorFound = false;
            this.showHelp = false;
            this.gnomeversion = 40;
            this.primaryIndex = 0;
            this.programversion = 'Testing';
            this.uuid = 'testing@gtk4-ding';
            this.desktops = [];
            this.desktopVariants = [];
            this.Data = {};

            // Code for checking Dbus actions and remote controlling the app
            // via DBus - see commented code in commanline invocation.
            //
            // const dbusID = this.asDesktop ? appID : testAppID;
            // const dbusPath = `${dbusID}.actions`.split('.').join('/');
            // this.remoteDingActions = Gio.DBusActionGroup.get(
            //     Gio.DBus.session,
            //     dbusID,
            //     dbusPath
            // );
        }

        _initializeOptions() {
            this._initializeObjects();
            // Define options, similar to GLib.optionEntry for GJS
            this.options = [
                {
                    long_name: 'asdesktop',
                    short_name: 'E',
                    flags: 0,
                    arg: GLib.OptionArg.NONE,
                    arg_data: () => (this.asDesktop = true),
                    description: 'run as desktop (with transparent window, ' +
                        'reacting to data from the extension...',
                    arg_description: 'as desktop flag',
                },
                {
                    long_name: 'help',
                    short_name: 'h',
                    flags: 0,
                    arg: GLib.OptionArg.NONE,
                    arg_data: () => (this.showHelp = true),
                    description: 'show this help',
                    arg_description: 'help flag',
                },
                {
                    long_name: 'shellversion',
                    short_name: 'V',
                    flags: 0,
                    arg: GLib.OptionArg.STRING,
                    arg_data: value => (this.gnomeversion = value),
                    description:
                        'pass the gnome version to the DING application',
                    arg_description: 'gnome shell version',
                },
                {
                    long_name: 'extensionversion',
                    short_name: 'v',
                    flags: 0,
                    arg: GLib.OptionArg.STRING,
                    arg_data: value => (this.programversion = value),
                    description: 'pass the version-name of the program to ' +
                        'display in extension/DING preferences',
                    arg_description: 'application/extension version',
                },
                {
                    long_name: 'monitor',
                    short_name: 'M',
                    flags: 0,
                    arg: GLib.OptionArg.CALLBACK,
                    arg_data: value => (this.primaryIndex = parseInt(value)),
                    description: 'index of the primary monitor',
                    arg_description: 'primary monitor index',
                },
                {
                    long_name: 'uuid',
                    short_name: 'U',
                    flags: 0,
                    arg: GLib.OptionArg.STRING,
                    arg_data: value => (this.uuid = value),
                    description: 'pass the uuid of the extension to use in ' +
                        'the DING application',
                    arg_description: 'extension uuid',
                },
                {
                    long_name: 'desktop',
                    short_name: 'D',
                    flags: 0,
                    arg: GLib.OptionArg.CALLBACK,
                    arg_data: data => this._parseDesktopData(data),
                    description:
`monitor and desktop data-

        x: X coordinate
        y: Y coordinate
        w: width in pixels
        h: height in pixels
        z: zoom value (must be greater than or equal to one)
        t: top margin in pixels
        b: bottom margin in pixels
        l: left margin in pixels
        r: right margin in pixels
        i: monitor index (0, 1...)

    multiple "-D" options can be set for multi monitor setup`,
                    arg_description:
                        'x:y:w:h:z:t:b:l:r:i -string with monitor dimensions',
                },
            ];

            // This does not work in GJS - constructor cannot be called -
            // therefore alternative implementation for the following
            //
            // this.optionsContext =
            //      new GLib.OptionContext('Adw Desktop Icons Application');
            //
            // this.optionsContext.add_main_entries(options, getTextDomain);
        }

        _parseDesktopData(data) {
            data = data.split(':');

            if (data.length !== 10)
                throw new Error('Incorrect number of parameters for -D\n');

            if (parseFloat(data[4]) < 1.0)
                throw new Error('Error: ZOOM value can not be less than one\n');

            const dataObject = {
                x: parseInt(data[0]),
                y: parseInt(data[1]),
                width: parseInt(data[2]),
                height: parseInt(data[3]),
                zoom: parseFloat(data[4]),
                marginTop: parseInt(data[5]),
                marginBottom: parseInt(data[6]),
                marginLeft: parseInt(data[7]),
                marginRight: parseInt(data[8]),
                monitorIndex: parseInt(data[9]),
            };

            if (Object.values(dataObject).some(x => isNaN(x)))
                throw new Error('Incorrect non numeric value in -D data \n');

            this.newdesktops.push(dataObject);
        }

        _initializeDesktopOptions() {
            if (!this.newdesktops.length && !this.asDesktop) {
                /* if no desktop list is provided,
                 * like when launching the program in stand-alone mode,
                 * configure a 1280x720 desktop
                */
                const data = '0:0:1280:720:1:0:0:0:0:0';
                this._parseDesktopData(data);
            }

            this.newdesktops.forEach(d =>
                (d.primaryMonitor = this.primaryIndex));

            this.newDesktopsVariants = this.newdesktops.map(d => {
                return new GLib.Variant('a{sd}', {
                    x: d.x,
                    y: d.y,
                    width: d.width,
                    height: d.height,
                    zoom: d.zoom,
                    marginTop: d.marginTop,
                    marginBottom: d.marginBottom,
                    marginLeft: d.marginLeft,
                    marginRight: d.marginRight,
                    monitorIndex: d.monitorIndex,
                    primaryMonitor: d.primaryMonitor,
                });
            });
        }

        async _installFile(resourcePath, destinationPath) {
            const resourceFile = Gio.File.new_for_uri(resourcePath);
            const destinationFile = Gio.File.new_for_path(destinationPath);

            const [contents] =
                await resourceFile.load_contents_async(null);

            if (!contents)
                return false;

            if (destinationFile.query_exists(null)) {
                const [existingContents] =
                    await destinationFile.load_contents_async(null);

                const fileName = GLib.path_get_basename(destinationPath);

                if (this._memcmp(contents, existingContents))
                    console.log(`Already up-to-date: ${fileName}`);
                else
                    console.log(`User installed file ${fileName} exists`);

                return false;
            }

            try {
                await destinationFile.replace_contents_async(
                    contents,
                    null,
                    false,
                    Gio.FileCreateFlags.REPLACE_DESTINATION,
                    null
                );

                console.log(
                    `Updated: ${GLib.path_get_basename(destinationPath)}`
                );
            } catch (e) {
                if (e.matches(
                    Gio.IOErrorEnum,
                    Gio.IOErrorEnum.NOT_EMPTY
                )) {
                    GLib.mkdir_with_parents(
                        GLib.path_get_dirname(destinationPath),
                        0o700
                    );

                    const retval = await this._installFile(
                        resourcePath,
                        destinationPath
                    );

                    return retval;
                }

                return false;
            }

            return true;
        }

        _removeFile(destinationPath) {
            const destinationFile = Gio.File.new_for_path(destinationPath);

            try {
                if (destinationFile.query_exists(null))
                    destinationFile.delete(null);

                console.log(
                    'Cleaning up, removed: ' +
                    `${GLib.path_get_basename(destinationPath)}`
                );
            } catch (e) {
                logError(e);
            }
        }

        async _updateIconCache() {
            const appPath = `/${appID.split('.').join('/')}`;
            const iconPath = '/icons/hicolor/scalable/apps';
            const iconResrc = `resource://${appPath}${iconPath}/${appID}.svg`;

            const appIcon = GLib.build_filenamev([
                GLib.get_user_data_dir(),
                `${iconPath}`,
                `${appID}.svg`,
            ]);

            const written = await this._installFile(iconResrc, appIcon);

            if (written) {
                this.appIcon = appIcon;

                const iconCachePath = GLib.build_filenamev([
                    GLib.get_user_data_dir(),
                    'icons',
                    'hicolor',
                ]);

                const updated = await GLib.spawn_command_line_async(
                    'gtk-update-icon-cache ' +
                    '-q -t -f ' +
                    `${iconCachePath}`
                );

                if (updated)
                    console.log('Updated icon cache');
            }
        }

        async _updateAppInfoCache() {
            const appPath = `/${appID.split('.').join('/')}`;
            const appResource = `resource://${appPath}/${appID}.desktop`;

            const appDesktopFile = GLib.build_filenamev([
                GLib.get_user_data_dir(),
                'applications',
                `${appID}.desktop`,
            ]);

            const written =
                await this._installFile(appResource, appDesktopFile);

            if (written) {
                this.appDesktopFile = appDesktopFile;

                // Gnome will update the app info cache automatically
                // However it takes a long time to update the cache
                // and we need to do it manually for the app to be
                // available sooner
                const updated = await GLib.spawn_command_line_async(
                    'update-desktop-database -q ' +
                    `${GLib.path_get_dirname(appDesktopFile)}`
                );

                if (updated)
                    console.log('Updated desktop database');
            }
        }

        _memcmp(a, b) {
            if (a.length !== b.length)
                return false;

            if (a.some((x, i) => x !== b[i]))
                return false;

            return true;
        }
    }
);

const asDesktop = ARGV.includes('-E');
const app = new adWDingApp(asDesktop);

System.exit(await app.runAsync(ARGV));
