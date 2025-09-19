/* ADW-DING: Desktop Icons New Generation for GNOME Shell
 *
 * Adw/Gtk4 Port Copyright (C) 2025 Sundeep Mediratta (smedius@gmail.com)
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

import {gettext, Gio, GLib, Gtk} from '../../dependencies/gi.js';
import {_} from '../../dependencies/gettext.js';
import {Enums} from '../../dependencies/localFiles.js';

export {DesktopFolderUtils};

const DesktopFolderUtils = class {
    constructor(window) {
        this._activeWindow = window;
        this.Enums = Enums;
        this._desktopDir = this.getDesktopDir();
        // Bind xdg-user-dirs translation domain
        gettext.bindtextdomain('xdg-user-dirs', '/usr/share/locale');
    }

    _monitorDesktopDirChanges() {
        this._xdgUserDirs = this._getXdgUserDirs();

        this._monitorXdgUserDirs = this._xdgUserDirs.monitor_file(
            Gio.FileMonitorFlags.WATCH_MOVES, null);

        this._monitorXdgUserDirs.set_rate_limit(2000);

        this._connectMonitor();
    }

    _connectMonitor() {
        this._monitorID = this._monitorXdgUserDirs.connect(
            'changed',
            (obj, file, otherFile, event) => {
                if (!(event === Gio.FileMonitorEvent.CHANGES_DONE_HINT ||
                    event === Gio.FileMonitorEvent.RENAMED))
                    return;

                if (this._changingDesktopDirID)
                    GLib.source_remove(this._changingDesktopDirID);

                this._changingDesktopDirID =
                    GLib.timeout_add(GLib.PRIORITY_LOW, 500, () => {
                        const newDesktopDir =
                            this.getDesktopDir();
                        this.onDesktopFolderChanged(newDesktopDir);
                        this._changingDesktopDirID = null;
                        return GLib.SOURCE_REMOVE;
                    });
            }
        );
    }

    _disconnectMonitor() {
        if (this._monitorID)
            this._monitorXdgUserDirs.disconnect(this._monitorID);
        this._monitorID = 0;
    }

    _stopMonitoring() {
        this._disconnectMonitor();
        this._monitorXdgUserDirs?.cancel();
    }

    onDesktopFolderChanged(newDesktopDir) {
        this._desktopDir = newDesktopDir;
    }

    changeDesktop() {
        const dialog = new Gtk.FileDialog();
        dialog.set_title(_('Choose Desktop Folder'));
        dialog.set_accept_label(_('Choose'));
        dialog.set_modal(true);

        dialog.set_initial_folder(
            Gio.File.new_for_commandline_arg(GLib.get_home_dir())
        );

        dialog.select_folder(
            this.activeWindow,
            null,
            this._finishChooseDesktopFolder.bind(this)
        );
    }

    restoreDefaultDesktop() {
        const localizedDesktopName = this.getSystemLocalizedDesktopDir();
        const defaultDesktop = GLib.build_filenamev([GLib.get_home_dir(),
            localizedDesktopName]);

        const desktopFolder = Gio.File.new_for_path(defaultDesktop);

        try {
            if (!desktopFolder.query_exists(null))
                GLib.mkdir_with_parents(desktopFolder.get_path(), 0o755);
        } catch (e) {
            console.error(
                `Unable to create Folder ${defaultDesktop}: ${e.message}`
            );
        }

        this._setDesktopFolder(desktopFolder);
    }

    getDesktopDir() {
        const glibDesktopPath =
            GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_DESKTOP);

        let xdgDesktopPath = null;

        try {
            const userDirsGioFile = this._getXdgUserDirs();

            if (!userDirsGioFile.query_exists(null)) {
                throw new Error(
                    'User configuration file user-dirs.users does not exist'
                );
            }

            const decoder = new TextDecoder();

            const contents =
                decoder
                .decode(GLib.file_get_contents(userDirsGioFile.get_path())[1])
                .trim();

            if (contents)
                xdgDesktopPath = this._parseUserDirsFile(contents);
        } catch (e) {
            console.error(e, `XDG Desktop not set, ${e}`);
        }

        const desktopPath = xdgDesktopPath ? xdgDesktopPath : glibDesktopPath;

        return Gio.File.new_for_commandline_arg(desktopPath);
    }

    getSystemLocalizedDesktopDir() {
        const systemDesktopDirName =
            this._getSystemDesktopDir() ?? this.Enums.DEFAULT_DESKTOP_NAME;
        const localizedDesktopName =
            gettext.dgettext('xdg-user-dirs', systemDesktopDirName);

        return localizedDesktopName ?? systemDesktopDirName;
    }

    _getSystemDesktopDir() {
        const systemDirsGioFile = this._getXdgSystemDirs();

        if (!systemDirsGioFile) {
            console.error('No system xdg user-dirs.default file');
            return null;
        }

        let xdgSystemDesktopPath = null;
        const decoder = new TextDecoder();

        try {
            const contents =
                decoder
                .decode(GLib.file_get_contents(systemDirsGioFile.get_path())[1])
                .trim();

            if (contents) {
                const parseSystemconfig = true;

                xdgSystemDesktopPath =
                    this._parseUserDirsFile(contents, parseSystemconfig);
            }
        } catch (e) {
            console.error(e, `XDG Desktop not set in user-dirs.default, ${e}`);
        }

        return xdgSystemDesktopPath;
    }


    async _finishChooseDesktopFolder(dialog, asyncResult) {
        let newFolder = null;

        try {
            newFolder = dialog.select_folder_finish(asyncResult);
        } catch (e) {
            if (e.matches(Gtk.DialogError, Gtk.DialogError.CANCELLED) ||
                e.matches(Gtk.DialogError, Gtk.DialogError.DISMISSED))
                return;
            console.error(e, `Error selecting folder: ${e.message}`);
        }

        if (!newFolder)
            return;

        await this._setDesktopFolder(newFolder);
    }

    async _setDesktopFolder(newFolder) {
        const isFolder =
            newFolder.query_file_type(
                Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
                null
            ) === Gio.FileType.DIRECTORY;

        if (!isFolder)
            return;

        if (newFolder.get_path() === this._desktopDir.get_path())
            return;

        await this._writeXdgUserDirsDesktopFile(newFolder.get_path());
    }

    _isDefaultDesktopFolder() {
        const localizedDesktopName = this.getSystemLocalizedDesktopDir();
        const defaultDesktop = GLib.build_filenamev([GLib.get_home_dir(),
            localizedDesktopName]);

        return this._desktopDir.get_path() === defaultDesktop;
    }

    _parseUserDirsFile(content, systemconfig = null) {
        if (!content)
            return null;

        const serarchstring = systemconfig ? 'DESKTOP=' : 'XDG_DESKTOP_DIR=';

        const lineArray = content.trim().split('\n');

        const desktopline =
            lineArray.filter(l => l.startsWith(serarchstring))[0];

        let xdgDesktopPath = desktopline.split('=')[1].trim();
        xdgDesktopPath = xdgDesktopPath.replace(/^"|"$/g, '');
        xdgDesktopPath = xdgDesktopPath.replace('$HOME', GLib.get_home_dir());

        return xdgDesktopPath;
    }

    async _writeXdgUserDirsDesktopFile(path) {
        const userDirsGioFile = this._getXdgUserDirs();

        if (path.startsWith(GLib.get_home_dir()))
            path = path.replace(GLib.get_home_dir(), '$HOME');

        const newline = `XDG_DESKTOP_DIR="${path}"`;

        try {
            const decoder = new TextDecoder();

            const contents =
                decoder
                .decode(GLib.file_get_contents(userDirsGioFile.get_path())[1])
                .trim();

            const lineArray = contents.split('\n');

            const newArray = lineArray.map(l => {
                if (l.startsWith('XDG_DESKTOP_DIR='))
                    return newline;
                return l;
            });

            const newContents = newArray.join('\n');
            await this._replaceFileContentsAsync(userDirsGioFile, newContents);
        } catch (e) {
            console.error(e, `Failed to write XDG Desktop file with ${e}`);
        }
    }

    async _replaceFileContentsAsync(destinationFile, contents) {
        const textCoder = new TextEncoder();
        const byteArray = new GLib.Bytes(textCoder.encode(contents));

        try {
            await destinationFile.replace_contents_async(
                byteArray,
                null,
                false,
                Gio.FileCreateFlags.REPLACE_DESTINATION,
                null
            );
        } catch (e) {
            if (e.matches(
                Gio.IOErrorEnum,
                Gio.IOErrorEnum.NOT_EMPTY
            )) {
                GLib.mkdir_with_parents(
                    GLib.path_get_dirname(destinationFile.get_path()),
                    0o700
                );

                this._replaceFileContentsAsync(destinationFile, contents);
                return;
            }

            console.error(e, `Failed to write XDG Desktop file with ${e}`);
        }
    }

    _getXdgUserDirs() {
        const xdgUserDirspath =
            GLib.build_filenamev(
                [GLib.get_user_config_dir(), this.Enums.XDG_USER_DIRS]
            );

        return Gio.File.new_for_commandline_arg(xdgUserDirspath);
    }

    _getXdgSystemDirs() {
        const xdgSystemDirsArray = GLib.get_system_config_dirs();

        for (let dir of xdgSystemDirsArray) {
            const xdgSystemDirspath = GLib.build_filenamev(
                [dir, this.Enums.XDG_SYSTEM_DIRS]
            );

            const xdgSystemdir = Gio.File.new_for_path(xdgSystemDirspath);

            if (xdgSystemdir.query_exists(null))
                return xdgSystemdir;
        }

        return null;
    }

    get activeWindow() {
        if (this._activeWindow)
            return this._activeWindow;

        return Gio.Application.get_default().get_active_window();
    }

    set activeWindow(window) {
        this._activeWindow = window;
    }

    get isDefaultDesktop() {
        return this._isDefaultDesktopFolder();
    }
};
