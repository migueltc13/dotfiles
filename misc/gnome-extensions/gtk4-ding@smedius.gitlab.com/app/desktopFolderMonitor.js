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

import {IconCreator} from '../dependencies/localFiles.js';
import {DesktopFolderUtils} from '../dependencies/localFiles.js';

import {Gio, GLib} from '../dependencies/gi.js';
import {_} from '../dependencies/gettext.js';

export {DesktopMonitor};

const DesktopMonitor = class extends DesktopFolderUtils {
    constructor(desktopManager) {
        super();
        this.desktopManager = desktopManager;
        this.mainApp = desktopManager.mainApp;
        this.DesktopIconsUtil = desktopManager.DesktopIconsUtil;
        this.desktopActions = desktopManager.desktopActions;
        this.dbusManager = desktopManager.dbusManager;
        this.windowManager = desktopManager.windowManager;
        this.Prefs = desktopManager.Prefs;
        this.FileUtils = desktopManager.FileUtils;
        this.Enums = desktopManager.Enums;

        this._desktopFilesChanged = false;
        this._readingDesktopFiles = false;
        this._fileList = [];
        this._forcedExit = false;
        this._writableByOthers = false;

        this._updateWritableByOthers().catch(e => console.error(e));
        this._createDesktopChangeActions();
        this._monitorDesktopDirChanges();
        this._monitorDesktopChanges();
        this._monitorVolumes();
        this.DBusUtils = this.desktopManager.DBusUtils;

        this.DBusUtils.GtkVfsMetadata.connectSignalToProxy(
            'AttributeChanged',
            this._metadataChanged.bind(this)
        );

        this._updateFileList().catch(e => console.error(e));
    }

    _createDesktopChangeActions() {
        const changeDesktop = Gio.SimpleAction.new('changeDesktop', null);

        changeDesktop.connect('activate', () => {
            this.changeDesktop();
        });

        this.mainApp.add_action(changeDesktop);

        this.restoreDefaultDesktopAction =
            Gio.SimpleAction.new('restoreDefaultDesktop', null);

        this.restoreDefaultDesktopAction.connect('activate', () => {
            this.restoreDefaultDesktop();
        });

        this.mainApp.add_action(this.restoreDefaultDesktopAction);

        this.restoreDefaultDesktopAction
            .set_enabled(!this.isDefaultDesktop);
    }

    stopMonitoring() {
        if (this._monitorDesktopCancellable)
            this._monitorDesktopCancellable.cancel();

        this._forcedExit = true;
        if (this._desktopEnumerateCancellable)
            this._desktopEnumerateCancellable.cancel();

        super._stopMonitoring();
    }

    onDesktopFolderChanged(newDesktopDir) {
        const isFolder =
            newDesktopDir.query_file_type(
                Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
                null
            ) === Gio.FileType.DIRECTORY;

        if (!isFolder) {
            const header =
                _('Desktop Folder Change Failed');

            const text =
                _('The new Desktop Folder does not exist!');

            this.dbusManager.doNotify(header, text);
            return;
        }

        if (newDesktopDir.get_path() ===
            this._desktopDir.get_path()
        )
            return;

        const header = _('Desktop Folder Changed');
        const text = _('Switching to new Desktop...');
        this.dbusManager.doNotify(header, text);

        this._desktopDir = newDesktopDir;

        this.restoreDefaultDesktopAction
        .set_enabled(!this.isDefaultDesktop);

        this._updateWritableByOthers()
            .catch(e => console.error(e));

        this._desktops.forEach(d => d.unsetErrorState());

        this._updateFileList().catch(e => console.error(e));

        this._monitorDesktopChanges();
    }

    async _updateWritableByOthers() {
        try {
            const info =
                await this._desktopDir.query_info_async(
                    Gio.FILE_ATTRIBUTE_UNIX_MODE,
                    Gio.FileQueryInfoFlags.NONE,
                    GLib.PRIORITY_LOW,
                    null
                );

            this.unixMode =
                info.get_attribute_uint32(Gio.FILE_ATTRIBUTE_UNIX_MODE);

            let writableByOthers =
                (this.unixMode & this.Enums.UnixPermissions.S_IWOTH) !== 0;

            if (writableByOthers !== this._writableByOthers) {
                this._writableByOthers = writableByOthers;

                if (this._writableByOthers) {
                    console.log('desktop-icons: The desktop is writable by' +
                        ' others. Not allowing launching any desktop files.'
                    );
                }

                return true;
            } else {
                return false;
            }
        } catch (e) {
            if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)) {
                this._writableByOthers = true;

                return true;
            }
            throw e;
        }
    }

    _monitorDesktopChanges() {
        const cancellable = new Gio.Cancellable();

        if (this._monitorDesktopCancellable)
            this._monitorDesktopCancellable.cancel();

        this._monitorDesktopCancellable = cancellable;

        this._monitorDesktopDir =
            this._desktopDir.monitor_directory(
                Gio.FileMonitorFlags.WATCH_MOVES,
                cancellable
            );

        this._monitorDesktopDir.set_rate_limit(1000);

        const monitorID = this._monitorDesktopDir.connect(
            'changed',
            (obj, file, otherFile, eventType) => {
                this._updateFileListIfChanged(file, otherFile, eventType)
                .catch(e => console.error(e));
            }
        );

        cancellable.connect(
            () => {
                this._monitorDesktopDir.disconnect(monitorID);
                this._monitorDesktopDir.cancel();
                this._monitorDesktopDir = null;
                this.monitorDesktopCancellable = null;
            }
        );
    }


    _monitorVolumes() {
        this._volumeMonitor = Gio.VolumeMonitor.get();

        this._volumeMonitor.connect(
            'mount-added',
            () => {
                this.onMountAdded();
            }
        );

        this._volumeMonitor.connect(
            'mount-removed',
            () => {
                GLib.timeout_add(
                    GLib.PRIORITY_DEFAULT,
                    500,
                    () => {
                        this.onMountRemoved();
                        return GLib.SOURCE_REMOVE;
                    }
                );
            }
        );
    }

    async _updateFileListIfChanged(file, otherFile, eventType) {
        if (eventType === Gio.FileMonitorEvent.CHANGED) {
            // use only CHANGES_DONE_HINT
            return;
        }

        if (!this.Prefs.showHidden && (file.get_basename()[0] === '.')) {
            // If the file is not visible, we don't need to refresh the desktop
            // Unless it is a hidden file being renamed to visible
            if (!otherFile || (otherFile.get_basename()[0] === '.'))
                return;
        }

        switch (eventType) {
        case Gio.FileMonitorEvent.MOVED_IN:
        case Gio.FileMonitorEvent.MOVED_CREATED:
            /* Remove the coordinates that could exist to avoid conflicts
            between files that are already in the desktop and the new one
            */
            try {
                const info = new Gio.FileInfo();

                info.set_attribute_string(
                    'metadata::desktop-icon-position', ''
                );

                file.set_attributes_async(
                    info,
                    Gio.FileQueryInfoFlags.NONE,
                    GLib.PRIORITY_LOW,
                    null
                );
            } catch (e) {
                // can happen if a file is created and deleted very fast
            }
            break;
        case Gio.FileMonitorEvent.ATTRIBUTE_CHANGED:
            /* The desktop is what changed, and not a file inside it */
            if (file.get_uri() === this._desktopDir.get_uri()) {
                if (await this._updateWritableByOthers()) {
                    try {
                        await this._updateFileList();
                    } catch (e) {
                        console.error(
                            e,
                            'Exception while updating desktop from' +
                            ` Directory Monitor attribute change: ${e.message}`
                        );
                    }
                }
                return;
            }
            break;
        }

        try {
            await this._updateFileList();
        } catch (e) {
            console.error(
                e,
                'Exception while updating desktop from Directory Monitor: ' +
                `${e.message}`
            );
        }
    }

    async _updateFileList() {
        if (this._readingDesktopFiles) {
            // just notify that the files changed while being read from disk.
            this._desktopFilesChanged = true;

            if (this._desktopEnumerateCancellable && !this._forceDraw) {
                this._desktopEnumerateCancellable.cancel();
                this._desktopEnumerateCancellable = null;
            }

            return;
        }

        this._readingDesktopFiles = true;
        this._forceDraw = false;
        this._lastDesktopUpdateRequest = GLib.get_monotonic_time();
        let fileList;

        while (true) {
            this._desktopFilesChanged = false;
            try {
                // eslint-disable-next-line no-await-in-loop
                fileList = await this._doReadAsync();
            } catch (e) {
                if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)) {
                    fileList = [];
                    break;
                }

                throw e;
            }

            if (this._forcedExit)
                return;

            if (fileList !== null) {
                if (!this._desktopFilesChanged)
                    break;

                if (this._forceDraw) {
                    this._fileList = fileList;
                    this.desktopManager.refreshDesktop();
                    this._lastDesktopUpdateRequest = GLib.get_monotonic_time();
                }
            }

            // eslint-disable-next-line no-await-in-loop
            await this.DesktopIconsUtil.waitDelayMs(500);

            if (
                (GLib.get_monotonic_time() - this._lastDesktopUpdateRequest) >
                1000000
            )
                this._forceDraw = true;
            else
                this._forceDraw = false;
        }

        this._readingDesktopFiles = false;
        this._forceDraw = false;
        this._fileList = fileList;
        this.desktopManager.refreshDesktop();
    }

    async _doReadAsync() {
        if (this._desktopEnumerateCancellable)
            this._desktopEnumerateCancellable.cancel();


        const cancellable = new Gio.Cancellable();
        this._desktopEnumerateCancellable = cancellable;

        try {
            const fileList = [];

            const extraFoldersItems =
                this.DesktopIconsUtil.getExtraFolders().map(
                    async ([newFolder, fileTypeEnum]) => {
                        try {
                            if (imports.system.version < 17200) {
                                Gio._promisify(
                                    newFolder.constructor.prototype,
                                    'query_info_async'
                                );
                            }

                            const newFolderInfo =
                                await newFolder.query_info_async(
                                    this.Enums.DEFAULT_ATTRIBUTES,
                                    Gio.FileQueryInfoFlags.NONE,
                                    GLib.PRIORITY_DEFAULT,
                                    cancellable
                                );

                            fileList.push(
                                new IconCreator(
                                    this.desktopManager,
                                    newFolder,
                                    newFolderInfo,
                                    fileTypeEnum,
                                    null
                                )
                            );
                        } catch (e) {
                            if (e.matches(
                                Gio.IOErrorEnum,
                                Gio.IOErrorEnum.CANCELLED)
                            )
                                throw e;

                            console.error(e,
                                `Failed with ${e.message} while adding` +
                                ` extra folder ${newFolder.get_uri()}`
                            );
                        }
                    }
                );

            const getLocalFilesInfos =
                async () => {
                    const childrenInfo =
                        await this.FileUtils.enumerateDir(
                            this._desktopDir,
                            cancellable,
                            GLib.PRIORITY_DEFAULT,
                            this.Enums.DEFAULT_ATTRIBUTES
                        );

                    childrenInfo?.forEach(info => {
                        const fileItem =
                            new IconCreator(
                                this.desktopManager,
                                this._desktopDir.get_child(info.get_name()),
                                info,
                                this.Enums.FileType.NONE,
                                null
                            );

                        if (fileItem.isHidden && !this.Prefs.showHidden) {
                            /* if there are hidden files in the desktop and the
                            user doesn't want to show them, remove the
                            coordinates. This ensures that if the user enables
                            showing them, they won't fight with other icons
                            for the same place
                            */
                            if (fileItem.savedCoordinates) {
                                // only overwrite them if needed
                                fileItem.savedCoordinates = null;
                            }
                            return;
                        }

                        fileItem.savedCoordinates =
                            fileItem.savedCoordinates ?? null;

                        fileItem.dropCoordinates =
                            fileItem.dropCoordinates ?? null;

                        if (fileItem.savedCoordinates === null ||
                            fileItem.dropCoordinates === null
                        ) {
                            const basename = fileItem.file.get_basename();
                            this._checkBasenameInPending(fileItem, basename);
                        }

                        fileList.push(fileItem);
                    });
                };

            const mountsItems =
                this.DesktopIconsUtil.getMounts(this._volumeMonitor).map(
                    async ([newFolder, fileTypeEnum, gioMount]) => {
                        try {
                            if (imports.system.version < 17200) {
                                Gio._promisify(
                                    newFolder.constructor.prototype,
                                    'query_info_async'
                                );
                            }

                            const newFolderInfo =
                                await newFolder.query_info_async(
                                    this.Enums.DEFAULT_ATTRIBUTES,
                                    Gio.FileQueryInfoFlags.NONE,
                                    GLib.PRIORITY_DEFAULT,
                                    cancellable
                                );

                            fileList.push(
                                new IconCreator(
                                    this.desktopManager,
                                    newFolder,
                                    newFolderInfo,
                                    fileTypeEnum,
                                    gioMount
                                )
                            );
                        } catch (e) {
                            if (e.matches(
                                Gio.IOErrorEnum,
                                Gio.IOErrorEnum.CANCELLED)
                            )
                                throw e;

                            console.error(e,
                                `Failed with ${e.message} while ` +
                                `adding volume ${newFolder}`
                            );
                        }
                    });

            await Promise.all(
                [
                    getLocalFilesInfos(),
                    ...extraFoldersItems,
                    ...mountsItems,
                ]
            );

            if (this._desktopFilesChanged && !this._forceDraw)
                return null;

            return fileList;
        } catch (e) {
            if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) {
                console.error(e,
                    'Failed to read contents of' +
                    `${this._desktopDir.get_path()}`
                );
            }

            return null;
        } finally {
            if (cancellable === this._desktopEnumerateCancellable)
                this._desktopEnumerateCancellable = null;
        }
    }

    _checkBasenameInPending(fileItem, basename) {
        if (basename in this._pendingSelfCopyFiles) {
            if (fileItem.savedCoordinates === null) {
                fileItem.savedCoordinates =
                    this._pendingSelfCopyFiles[basename];
            }

            delete this._pendingSelfCopyFiles[basename];
            return;
        }

        if (basename in this._pendingDropFiles) {
            fileItem.dropCoordinates = this._pendingDropFiles[basename];
            delete this._pendingDropFiles[basename];
            return;
        }

        const regex = /\(.*\)[^()]*$/;
        let basenameStart;
        const lastParenthesisPosition = basename.search(regex);

        if (lastParenthesisPosition > 1) {
            basenameStart = basename.slice(0, lastParenthesisPosition - 1);
            if (basenameStart) {
                for (let fileName of Object.keys(this._pendingDropFiles)) {
                    if (fileName.startsWith(basenameStart)) {
                        fileItem.dropCoordinates =
                            this._pendingDropFiles[fileName];

                        delete this._pendingDropFiles[fileName];
                    }
                }
            }
        }
    }

    _metadataChanged(proxy, nameOwner, args) {
        const filepath = GLib.build_filenamev([GLib.get_home_dir(), args[1]]);

        if (this._desktopDir.get_path() === GLib.path_get_dirname(filepath)) {
            for (let fileItem of this._fileList) {
                if (fileItem.path === filepath) {
                    fileItem.updatedMetadata();
                    break;
                }
            }
        }
    }

    onMountAdded() {
        this._updateFileList().catch(e => {
            console.log(
                'Exception while updating Desktop after a' +
                ` mount was added: ${e.message}\n${e.stack}`
            );
        });
    }

    onMountRemoved() {
        this._updateFileList().catch(e => {
            console.log(
                'Exception while updating Desktop after a ' +
                `mount was removed: ${e.message}\n${e.stack}`
            );
        });
    }

    fileExistsOnDesktop(searchName) {
        const listOfFileNamesOnDesktop = this._fileList.map(f => f.fileName);

        if (listOfFileNamesOnDesktop.includes(searchName))
            return true;
        else
            return false;
    }

    getDesktopUniqueFileName(fileName) {
        let fileParts = this.DesktopIconsUtil.getFileExtensionOffset(fileName);
        let i = 0;
        let newName = fileName;

        while (this.fileExistsOnDesktop(newName)) {
            i += 1;
            newName = `${fileParts.basename} ${i}${fileParts.extension}`;
        }
        return newName;
    }

    async getFileList() {
        const fileList = await this._doReadAsync();
        this._fileList = fileList;
        return fileList;
    }

    async reLoadFileList() {
        await this._updateFileList().catch(e => logError(e));
    }

    get fileList() {
        return this._fileList;
    }

    get _desktops() {
        return this.windowManager.desktops;
    }

    get _pendingDropFiles() {
        return this.desktopManager.pendingDropFiles;
    }

    get _pendingSelfCopyFiles() {
        return this.desktopManager.pendingSelfCopyFiles;
    }

    get desktopDir() {
        return this._desktopDir;
    }
};

