/* DING: Desktop Icons New Generation for GNOME Shell
 *
 * Gtk4 Port Copyright (C) 2022, 2025 Sundeep Mediratta (smedius@gmail.com)
 * Copyright (C) 2020 Sergio Costas (rastersoft@gmail.com)
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
import {Gio, GLib} from '../dependencies/gi.js';

export {TemplatesScriptsManager};

const MAX_DIRS = 100;
const MAX_MENUENTRIES = 50;
const MAX_MENU_DEPTH = 10;

const TemplatesScriptsManager = class {
    constructor(baseFolder, selectionfilter, Data) {
        this._selectionFilter = selectionfilter;
        this._actionName = Data.appName;
        this.FileUtils = Data.FileUtils;
        this.Enums = Data.Enums;
        this._entries = [];
        this._entriesEnumerateCancellable = null;
        this._entriesDir = baseFolder;
        this._entriesDirMonitors = [];
        this.gioMenu = null;

        if (this._entriesDir === GLib.get_home_dir())
            this._entriesDir = null;

        if (this._entriesDir !== null) {
            this._monitorDir =
                baseFolder.monitor_directory(
                    Gio.FileMonitorFlags.WATCH_MOVES,
                    null
                );

            this._monitorDir.set_rate_limit(1000);

            this._monitorDir.connect(
                'changed',
                () => {
                    this.updateEntries()
                    .catch(
                        e => {
                            console.log(
                                'Exception while updating entries in ' +
                                `monitor: ${e.message}\n${e.stack}`
                            );
                        }
                    );
                }
            );

            this.updateEntries()
            .catch(e => {
                console.log(
                    'Exception while updating entries: ' +
                    `${e.message}\n${e.stack}`
                );
            });
        }
    }

    async updateEntries() {
        if (this._entriesEnumerateCancellable)
            this._entriesEnumerateCancellable.cancel();


        const cancellable = new Gio.Cancellable();
        this._entriesEnumerateCancellable = cancellable;

        this._entriesDirMonitors.forEach(f => {
            f[0].disconnect(f[1]);
            f[0].cancel();
        });

        this._entriesDirMonitors = [];
        this._menuEntries = new Set();

        let entriesList;

        try {
            entriesList = await this._processDirectory(this._entriesDir,
                cancellable);
        } catch (e) {
            if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED) &&
                !e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND))
                console.error(e);
        } finally {
            if (this._entriesEnumerateCancellable === cancellable)
                this._entriesEnumerateCancellable = null;
        }

        [this._entries, this.gioMenu] =
            entriesList !== null
                ? entriesList
                : [null, null];
    }

    async _processDirectory(directory, cancellable, recursionLevel = 0) {
        const localRecursionLevel = recursionLevel += 1;
        var files = null;

        try {
            files = await this._readDirectory(directory, cancellable);
        } catch (e) {
            console.error(e);
            return null;
        }

        if (files === null)
            return null;

        let outputEntries = [];
        let menu = new Gio.Menu();
        let menuhasentries = false;

        for (let file of files) {
            let menuItemName = file[0];

            if (file[2] === null) {
                outputEntries.push(file);
                let menuItemPath = file[1];

                if (this._menuEntries.has(menuItemPath))
                    continue;

                this._menuEntries.add(menuItemPath);
                let menuItem = Gio.MenuItem.new(`${menuItemName}`, null);

                menuItem.set_action_and_target_value(
                    this._actionName,
                    GLib.Variant.new('s', `${menuItemPath}`)
                );

                menu.append_item(menuItem);
                menuhasentries = true;

                continue;
            }

            if (this._entriesDirMonitors.length > MAX_DIRS) {
                console.log(
                    'Limiting the number of folders monitored in ' +
                    'templates/scripts...'
                );
                continue;
            }

            if (localRecursionLevel > MAX_MENU_DEPTH) {
                console.log(
                    'Limiting submenu depth of folders monitored' +
                    ' in templates/scripts...'
                );
                continue;
            }

            let dirpath = file[1].get_path();

            const newFileInfo =
                // eslint-disable-next-line no-await-in-loop
                await file[1].query_info_async(
                    this.Enums.DEFAULT_ATTRIBUTES,
                    Gio.FileQueryInfoFlags.NONE,
                    GLib.PRIORITY_DEFAULT,
                    cancellable
                );

            if (newFileInfo
                .get_attribute_boolean(
                    Gio.FILE_ATTRIBUTE_STANDARD_IS_SYMLINK
                )
            )
                dirpath = newFileInfo.get_symlink_target();

            if (this._menuEntries.has(dirpath))
                continue;

            this._menuEntries.add(dirpath);

            let monitorDir =
                file[1].monitor_directory(
                    Gio.FileMonitorFlags.WATCH_MOVES,
                    null
                );

            monitorDir.set_rate_limit(1000);

            let monitorId =
                monitorDir.connect(
                    'changed',
                    () => {
                        this.updateEntries();
                    }
                );

            this._entriesDirMonitors.push([monitorDir, monitorId]);

            let submenu;
            let subentriesList;

            subentriesList =
            // eslint-disable-next-line no-await-in-loop
                await this._processDirectory(
                    file[1],
                    cancellable,
                    localRecursionLevel
                );

            if (subentriesList === null)
                return null;

            [file[2], submenu] = subentriesList;

            if (file[2].length !== 0)
                outputEntries.push(file);

            if (submenu) {
                const menuItem =
                    Gio.MenuItem.new_submenu(`${menuItemName}`, submenu);

                menu.append_item(menuItem);
                menuhasentries = true;
            }
        }

        if (!menuhasentries)
            menu = null;

        return [outputEntries, menu];
    }

    async _readDirectory(directory, cancellable) {
        const childrenInfo =
            await this.FileUtils.enumerateDir(
                directory,
                cancellable,
                GLib.PRIORITY_DEFAULT,
                this.Enums.DEFAULT_ATTRIBUTES
            );

        const fileList = [];

        childrenInfo.forEach(info => {
            const menuitemName = this._selectionFilter(info);

            if (!menuitemName)
                return;

            if (fileList.length > MAX_MENUENTRIES) {
                console.log('Truncating menu entries templates/scripts submenu');
                return;
            }

            const isDir = info.get_file_type() === Gio.FileType.DIRECTORY;

            const isSymlink =
                info
                .get_attribute_boolean(Gio.FILE_ATTRIBUTE_STANDARD_IS_SYMLINK);

            if (isDir && isSymlink) {
                console.warn(
                    'Folder Symlink in monitored templates/scripts folder...\n',
                    'This can lead to unlimited recursion.'
                );
            }

            const child = directory.get_child(info.get_name());

            fileList.push([
                menuitemName,
                isDir ? child : child.get_path(),
                isDir ? [] : null,
            ]);
        });

        fileList.sort(
            (a, b) => {
                return a[0]
                .localeCompare(
                    b[0],
                    {
                        sensitivity: 'accent',
                        numeric: 'true',
                        localeMatcher: 'lookup',
                    }
                );
            }
        );

        return fileList;
    }

    getGioMenu() {
        return this.gioMenu;
    }
};
