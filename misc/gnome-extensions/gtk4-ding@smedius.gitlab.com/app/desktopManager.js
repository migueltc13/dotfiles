/* DING: Desktop Icons New Generation for GNOME Shell
 *
 * Gtk4 Port Copyright (C) 2022-25 Sundeep Mediratta (smedius@gmail.com)
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
import {
    AppChooser,
    AskRenamePopup,
    AutoAr,
    DesktopMenu,
    DesktopMonitor,
    DragManager,
    FileItemMenu,
    GnomeShellDragDrop,
    ShortcutManager,
    ShowErrorPopup,
    StackItem,
    TemplatesScriptsManager,
    WindowManager
} from '../dependencies/localFiles.js';

import {Adw, Gtk, Gdk, Gio, GLib, GLibUnix} from '../dependencies/gi.js';
import {_} from '../dependencies/gettext.js';

export {DesktopManager};

const DesktopManager = class {
    constructor(Data, Utils, desktopList, codePath, asDesktop, primaryIndex) {
        // Inherit
        this.mainApp = Data.mainApp;
        this.codePath = codePath;
        this._asDesktop = asDesktop;
        if (asDesktop) {
            // Don't close the application if there are no desktops
            this.mainApp.hold();
            this._hold_active = true;
        }

        this.GnomeShellVersion = Data.gnomeversion;

        this.uuid = Data.uuid;

        // Init and import Scripts and classes
        this.DesktopIconsUtil = Utils.DesktopIconsUtil;
        this.FileUtils = Utils.FileUtils;
        this.Enums = Data.Enums;
        this.DBusUtils = Utils.DBusUtils;
        this.dbusManager = Utils.DBusUtils.dbusManagerObject;
        this.Prefs = Utils.Preferences;
        this.showErrorPopup = ShowErrorPopup;
        this.templatesScriptsManager = TemplatesScriptsManager;
        this.GnomeShellDragDrop = GnomeShellDragDrop;
        this.appChooser = AppChooser;
        this.ThumbnailLoader = Utils.ThumbnailLoader;

        // init methods
        this.dragManager = new DragManager.DragManager(this);
        this.windowManager = new WindowManager.WindowManager(this,
            desktopList,
            asDesktop,
            primaryIndex
        );
        this.desktopMonitor = new DesktopMonitor.DesktopMonitor(this);
        this.autoAr = new AutoAr.AutoAr(this);
        this.fileItemMenu = new FileItemMenu.FileItemMenu(this);
        this.fileItemActions = new FileItemMenu.FileItemActions(this);
        this.desktopActions = new DesktopMenu.DesktopActions(this);
        this.desktopMenuManager = new DesktopMenu.DesktopBackgroundMenu(this);
        this.Prefs.init(this);
        this.shortcutManager = new ShortcutManager(this);

        // Init Variables
        this._clickX = null;
        this._clickY = null;
        this._compositeStackList = null;
        this._displayList = [];
        this.ignoreKeys = this.Enums.IgnoreKeys.map(_k => Gdk._k);

        // setup gracefull termination
        if (this._asDesktop) {
            this._sigtermID = GLibUnix.signal_add_full(
                GLib.PRIORITY_DEFAULT,
                15,
                () => {
                    GLib.source_remove(this._sigtermID);
                    this.terminateProgram();
                    if (this._hold_active) {
                        this.mainApp.release();
                        this._hold_active = false;
                    }
                    return false;
                }
            );
        }
        this._syncStartupDesktop().catch(e => logError(e));
    }

    async _syncStartupDesktop() {
        // startup in a particular order
        // First create and make sure windows are created
        const windowscreated = new Promise(resolve => {
            this.windowsPromiseResolve = resolve;
            this.windowManager.createGridWindows();
            // If this desktop List is null, ask for a new one
            this.windowManager.requestGeometryUpdate();
        });

        // Monitor is attached, windows are created with proper geometry
        await windowscreated.catch(e => logError(e));

        // Now we can actually display errors, so check for them
        // Ensure that there is a 'Desktop' folder set and it exists
        // Verify if Gnome Files is available and executable, otherwise warn
        // Confirm Gnome Files is registered with xdg-utils
        // to handle inode/directory
        this._performSanityChecks().catch(e => logError(e));

        // The initialRead parameter insures tha grid positions are recalculated
        // and recaculated postions of all fileItems will be re-written to
        // disk with write mode 'OVERWRITE'
        const initialRead = true;

        // prior fileList, even if triggered through desktopdir changes
        // will not be displayed as windows were not there.
        const fileList = await this.desktopMonitor.getFileList();

        // This is no longer needed, if true it blocks and all updates.
        this.windowsPromiseResolve = null;

        await this._drawDesktop(fileList, {initialRead}).catch(e => logError(e));
        // First intitiation complete, valid file read from
        // desktopdir, even if a prior fileList was read, the
        // forced new read will recalculate and resave new
        // normalized coordinates and monitor information.
    }

    async _performSanityChecks() {
        // show error if monitor frame buffer scaling is not enabled first,
        //  as windows may be awry
        if (this.windowManager.differentZooms &&
            !this.Prefs.usingX11 &&
            !this.fractionalScaling &&
            !this._framebufferWarningDone) {
            const header = _('Monitor Frame Buffer Scaling is not enabled');
            const text = _('Multiple monitors with different zoom settings, recommend per monitor framebuffer scaling.\n\nPlease enable in Mutter Dconf Settings');
            // show notification as well as error dialog as windows may
            //  not be postioned correctly
            this.dbusManager.doNotify(header, text);
            this._framebufferWarningDone = true;

            const window = this.mainApp.get_active_window();
            const dialog = new Adw.AlertDialog();
            dialog.set_body_use_markup(true);
            dialog.set_heading_use_markup(true);
            dialog.set_heading(header);
            const secondaryText = _('Multiple monitors with different zoom settings.\n\nEnable per monitor framebuffer scaling in Mutter Dconf Settings?');
            dialog.set_body(secondaryText);
            dialog.add_response('cancel', _('Cancel'));
            dialog.add_response('enable', _('Enable'));
            dialog.set_close_response('cancel');
            dialog.set_default_response('enable');
            dialog.set_response_appearance(
                'enable', Adw.ResponseAppearance.SUGGESTED);
            dialog.set_response_appearance(
                'cancel', Adw.ResponseAppearance.DEFAULT);
            dialog.set_prefer_wide_layout(true);
            const runDialog = new Promise(resolve => {
                dialog.choose(window, null, (actor, asyncResult) => {
                    const response = actor.choose_finish(asyncResult);
                    if (response === 'enable')
                        this.Prefs.fractionalScaling = true;
                    dialog.close();
                    resolve(response);
                });
            });
            await runDialog;
        }

        const isFolder = this._desktopDir.query_file_type(
            Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
            null) === Gio.FileType.DIRECTORY;
        if (!isFolder) {
            const errorDialog = this.showError(
                _('Can Not Show the Desktop'),
                _(`The Desktop folder ${this._desktopDir.get_path()} does not exist, or is not a Directory\n\nCheck your xdg-utils installation and set the correct Desktop Folder`)
            );
            await errorDialog.run();
            this._desktops.forEach(d => d.setErrorState());
        }

        const inodeHandlers = Gio.AppInfo.get_all_for_type('inode/directory');
        if (!GLib.find_program_in_path('nautilus')) {
            const errorDialog = this.showError(
                _('GNOME Files not found'),
                _('The GNOME Files application is required by Gtk4 Desktop Icons NG.')
            );
            await errorDialog.run();
        }

        if (!inodeHandlers.length) {
            const helpURL = 'https://gitlab.com/smedius/desktop-icons-ng/-/issues/73';
            const errorDialog = this.showError(
                _('There is no default File Manager'),
                _('There is no application that handles mimetype "inode/directory"'),
                helpURL
            );
            await errorDialog.run();
        }

        if (!inodeHandlers.map(a => a.get_id()).includes('org.gnome.Nautilus.desktop')) {
            const helpURL = 'https://gitlab.com/smedius/desktop-icons-ng/-/issues/73';
            const errorDialog = this.showError(
                _('Gnome Files is not registered as a File Manager'),
                _('The Gnome Files application is not programmed to open Folders!\nCheck your xdg-utils installation\nCheck Gnome Files .desktop File installation'),
                helpURL
            );
            await errorDialog.run();
        }
    }

    showError(text, secondaryText, helpURL = null, timeout = 0) {
        const errorDialog = new ShowErrorPopup.ShowErrorPopup(
            text,
            secondaryText,
            this.DesktopIconsUtil.waitDelayMs,
            helpURL
        );

        if (timeout)
            errorDialog.runAutoClose(timeout);

        return errorDialog;
    }

    terminateProgram() {
        this.desktopMonitor.stopMonitoring();

        if (this._dbusGeometryIface)
            this._dbusGeometryIface.unexport();

        if (this._compositeStackList && this._compositeStackList.length) {
            this._displayList.forEach(f => {
                if (f.isStackMarker)
                    f.onDestroy();
            });
            this._compositeStackList.forEach(f => f.onDestroy());
        } else {
            this._displayList.forEach(f => f.onDestroy());
        }

        this.windowManager.destroyDesktops();
    }

    // Keyboard and Mouse Events

    async onPressButton(X, Y,
        x, y,
        button,
        shiftPressed,
        controlPressed,
        grid
    ) {
        this._clickX = Math.floor(X);
        this._clickY = Math.floor(Y);

        // Left Click
        if (button === 1) {
            if (!shiftPressed && !controlPressed) {
                // clear selection
                this.unselectAll();
            }
            this.dragManager.startRubberband(X, Y);
        }

        // Right Click
        if (button === 3) {
            await this.desktopMenuManager
                .showDesktopMenu(x, y, grid)
                .catch(e => logError(e));
        }
    }

    onKeyPress(keyval, keycode, state, grid) {
        this.keyEventGrid = grid;
        if (this.popupmenu || this.fileItemMenu.popupmenu)
            return true;

        if (this.ignoreKeys.includes(keyval))
            return true;

        let key = String.fromCharCode(Gdk.keyval_to_unicode(keyval));
        if (this.keypressTimeoutID && this.searchString)
            this.searchString = this.searchString.concat(key);
        else
            this.searchString = key;

        if (this.searchString !== '') {
            let found = this._scanForFiles(this.searchString, false);
            if (found) {
                if ((this.getNumberOfSelectedItems() >= 1) &&
                    !this.keypressTimeoutID) {
                    const secondaryText = null;
                    const helpURL = null;
                    const timeoutClose = 2000; // In ms
                    this.showError(
                        _('Clear current selection before new search'),
                        secondaryText,
                        helpURL,
                        timeoutClose
                    );
                    return true;
                }
                this.searchEventTime = GLib.get_monotonic_time();
                if (!this.keypressTimeoutID) {
                    this.keypressTimeoutID =
                        GLib.timeout_add(
                            GLib.PRIORITY_DEFAULT,
                            1000,
                            () => {
                                if (GLib.get_monotonic_time() -
                                    this.searchEventTime < 1500000)
                                    return true;

                                this.searchString = null;
                                this.keypressTimeoutID = null;

                                if (this._findFileWindow) {
                                    this._findFileWindow
                                        .response(Gtk.ResponseType.OK);
                                }

                                return false;
                            });
                }
                this.findFiles(this.searchString);
            }
            return true;
        } else {
            return false;
        }
    }

    closePopUps() {
        if (this._renameWindow) {
            this._renameWindow.close();
            return true;
        }
        if (this.dialogCancellable) {
            this.dialogCancellable.cancel();
            this.dialogCancellable = null;
            return true;
        }
        return false;
    }


    // Destktop Icon Placement and Display
    // ********************************************************************** */

    _removeAllFilesFromGrids() {
        for (let fileItem of this._displayList)
            fileItem.removeFromGrid({callOnDestroy: true});

        this._displayList = [];
    }

    _clearAllFilesFromGrids() {
        for (let fileItem of this._displayList)
            fileItem.removeFromGrid({callOnDestroy: false});

        this._displayList = [];
    }

    async _drawDesktop(fileList, opts = {initialRead: false}) {
        if (this.windowsPromiseResolve || !fileList)
            return;
        const selectedFiles = this.getCurrentSelectionAsUri();

        // Update the Icon before placing on Desktop prevent flickering Icons //
        const updateUI = fileList.map(async fileItem => {
            await fileItem.updateIcon();
            if (selectedFiles) {
                if (selectedFiles.includes(fileItem.uri))
                    fileItem.setSelected();
            }
        });
        await Promise.all([...updateUI]);

        //* Remove all files from the grids just before placing new files to
        // prevent flickering icons *//
        if (opts.initialRead)
            this._removeAllFilesFromGrids();
        else
            this._clearAllFilesFromGrids();
        this._displayList = fileList;

        this._placeAllFilesOnGrids(opts);

        //* Detect all Icon sizes are allocated and Icons are now shown and
        // placed on Grid. Desktop draw/paint is now complete *//
        const drawComplete = this._displayList.map(async fileItem => {
            await fileItem.iconPlaced;
        });
        await Promise.all([...drawComplete]);

        //* Reposition open Menus, renameFileItem pop up's **//
        //* Any task after complete desktop draw can now be done *//
        this._refreshMenus();
    }

    _refreshMenus() {
        if ((this.newItemDoRename && this.newItemDoRename.size) ||
            this.fileItemMenu.popupmenu ||
            this.activeFileItem) {
            let activeItem = false;
            let newItemDoRename = false;

            this._displayList.forEach(f => {
                if (this.activeFileItem &&
                    (f.fileName === this.activeFileItem.fileName))
                    this.activeFileItem = activeItem = f;

                if (this.newItemDoRename &&
                    this.newItemDoRename.has(f.fileName))
                    newItemDoRename = f;
            });

            if (this._renameWindow)
                this._renameWindow.close();

            if (newItemDoRename) {
                newItemDoRename.setSelected();
                const allowReturnOnSameName = true;
                this.doRename(newItemDoRename, allowReturnOnSameName)
                .catch(e => logError(e));
            }

            if (this.fileItemMenu.popupmenu) {
                if (!activeItem)
                    this.fileItemMenu.popupmenu.popdown();
            }

            if (!activeItem)
                this.activeFileItem = null;
        }
    }

    _placeAllFilesOnGrids(opts = {redisplay: false}) {
        if (this.Prefs.keepStacked) {
            this.doStacks(opts);
            return;
        }
        if (this.Prefs.keepArranged) {
            this.doSorts(opts);
            return;
        }
        let storeMode = this.Enums.StoredCoordinates.PRESERVE;
        if (opts.redisplay ||
            opts.initialRead) {
            // write the new recomputed positions to metadata when assigned
            storeMode = this.Enums.StoredCoordinates.OVERWRITE;
            this._sortByCurrentPosition();
            this._recomputeWindowPositions();
        }
        if (opts.gridschanged && !this.Prefs.freePositionIcons) {
            // if snap to grid, recompute column, row for fileItems
            // so they end up in the same relative grid, otherwise they keep
            // shifting postions. This keeps them in the same relative grid
            // position. For snap to grid this will apply the new  global x,y of
            // the grid assigned
            this._recomputeGridPositions();
        }
        this._addFilesToDesktop(this._displayList, storeMode);
    }

    _recomputeGridPositions(fileList) {
        if (!fileList)
            fileList = this._displayList;

        fileList.forEach(fileItem => {
            if (fileItem.savedCoordinates === null)
                return;

            if (fileItem._monitorIndex == null)
                return;

            const column = fileItem.column;
            const row = fileItem.row;

            if (column == null || row == null)
                return;

            const index = fileItem._monitorIndex;
            const [desktop] = this._desktops.filter(d => {
                return d.monitorIndex === index;
            });

            if (!desktop)
                return;

            const [newGlobalX, newGlobalY] =
                desktop.recomputeGridPosition(column, row);

            fileItem.temporarySavedPosition = [newGlobalX + 2, newGlobalY + 2];
        });
    }

    _recomputeWindowPositions(fileList) {
        if (!fileList)
            fileList = this._displayList;

        if (!this._desktops.length)
            return;

        fileList.forEach(fileItem => {
            if (fileItem.savedCoordinates == null)
                return;
            if (fileItem._normalCoordinates == null) {
                fileItem.savedCoordinates = null;
                return;
            }
            if (fileItem._monitorIndex == null)
                return;

            const itemMonitorIndex = fileItem._monitorIndex;
            let desktop;

            // reassign to monitors
            // if on primary monitor, reassign to new primary
            if (itemMonitorIndex === this._priorPrimaryMonitorIndex &&
                this._primaryMonitorIndex != null) {
                if (!this.Prefs.showOnSecondaryMonitor) {
                    [desktop] = this._desktops.filter(d => {
                        return d.monitorIndex === this._primaryMonitorIndex;
                    });
                } else {
                    desktop = this.preferredDisplayDesktop;
                }
            }

            // reassign not on primary monitor to prior monitor if
            // if the prior monitor is still in index
            if (!desktop) {
                [desktop] = this._desktops.filter(d => {
                    return d.monitorIndex === itemMonitorIndex;
                });
            }

            // reassingn to new monitor, prior monitor not available
            if (!desktop)
                desktop = this.preferredDisplayDesktop;

            // if any error, leave unmapped to new monitor, placement algorithm
            //  will find placement from the old global position
            if (!desktop)
                return;

            fileItem.temporaryMonitorIndex = desktop.monitorIndex;

            // recompute coordinates for the new monitor
            const x = fileItem._normalCoordinates[0];
            const y = fileItem._normalCoordinates[1];
            const [newlocalX, newlocalY] =
                desktop.setNormalizedCoordinates(x, y);
            const [newGlobalX, newGlobalY] =
                desktop.coordinatesLocalToGlobal(newlocalX, newlocalY);
            fileItem.temporarySavedPosition = [newGlobalX, newGlobalY];
        });
    }

    _addFilesToDesktop(fileList, storeMode) {
        let preferredDesktop = this.preferredDisplayDesktop;
        if (!preferredDesktop)
            return;
        let outOfDesktops = [];
        let notAssignedYet = [];
        let droppedFiles = [];

        // First, add those icons that have saved coordinates
        // and fit in the current desktops
        for (let fileItem of fileList) {
            if (fileItem.savedCoordinates === null) {
                if (fileItem.dropCoordinates !== null)
                    droppedFiles.push(fileItem);
                else
                    notAssignedYet.push(fileItem);
                continue;
            }

            if (fileItem.dropCoordinates !== null)
                fileItem.dropCoordinates = null;

            let [itemX, itemY] = fileItem.savedCoordinates;
            let addedToDesktop = false;

            for (let desktop of this._desktops) {
                if (desktop
                    .coordinatesBelongToThisGridWindow(itemX, itemY) &&
                    desktop.isAvailable()) {
                    addedToDesktop = true;
                    desktop
                    .addFileItemCloseTo(fileItem, itemX, itemY, storeMode);
                    break;
                }
            }

            if (!addedToDesktop)
                outOfDesktops.push(fileItem);
        }

        // Now, assign icons that have landed in changed margins, belong to
        // monitor and the window, however no longer fit on the grid as
        // they overlap margins.

        if (outOfDesktops.length) {
            this._addFilesCloseToAssignedDesktop(
                outOfDesktops,
                storeMode,
                preferredDesktop
            );
        }

        outOfDesktops = [];

        // Now assign those icons that have dropped coordinates
        for (let fileItem of droppedFiles) {
            let [x, y] = fileItem.dropCoordinates;
            storeMode = this.Enums.StoredCoordinates.OVERWRITE;
            let addedToDesktop = false;

            for (let desktop of this._desktops) {
                if (desktop.coordinatesBelongToThisGrid(x, y) &&
                    desktop.isAvailable()) {
                    fileItem.dropCoordinates = null;
                    desktop.addFileItemCloseTo(fileItem, x, y, storeMode);
                    addedToDesktop = true;
                    break;
                }
            }

            if (!addedToDesktop)
                outOfDesktops.push(fileItem);
        }

        // Now, try again assign those icons that had dropped coordinates and
        // did not fit on dropped desktop, to the preferred or closest desktop
        if (outOfDesktops.length) {
            this._addFilesCloseToAssignedDesktop(
                outOfDesktops,
                storeMode,
                preferredDesktop
            );
            outOfDesktops = [];
        }

        // Finally, assign coordinates of preferred desktop to those new icons
        // that still don't have coordinates and place on preferred desktop or
        // the next closest one
        for (let fileItem of notAssignedYet) {
            let x = preferredDesktop.gridGlobalRectangle.x;
            let y = preferredDesktop.gridGlobalRectangle.y;
            storeMode = this.Enums.StoredCoordinates.ASSIGN;

            // try first in the designated desktop
            let assigned = false;
            if (preferredDesktop.coordinatesBelongToThisGrid(x, y) &&
                preferredDesktop.isAvailable()) {
                preferredDesktop.addFileItemCloseTo(fileItem, x, y, storeMode);
                assigned = true;
            }

            if (!assigned)
                outOfDesktops.push(fileItem);
        }

        // if there was no space in the preferred desktop, place on the
        // desktop closest to preferred
        if (outOfDesktops.length) {
            this._addFilesCloseToAssignedDesktop(
                outOfDesktops,
                storeMode,
                preferredDesktop
            );
        }
    }

    _addFilesCloseToAssignedDesktop(fileList, storeMode, preferredDesktop) {
        for (let fileItem of fileList) {
            let desktopX;
            let x = desktopX = preferredDesktop.gridGlobalRectangle.x;
            let desktopY = preferredDesktop.gridGlobalRectangle.y;

            if (fileItem.savedCoordinates) {
                x = fileItem.savedCoordinates[0];
                storeMode = this.Enums.StoredCoordinates.ASSIGN;
            } else if (fileItem.droppedCoordinates) {
                x = fileItem.droppedCoordinates[0];
                storeMode = this.Enums.StoredCoordinates.OVERWRITE;
            }

            // Find the closest desktop to given position, is null
            // if not available
            const newDesktop = this.windowManager.getClosestDesktop(x);

            if (newDesktop) {
                desktopX = newDesktop.gridGlobalRectangle.x;
                desktopY = newDesktop.gridGlobalRectangle.y;

                if (fileItem.droppedCoordinates)
                    fileItem.droppedCoordinates = null;

                newDesktop
                .addFileItemCloseTo(fileItem, desktopX, desktopY, storeMode);
            } else {
                console.log('Not enough space to add icons');
            }
        }
    }

    _unstack() {
        if (this.stackInitialCoordinates && this._compositeStackList) {
            this._displayList.forEach(f => {
                f.removeFromGrid();
                if (f.isStackMarker)
                    f.onDestroy();
            });
            this._restoreStackInitialCoordinates();
            this._displayList = this._compositeStackList;
            this._compositeStackList = null;

            if (this.sortingSubMenu && this.sortingMenu) {
                this.sortingSubMenu.prepend_item(this.keepArrangedMenuItem);
                this.sortingMenu.prepend_item(this.cleanUpMenuItem);
            }

            if (this.Prefs.keepArranged) {
                this.doSorts();
            } else {
                this._addFilesToDesktop(
                    this._displayList,
                    this.Enums.StoredCoordinates.OVERWRITE
                );
            }
        }
    }

    _saveStackInitialCoordinates() {
        this.stackInitialCoordinates = [];
        for (let fileItem of this._displayList) {
            this.stackInitialCoordinates.push({
                fileName: fileItem.fileName,
                savedCoordinates: fileItem.savedCoordinates,
                _normalCoordinates: fileItem._normalCoordinates,
                _monitorIndex: fileItem._monitorIndex,
            });
        }
    }

    _transformSavedStackInitialCoordinates() {
        if (!this.stackInitialCoordinates &&
            this.stackInitialCoordinates.length)
            return;

        this._recomputeWindowPositions(this.stackInitialCoordinates);

        this.stackInitialCoordinates.forEach(o =>
            (o.savedCoordinates = o.temporarySavedPosition));
    }

    _restoreStackInitialCoordinates() {
        if (this.stackInitialCoordinates &&
            this.stackInitialCoordinates.length) {
            this._compositeStackList.forEach(fileItem => {
                this.stackInitialCoordinates.forEach(savedItem => {
                    if (savedItem.fileName === fileItem.fileName) {
                        fileItem.savedCoordinates = savedItem.savedCoordinates;
                        fileItem._normalCoordinates =
                            savedItem._normalCoordinates;
                        fileItem._monitorIndex = savedItem._monitorIndex;
                    }
                });
            });
        }

        this.stackInitialCoordinates = null;
    }

    _makeStackTopMarkerFolder(type, list) {
        let stackAttribute = type.split('/')[1];
        let fileItem = new StackItem.StackItem(
            this,
            stackAttribute,
            type,
            this.Enums.FileType.STACK_TOP
        );

        list.push(fileItem);
    }

    _sortAllFilesFromGridsByKindStacked(opts = {redisplay: false}) {
        /**
         * Looks through the generated fileItems
         */
        function determineStackTopSizeOrTime() {
            for (let item of otherFiles) {
                if (item.isStackMarker) {
                    for (let unstackitem of stackedFiles) {
                        if (item.attributeContentType ===
                            unstackitem.attributeContentType) {
                            item.size = unstackitem.fileSize;
                            item.time = unstackitem.modifiedTime;
                            break;
                        }
                    }
                }
            }
        }

        /**
         * Sorts fileItems by file size
         *
         * @param {integer} a the first file size
         * @param {integer} b the secondfile size
         */
        function bySize(a, b) {
            return  a.fileSize - b.fileSize;
        }

        /**
         * Sorts fileItems by time
         *
         * @param {integer} a the first file timestamp
         * @param {integer} b the second file timestamp
         */
        function byTime(a, b) {
            return  a._modifiedTime - b._modifiedTime;
        }

        let specialFiles = [];
        let directoryFiles = [];
        let validDesktopFiles = [];
        let otherFiles = [];
        let stackedFiles = [];
        let newFileList = [];
        let stackTopMarkerFolderList = [];
        let unstackList = this.Prefs.UnstackList;

        if (this._compositeStackList && opts.redisplay) {
            this._displayList.forEach(f => {
                if (f.isStackMarker)
                    f.onDestroy();
            });
            this._displayList = this._compositeStackList;
        }

        this._sortByName(this._displayList);

        for (let fileItem of this._displayList) {
            if (fileItem.isSpecial) {
                specialFiles.push(fileItem);
                continue;
            }

            if (fileItem.isDirectory) {
                directoryFiles.push(fileItem);
                continue;
            }

            if (fileItem._isValidDesktopFile) {
                validDesktopFiles.push(fileItem);
                continue;
            } else {
                let type = fileItem.attributeContentType;
                let stacked = false;

                for (let item of otherFiles) {
                    if (type === item.attributeContentType) {
                        stackedFiles.push(fileItem);
                        stacked = true;
                    }
                }

                if (!stacked) {
                    fileItem.isStackTop = true;
                    otherFiles.push(fileItem);
                }

                continue;
            }
        }

        for (let a of otherFiles) {
            let instack = false;

            for (let c of stackedFiles) {
                if (c.attributeContentType === a.attributeContentType) {
                    instack = true;
                    break;
                }
            }

            if (!instack)
                a.stackUnique = true;

            continue;
        }

        for (let item of otherFiles) {
            if (!item.stackUnique) {
                this._makeStackTopMarkerFolder(
                    item.attributeContentType,
                    stackTopMarkerFolderList
                );
                item.isStackTop = false;
                stackedFiles.push(item);
            }

            if (item.stackUnique)
                stackTopMarkerFolderList.push(item);

            item.updateIcon()
            .catch(e => console.error(e, 'Error loading stackMarker icon'));
        }

        otherFiles = [];
        this._sortByName(specialFiles);
        this._sortByName(directoryFiles);
        this._sortByName(validDesktopFiles);
        this._sortByKindByName(stackedFiles);
        this._sortByKindByName(stackTopMarkerFolderList);
        otherFiles.push(...specialFiles);
        otherFiles.push(...validDesktopFiles);
        otherFiles.push(...directoryFiles);
        otherFiles.push(...stackTopMarkerFolderList);

        switch (this.Prefs.sortOrder) {
        case this.Enums.SortOrder.NAME:
            this._sortByName(otherFiles);
            break;
        case this.Enums.SortOrder.DESCENDINGNAME:
            this._sortByName(otherFiles);
            otherFiles.reverse();
            this._sortByName(stackedFiles);
            stackedFiles.reverse();
            break;
        case this.Enums.SortOrder.MODIFIEDTIME:
            stackedFiles.sort(byTime);
            determineStackTopSizeOrTime();
            otherFiles.sort(byTime);
            break;
        case this.Enums.SortOrder.KIND:
            break;
        case this.Enums.SortOrder.SIZE:
            stackedFiles.sort(bySize);
            determineStackTopSizeOrTime();
            otherFiles.sort(bySize);
            break;
        default:
            break;
        }

        for (let item of otherFiles) {
            newFileList.push(item);
            let itemtype = item.attributeContentType;
            for (let unstackitem of stackedFiles) {
                if (unstackList.includes(unstackitem.attributeContentType) &&
                    (unstackitem.attributeContentType === itemtype))
                    newFileList.push(unstackitem);
            }
        }

        if (this._compositeStackList)
            this._compositeStackList = this._displayList;

        this._displayList = newFileList;
    }

    _sortByName(fileList) {
        /**
         * @param {string} a fileItem filename for A
         * @param {string} b fileItem filename for B
         */
        function byName(a, b) {
            // sort by label name instead of the the fileName or displayName so
            // that the "Home" folder is sorted in the correct order
            // alphabetical sort taking into account accent characters &
            // locale, natural language sort for numbers, ie 10.etc before 2.etc
            // other options for locale are best fit, or by specifying directly
            // in function below for translators
            return a._label.get_text()
                .localeCompare(
                    b._label.get_text(),
                    {
                        sensitivity: 'accent',
                        numeric: 'true',
                        localeMatcher: 'lookup',
                    }
                );
        }
        fileList.sort(byName);
    }

    _sortByKindByName(fileList) {
        /**
         * Sort by Kind, then by name
         *
         * @param {string} a fileItem
         * @param {string} b fileItem
         */
        function byKindByName(a, b) {
            return (
                a.attributeContentType
                    .localeCompare(b.attributeContentType) ||
                a._label.get_text()
                    .localeCompare(
                        b._label.get_text(),
                        {
                            sensitivity: 'accent',
                            numeric: 'true',
                            localeMatcher: 'lookup',
                        }
                    )
            );
        }
        fileList.sort(byKindByName);
    }

    _sortAllFilesFromGridsByName(order) {
        this._sortByName(this._displayList);
        if (order === this.Enums.SortOrder.DESCENDINGNAME)
            this._displayList.reverse();

        this._reassignFilesToDesktop();
    }

    _sortByOriginalPosition() {
        let cornerInversion = this.Prefs.StartCorner;
        if (!cornerInversion[0] && !cornerInversion[1]) {
            this._displayList.sort((a, b) =>   {
                if (a.X < b.X)
                    return -1;
                if (a.X > b.X)
                    return 1;
                if (a.Y < b.Y)
                    return -1;
                if (a.Y > b.Y)
                    return 1;
                return 0;
            });
        }
        if (cornerInversion[0] && cornerInversion[1]) {
            this._displayList.sort((a, b) =>   {
                if (a.X < b.X)
                    return 1;
                if (a.X > b.X)
                    return -1;
                if (a.Y < b.Y)
                    return 1;
                if (a.Y > b.Y)
                    return -1;
                return 0;
            });
        }
        if (cornerInversion[0] && !cornerInversion[1]) {
            this._displayList.sort((a, b) =>   {
                if (a.X < b.X)
                    return 1;
                if (a.X > b.X)
                    return -1;
                if (a.Y < b.Y)
                    return -1;
                if (a.Y > b.Y)
                    return 1;
                return 0;
            });
        }
        if (!cornerInversion[0] && cornerInversion[1]) {
            this._displayList.sort((a, b) =>   {
                if (a.X < b.X)
                    return -1;
                if (a.X > b.X)
                    return 1;
                if (a.Y < b.Y)
                    return 1;
                if (a.Y > b.Y)
                    return -1;
                return 0;
            });
        }
    }

    _sortByCurrentPosition() {
        let cornerInversion = this.Prefs.StartCorner;
        if (!cornerInversion[0] && !cornerInversion[1]) {
            this._displayList.sort((a, b) =>   {
                if (a.x < b.x)
                    return -1;
                if (a.x > b.x)
                    return 1;
                if (a.y < b.y)
                    return -1;
                if (a.y > b.y)
                    return 1;
                return 0;
            });
        }
        if (cornerInversion[0] && cornerInversion[1]) {
            this._displayList.sort((a, b) =>   {
                if (a.x < b.x)
                    return 1;
                if (a.x > b.x)
                    return -1;
                if (a.y < b.y)
                    return 1;
                if (a.y > b.y)
                    return -1;
                return 0;
            });
        }
        if (cornerInversion[0] && !cornerInversion[1]) {
            this._displayList.sort((a, b) =>   {
                if (a.x < b.x)
                    return 1;
                if (a.x > b.x)
                    return -1;
                if (a.y < b.y)
                    return -1;
                if (a.y > b.y)
                    return 1;
                return 0;
            });
        }
        if (!cornerInversion[0] && cornerInversion[1]) {
            this._displayList.sort((a, b) =>   {
                if (a.x < b.x)
                    return -1;
                if (a.x > b.x)
                    return 1;
                if (a.y < b.y)
                    return 1;
                if (a.y > b.y)
                    return -1;
                return 0;
            });
        }
    }

    _reassignFilesToDesktop() {
        if (!this.Prefs.sortSpecialFolders) {
            this._reassignFilesToDesktopPreserveSpecialFiles();
            return;
        }

        for (let fileItem of this._displayList) {
            fileItem.temporarySavedPosition = null;
            fileItem.dropCoordinates = null;
        }

        this._addFilesToDesktop(
            this._displayList,
            this.Enums.StoredCoordinates.ASSIGN
        );
    }

    _reassignFilesToDesktopPreserveSpecialFiles() {
        let specialFiles = [];
        let otherFiles = [];
        let newFileList = [];

        for (let fileItem of this._displayList) {
            if (fileItem._isSpecial) {
                specialFiles.push(fileItem);
                continue;
            }

            if (!fileItem._isSpecial) {
                otherFiles.push(fileItem);
                fileItem.temporarySavedPosition = null;
                fileItem.dropCoordinates = null;
                continue;
            }
        }

        newFileList.push(...specialFiles);
        newFileList.push(...otherFiles);

        if (this._displayList.length === newFileList.length)
            this._displayList = newFileList;

        this._addFilesToDesktop(
            this._displayList,
            this.Enums.StoredCoordinates.PRESERVE
        );
    }

    // Desktop Manager Main methods
    // ********************************************************************** */


    findFiles(text) {
        if (this._findFileWindow) {
            this._findFileWindow.present();
            return;
        }

        const activeWindow = this.mainApp.get_active_window();
        this._findFileWindow = new Gtk.Dialog({
            use_header_bar: true,
            resizable: false,
        });
        this._findFileButton =
            this._findFileWindow.add_button(_('OK'), Gtk.ResponseType.OK);
        this._findFileButton.sensitive = false;
        this._findFileWindow.add_button(_('Cancel'), Gtk.ResponseType.CANCEL);
        this._findFileWindow.set_modal(true);
        this._findFileWindow.set_title(_('Find Files on Desktop'));
        const modal = true;
        this.DesktopIconsUtil
        .windowHidePagerTaskbarModal(this._findFileWindow, modal);
        this._findFileWindow.set_transient_for(activeWindow);
        let contentArea = this._findFileWindow.get_content_area();
        this._findFileTextArea = new Gtk.Entry();
        this._findFileTextArea.set_margin_top(5);
        this._findFileTextArea.set_margin_bottom(5);
        this._findFileTextArea.set_margin_start(5);
        this._findFileTextArea.set_margin_end(5);
        contentArea.append(this._findFileTextArea);
        contentArea.set_homogeneous(true);
        contentArea.set_baseline_position(Gtk.BaselinePosition.CENTER);

        this._findFileTextArea.connect('activate', () => {
            if (this._findFileButton.sensitive)
                this._findFileWindow.response(Gtk.ResponseType.OK);
        });

        this._findFileTextArea.connect('changed', () => {
            let context = this._findFileTextArea.get_style_context();

            if (this._scanForFiles(this._findFileTextArea.text, true)) {
                this._findFileButton.sensitive = true;

                if (context.has_class('not-found'))
                    context.remove_class('not-found');
            } else {
                this._findFileButton.sensitive = false;
                this._findFileTextArea.error_bell();

                if (!context.has_class('not-found'))
                    context.add_class('not-found');
            }

            this.searchEventTime = GLib.get_monotonic_time();
        });

        this._findFileTextArea.grab_focus_without_selecting();

        if (text) {
            this._findFileTextArea.set_text(text);
            this._findFileTextArea.set_position(text.length);
        } else {
            this._scanForFiles(null);
        }

        this._findFileWindow.show();

        this.mainApp.activate_action('textEntryAccelsTurnOff', null);

        this._findFileWindow.connect('close', () => {
            this._findFileWindow.response(Gtk.ResponseType.CANCEL);
        });

        this._findFileWindow.connect('response', (actor, retval) => {
            if (retval === Gtk.ResponseType.CANCEL)
                this.unselectAll();

            this.mainApp.activate_action('textEntryAccelsTurnOn', null);
            this._findFileWindow.destroy();
            this._findFileWindow = null;
        });
    }

    _scanForFiles(text, setselected) {
        let found = [];
        if (text && (text !== '')) {
            const lowerCaseText = text.toLowerCase();
            found =
                this._displayList.filter(
                    f => {
                        const lowerCaseFilename = f.fileName.toLowerCase();
                        const lowerCaseLabel =
                            f._label.get_text().toLowerCase();

                        return (
                            lowerCaseFilename.includes(lowerCaseText) ||
                            lowerCaseLabel.includes(lowerCaseText)
                        );
                    }
                );
        }

        if (found.length !== 0) {
            if (setselected) {
                this.unselectAll();
                found.map(f => f.setSelected());
            }
            return true;
        } else {
            return false;
        }
    }

    sortAllFilesFromGridsByPosition() {
        if (this.Prefs.keepArranged)
            return;

        this._displayList.map(f => f.removeFromGrid({callOnDestroy: false}));
        this._sortByCurrentPosition();
        this._reassignFilesToDesktop();
    }

    _sortAllFilesFromGridsByModifiedTime() {
        /**
         * @param {integer} a fileItem file modified time
         * @param {integer} b fileItem file modified time
         */
        function byTime(a, b) {
            return  a._modifiedTime - b._modifiedTime;
        }
        this._displayList.sort(byTime);
        this._reassignFilesToDesktop();
    }

    _sortAllFilesFromGridsBySize() {
        /**
         * @param {integer} a fileItem fileSize
         * @param {integer} b fileItem fileSize
         */
        function bySize(a, b) {
            return  a.fileSize - b.fileSize;
        }
        this._displayList.sort(bySize);
        this._reassignFilesToDesktop();
    }

    _sortAllFilesFromGridsByKind() {
        let specialFiles = [];
        let directoryFiles = [];
        let validDesktopFiles = [];
        let otherFiles = [];
        let newFileList = [];
        for (let fileItem of this._displayList) {
            if (fileItem._isSpecial) {
                specialFiles.push(fileItem);
                continue;
            }
            if (fileItem._isDirectory) {
                directoryFiles.push(fileItem);
                continue;
            }
            if (fileItem._isValidDesktopFile) {
                validDesktopFiles.push(fileItem);
                continue;
            } else {
                otherFiles.push(fileItem);
                continue;
            }
        }
        this._sortByName(specialFiles);
        this._sortByName(directoryFiles);
        this._sortByName(validDesktopFiles);
        this._sortByKindByName(otherFiles);
        newFileList.push(...specialFiles);
        newFileList.push(...validDesktopFiles);
        newFileList.push(...directoryFiles);
        newFileList.push(...otherFiles);
        if (this._displayList.length === newFileList.length)
            this._displayList = newFileList;

        this._reassignFilesToDesktop();
    }

    doSorts(opts = {redisplay: false}) {
        if (opts.redisplay)
            this._displayList.map(f => f.removeFromGrid());

        switch (this.Prefs.sortOrder) {
        case this.Enums.SortOrder.NAME:
            this._sortAllFilesFromGridsByName();
            break;
        case this.Enums.SortOrder.DESCENDINGNAME:
            this._sortAllFilesFromGridsByName(
                this.Enums.SortOrder.DESCENDINGNAME);
            break;
        case this.Enums.SortOrder.MODIFIEDTIME:
            this._sortAllFilesFromGridsByModifiedTime();
            break;
        case this.Enums.SortOrder.KIND:
            this._sortAllFilesFromGridsByKind();
            break;
        case this.Enums.SortOrder.SIZE:
            this._sortAllFilesFromGridsBySize();
            break;
        default:
            this._addFilesToDesktop(
                this._displayList,
                this.Enums.StoredCoordinates.PRESERVE
            );
            break;
        }
    }

    doStacks(opts = {redisplay: false}) {
        if (opts.redisplay) {
            for (let fileItem of this._displayList)
                fileItem.removeFromGrid();
        }

        if (!this.stackInitialCoordinates && !this._compositeStackList) {
            this._compositeStackList = [];
            this._saveStackInitialCoordinates();
            if (this.sortingSubMenu && this.sortingMenu) {
                this.sortingSubMenu.remove(0);
                this.sortingMenu.remove(0);
            }
            opts.redisplay = false;
        }

        if ((opts.monitorschanged ||
            opts.initialRead) &&
            this.stackInitialCoordinates)
            this._transformSavedStackInitialCoordinates();


        this._sortAllFilesFromGridsByKindStacked(opts);

        this._reassignFilesToDesktop();
    }

    unselectAll() {
        this._displayList.map(f => f.unsetSelected());
        this.fileItemMenu.activeFileItem = null;
    }

    getCurrentSelection() {
        const selectedList = this._displayList.filter(f => f.isSelected);

        if (selectedList.length)
            return selectedList;

        return null;
    }

    getCurrentSelectionAsUri() {
        return this.getCurrentSelection()?.map(f => f.uri);
    }

    getNumberOfSelectedItems() {
        const count = this.getCurrentSelection();

        if (count)
            return count.length;

        return 0;
    }

    checkIfSpecialFilesAreSelected() {
        for (let item of this._displayList) {
            if (item.isSelected && item.isSpecial)
                return true;
        }

        return false;
    }

    checkIfDirectoryIsSelected() {
        for (let item of this._displayList) {
            if (item.isSelected && item.isDirectory)
                return true;
        }

        return false;
    }

    async doRename(fileItem, allowReturnOnSameName = false) {
        const selection = this.getCurrentSelection();

        if (!(selection && (selection.length === 1)))
            return;

        if (fileItem === null) {
            fileItem = selection[0];
            allowReturnOnSameName = false;
        }

        if (!fileItem.canRename)
            return;

        if (!this._renameWindow) {
            this.mainApp.activate_action('textEntryAccelsTurnOff', null);

            if (!this.newItemDoRename)
                this.newItemDoRename = new Set();

            this.newItemDoRename.add(fileItem.fileName);

            if (this.desktopMenuManager.popupmenu) {
                await this.desktopMenuManager.menuclosed()
                    .catch(e => logError(e));
            }

            if (this.fileItemMenu.popupmenu)
                await this.fileItemMenu.menuclosed().catch(e => logError(e));

            this._renameWindow = new AskRenamePopup.AskRenamePopup(
                fileItem,
                allowReturnOnSameName,
                () => {
                    this.mainApp.get_active_window().grab_focus();
                    this.mainApp.activate_action('textEntryAccelsTurnOn', null);
                    if (this.newItemDoRename)
                        this.newItemDoRename.delete(fileItem.fileName);
                    this._renameWindow = null;
                },
                this.dragManager.setPendingDropCoordinates.bind(this),
                {
                    FileUtils: this.FileUtils,
                    DesktopIconsUtil: this.DesktopIconsUtil,
                    DBusUtils: this.DBusUtils,
                }
            );
        }
    }

    async doNewFolder(
        position = null,
        suggestedName = null,
        opts = {rename: true}
    ) {
        this.unselectAll();

        if (!position)
            position = [this._clickX, this._clickY];


        const baseName = suggestedName ? suggestedName :  _('New Folder');
        let newName = this.desktopMonitor.getDesktopUniqueFileName(baseName);

        if (newName) {
            const dir = this._desktopDir.get_child(newName);

            try {
                await dir.make_directory_async(GLib.PRIORITY_DEFAULT, null);

                const info = new Gio.FileInfo();
                info.set_attribute_string(
                    'metadata::nautilus-drop-position',
                    `${position.join(',')}`
                );
                info.set_attribute_string(
                    'metadata::desktop-icon-position',
                    ''
                );
                info.set_attribute_uint32(Gio.FILE_ATTRIBUTE_UNIX_MODE, 0o700);

                try {
                    await dir.set_attributes_async(info,
                        Gio.FileQueryInfoFlags.NONE,
                        GLib.PRIORITY_LOW,
                        null);
                } catch (e) {
                    console.error(
                        e, `Failed to set attributes to ${dir.get_path()}`);
                }
            } catch (e) {
                if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND))
                    this._performSanityChecks();
                else
                    console.error(e, `Failed to create folder ${e.message}`);
                const header = _('Folder Creation Failed');
                const text = _('Could not create folder');
                this.dbusManager.doNotify(header, text);
                if (position || suggestedName)
                    return null;

                return null;
            }

            if (opts.rename) {
                if (!this.newItemDoRename)
                    this.newItemDoRename = new Set();

                this.newItemDoRename.add(newName);
            }

            if (position || suggestedName)
                return dir.get_uri();
        }

        return null;
    }

    async redrawDesktop() {
        // fileList is not changed, we just need to render the desktop again
        // with changes in icon color, emblem, appearance, theme change etc.
        const opts = {initialRead: false, redisplay: true};
        const fileList = this.desktopMonitor.fileList;

        await this._drawDesktop(fileList, opts).catch(e => {
            console.error(
                `Error while redrawing desktop: ${e.message}\n${e.stack}`
            );
        });
    }

    async reLoadDesktop() {
        await this.desktopMonitor.reLoadFileList();
    }

    async refreshDesktop() {
        // fileList is changed, we need to render the desktop again
        // with latest fileList from the desktopMonitor. The position of the
        // icons is also recomputed from the normalized coordinates.
        const opts = {initialRead: true};
        const fileList = this.desktopMonitor.fileList;

        await this._drawDesktop(fileList, opts).catch(e => {
            console.error(`Error while refreshing desktop: ${e.message}`);
        });
    }

    async reFrameDesktop(opts) {
        // fileList is not changed, grids changed, monitor added, removed,
        // monitor geometry, zoom, or index changed.
        // We need to recompute the position of the icons
        // from the normalized coordinates and redraw the desktop and reassign
        // the icons to the correct grid and monitors
        const fileList = this.desktopMonitor.fileList;

        await this._drawDesktop(fileList, opts).catch(e => {
            console.error(`Error while reframing desktop: ${e.message}`);
        });
    }

    onMutterSettingsChanged() {
        this.windowManager.requestGeometryUpdate();
    }

    async onGtkSettingsChanged() {
        await this.desktopMonitor.getFileList();
        await this.reLoadDesktop().catch(e => {
            console.log('Exception while updating desktop after the hidden ' +
                `settings changed: ${e.message}\n${e.stack}`);
        });
        this.desktopMenuManager.updateTemplates();
    }

    onKeepArrangedChanged() {
        if (this.Prefs.keepArranged)
            this.doSorts({redisplay: true});
    }

    onUnstackedTypesChanged() {
        if (this.Prefs.keepStacked)
            this.doStacks({redisplay: true});
    }

    onkeepStackedChanged() {
        if (!this.Prefs.keepStacked)
            this._unstack();
        else
            this.doStacks({redisplay: true});
    }

    onSortOrderChanged() {
        if (this.Prefs.keepStacked)
            this.doStacks({redisplay: true});
        else
            this.doSorts({redisplay: true});
    }

    onIconSizeChanged() {
        this._displayList.forEach(x => x.removeFromGrid());
        for (let desktop of this._desktops)
            desktop.resizeGrid();
        this.reLoadDesktop().catch(e => {
            console.log('Exception while reloading desktop after icon ' +
                `size change: ${e.message}\n${e.stack}`);
        });
    }

    // Getters and Setters

    get _desktopDir() {
        return this.desktopMonitor.desktopDir;
    }

    get fractionalScaling() {
        return this.Prefs.fractionalScaling;
    }

    set fractionalScaling(boolean) {
        this.Prefs.fractionalScaling = boolean;
    }

    get _desktops() {
        return this.windowManager.desktops;
    }

    get _primaryMonitorIndex() {
        return this.windowManager.primaryMonitorIndex;
    }

    get _priorPrimaryMonitorIndex() {
        return this.windowManager.priorPrimaryMonitorIndex;
    }

    get preferredDisplayDesktop() {
        return this.windowManager.preferredDisplayDesktop;
    }

    get templatesMonitor() {
        return this.desktopActions.templatesMonitor;
    }

    get currentWorkingList() {
        let currentCompleteList;
        if (this._compositeStackList && (this._compositeStackList.length > 0))
            currentCompleteList = this._compositeStackList;
        else
            currentCompleteList = this._displayList;

        return currentCompleteList;
    }

    get activeFileItem() {
        return this.fileItemMenu.activeFileItem;
    }

    set activeFileItem(fileItem) {
        this.fileItemMenu.activeFileItem = fileItem;
    }

    get pendingDropFiles() {
        return this.dragManager.pendingDropFiles;
    }

    set pendingDropFiles(object) {
        this.dragManager.pendingDropFiles = object;
    }

    get pendingSelfCopyFiles() {
        return this.dragManager.pendingSelfCopyFiles;
    }

    set pendingSelfCopyFiles(object) {
        this.dragManager.pendingSelfCopyFiles = object;
    }

    get writableByOthers() {
        return this.desktopMonitor._writableByOthers;
    }
};
