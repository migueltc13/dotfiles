/* DING: Desktop Icons New Generation for GNOME Shell
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

import {Gdk, Gio, GLib, Gtk} from '../dependencies/gi.js';
import {_} from '../dependencies/gettext.js';

export {DesktopActions};
export {DesktopBackgroundMenu};

const DesktopActions = class {
    constructor(desktopManager) {
        this._desktopManager = desktopManager;
        this._Prefs = desktopManager.Prefs;
        this._mainApp = desktopManager.mainApp;
        this._DBusUtils = desktopManager.DBusUtils;
        this._dbusManager = desktopManager.dbusManager;
        this._dragManager = desktopManager.dragManager;
        this._DesktopIconsUtil = desktopManager.DesktopIconsUtil;
        this._fileItemMenu = desktopManager.fileItemMenu;
        this._Enums = desktopManager.Enums;
        this._desktopMonitor = desktopManager.desktopMonitor;
        this._windowManager = desktopManager.windowManager;
        this._isCut = false;
        this._clipboardFiles = null;
        this._intDBusSignalMonitoring();
        this._createMenuActionGroup();
    }

    // Create the menu action group
    // and add the actions to the main app
    // and set the accelerators
    // for the actions

    _createMenuActionGroup() {
        const newFolder = Gio.SimpleAction.new('doNewFolder', null);
        newFolder.connect('activate', () => {
            this._desktopManager.doNewFolder().catch(e => console.error(e));
        });
        this._mainApp.add_action(newFolder);

        this.doPasteSimpleAction = Gio.SimpleAction.new('doPaste', null);
        this.doPasteSimpleAction.connect(
            'activate',
            async () => {
                try {
                    if (!(this._desktopManager.popupmenu ||
                        this._desktopManager.fileItemMenu.popupmenu))
                        await this._updateClipboard().catch(e => logError(e));

                    this._doPaste();
                } catch (e) {
                    console.error(e, 'Paste action failed');
                }
            }
        );
        this._mainApp.add_action(this.doPasteSimpleAction);

        this.doUndoSimpleAction = Gio.SimpleAction.new('doUndo', null);
        this.doUndoSimpleAction.connect(
            'activate',
            () => this._doUndo()
        );
        this._mainApp.add_action(this.doUndoSimpleAction);

        this.doRedoSimpleAction = Gio.SimpleAction.new('doRedo', null);
        this.doRedoSimpleAction.connect(
            'activate',
            () => this._doRedo()
        );
        this._mainApp.add_action(this.doRedoSimpleAction);

        const selectAll = Gio.SimpleAction.new('selectAll', null);
        selectAll.connect(
            'activate',
            () => this._selectAll()
        );
        this._mainApp.add_action(selectAll);

        const showDesktopInFiles =
            Gio.SimpleAction.new('showDesktopInFiles', null);
        showDesktopInFiles.connect(
            'activate',
            () => this._onOpenDesktopInFilesClicked().catch(e => logError(e))
        );
        this._mainApp.add_action(showDesktopInFiles);

        const openDesktopInTerminal = Gio.SimpleAction.new('openDesktopInTerminal', null);
        openDesktopInTerminal.connect(
            'activate',
            this._onOpenTerminalClicked.bind(this)
        );
        this._mainApp.add_action(openDesktopInTerminal);

        const changeBackGround = Gio.SimpleAction.new('changeBackGround', null);
        changeBackGround.connect(
            'activate',
            () => {
                const desktopFile =
                    Gio.DesktopAppInfo.new('gnome-background-panel.desktop');
                const context =
                    Gdk.Display.get_default().get_app_launch_context();
                context.set_timestamp(Gdk.CURRENT_TIME);
                desktopFile.launch([], context);
            }
        );
        this._mainApp.add_action(changeBackGround);

        const changeDisplaySettings =
            Gio.SimpleAction.new('changeDisplaySettings', null);
        changeDisplaySettings.connect(
            'activate',
            () => {
                const desktopFile =
                    Gio.DesktopAppInfo.new('gnome-display-panel.desktop');
                const context =
                    Gdk.Display.get_default().get_app_launch_context();
                context.set_timestamp(Gdk.CURRENT_TIME);
                desktopFile.launch([], context);
            }
        );
        this._mainApp.add_action(changeDisplaySettings);

        const changeDesktopIconSettings =
            Gio.SimpleAction.new('changeDesktopIconSettings', null);
        changeDesktopIconSettings.connect(
            'activate',
            this._showPreferences.bind(this)
        );
        this._mainApp.add_action(changeDesktopIconSettings);

        const cleanUpIconsAction =
            Gio.SimpleAction.new('cleanUpIcons', null);
        cleanUpIconsAction.connect(
            'activate',
            () => this._desktopManager.sortAllFilesFromGridsByPosition()
        );
        this._mainApp.add_action(cleanUpIconsAction);

        const keepArrangedAction =
            this._Prefs.desktopSettings.create_action('keep-arranged');
        this._mainApp.add_action(keepArrangedAction);
        this._Prefs.desktopSettings.bind(
            'keep-arranged',
            cleanUpIconsAction,
            'enabled',
            16
        );

        this._mainApp.add_action(
            this._Prefs.desktopSettings.create_action('keep-stacked'));

        this._mainApp.add_action(
            this._Prefs.desktopSettings.create_action('sort-special-folders'));

        const radioArrangeAction = Gio.SimpleAction.new_stateful(
            'arrangeaction',
            GLib.VariantType.new('s'),
            GLib.Variant.new_string(this._Prefs.desktopSettings.get_string(
                this._Enums.SortOrder.ORDER))
        );
        radioArrangeAction.connect('change-state',
            this._syncArrangeOrder.bind(this));
        this._mainApp.add_action(radioArrangeAction);
        this.arrangeAction = radioArrangeAction;

        const arrangeByName = Gio.SimpleAction.new('arrangeByName', null);
        arrangeByName.connect(
            'activate',
            () => this._mainApp.activate_action(
                'arrangeaction',
                new GLib.Variant('s', 'NAME')
            )
        );
        this._mainApp.add_action(arrangeByName);

        const arrangeByDescendingName =
            Gio.SimpleAction.new('arrangeByDescendingName', null);
        arrangeByDescendingName.connect(
            'activate',
            () => this._mainApp.activate_action(
                'arrangeaction',
                new GLib.Variant('s', 'DESCENDINGNAME')
            )
        );
        this._mainApp.add_action(arrangeByDescendingName);

        const arrangeByModifiedTime =
            Gio.SimpleAction.new('arrangeByModifiedTime', null);
        arrangeByModifiedTime.connect(
            'activate',
            () => this._mainApp.activate_action(
                'arrangeaction',
                new GLib.Variant('s', 'MODIFIEDTIME')
            )
        );
        this._mainApp.add_action(arrangeByModifiedTime);

        const arrangeByKind = Gio.SimpleAction.new('arrangeByKind', null);
        arrangeByKind.connect(
            'activate',
            () => this._mainApp.activate_action(
                'arrangeaction',
                new GLib.Variant('s', 'KIND')
            )
        );
        this._mainApp.add_action(arrangeByKind);

        const arrangeBySize = Gio.SimpleAction.new('arrangeBySize', null);
        arrangeBySize.connect(
            'activate',
            () => this._mainApp.activate_action(
                'arrangeaction',
                new GLib.Variant('s', 'SIZE')
            )
        );
        this._mainApp.add_action(arrangeBySize);

        const findFilesAction = Gio.SimpleAction.new('findFiles', null);
        findFilesAction.connect(
            'activate',
            () =>  this._desktopManager.findFiles(null)
        );
        this._mainApp.add_action(findFilesAction);

        const updateDesktop = Gio.SimpleAction.new('updateDesktop', null);
        updateDesktop.connect(
            'activate',
            async () => {
                await this._desktopManager.reLoadDesktop().catch(e => {
                    console.log(
                        `Exception while updating desktop after pressing "F5":
                        ${e.message}\n${e.stack}`);
                });
            }
        );
        this._mainApp.add_action(updateDesktop);

        const showHideHiddenFiles =
            Gio.SimpleAction.new('showHideHiddenFiles', null);
        showHideHiddenFiles.connect(
            'activate',
            () => {
                this._Prefs.gtkSettings.set_boolean('show-hidden',
                    !this._Prefs.showHidden);
            }
        );
        this._mainApp.add_action(showHideHiddenFiles);

        const unselectAll = Gio.SimpleAction.new('unselectAll', null);
        unselectAll.connect(
            'activate',
            () => {
                this._desktopManager.unselectAll();
                if (this.searchString)
                    this.searchString = null;
            }
        );
        this._mainApp.add_action(unselectAll);

        const previewAction = Gio.SimpleAction.new('previewAction', null);
        previewAction.connect('activate', () => {
            if (this._desktopManager.popupmenu ||
                this._desktopManager.fileItemMenu.popupmenu ||
                !this.activeFileItem)
                return;
            const RemoteOperation =
                this._DBusUtils.RemoteFileOperations;
            RemoteOperation.ShowFileRemote(this.activeFileItem.uri, 0, true);
        });
        this._mainApp.add_action(previewAction);

        const chooseIconLeft = Gio.SimpleAction.new('chooseIconLeft', null);
        chooseIconLeft.connect('activate', () => {
            this._selectFileItemInDirection(Gdk.KEY_Left);
        });
        this._mainApp.add_action(chooseIconLeft);

        const chooseIconRight = Gio.SimpleAction.new('chooseIconRight', null);
        chooseIconRight.connect('activate', () => {
            this._selectFileItemInDirection(Gdk.KEY_Right);
        });
        this._mainApp.add_action(chooseIconRight);

        const chooseIconUp = Gio.SimpleAction.new('chooseIconUp', null);
        chooseIconUp.connect('activate', () => {
            this._selectFileItemInDirection(Gdk.KEY_Up);
        });
        this._mainApp.add_action(chooseIconUp);

        const chooseIconDown = Gio.SimpleAction.new('chooseIconDown', null);
        chooseIconDown.connect('activate', () => {
            this._selectFileItemInDirection(Gdk.KEY_Down);
        });
        this._mainApp.add_action(chooseIconDown);

        const menuKeyPressed = Gio.SimpleAction.new('menuKeyPressed', null);
        menuKeyPressed.connect('activate', () => {
            this._menuKeyPressed();
        });
        this._mainApp.add_action(menuKeyPressed);

        const displayShellBackgroundMenu =
            Gio.SimpleAction.new('displayShellBackgroundMenu', null);
        displayShellBackgroundMenu.connect('activate', () => {
            this._DBusUtils.RemoteExtensionControl.showShellBackgroundMenu();
        });
        this._mainApp.add_action(displayShellBackgroundMenu);

        const createDesktopShortcut = new Gio.SimpleAction({
            name: 'createDesktopShortcut',
            parameter_type: new GLib.VariantType('a{sv}'),
        });
        createDesktopShortcut.connect('activate', (action, parameter) => {
            this._createDesktopShortcut(parameter.recursiveUnpack());
        });
        this._mainApp.add_action(createDesktopShortcut);

        const textEntryAccelsTurnOff =
            Gio.SimpleAction.new('textEntryAccelsTurnOff', null);
        textEntryAccelsTurnOff.connect('activate', () => {
            this._textEntryAccelsTurnOff();
        });
        this._mainApp.add_action(textEntryAccelsTurnOff);

        const newDocument =
            Gio.SimpleAction.new('newDocument', new GLib.VariantType('s'));
        newDocument.connect('activate', (action, parameter) => {
            this._newDocument(parameter.deep_unpack());
        });
        this._mainApp.add_action(newDocument);

        const showShortcutViewer =
            Gio.SimpleAction.new('showShortcutViewer', null);
        showShortcutViewer.connect('activate', () => {
            this._showShortcutViewer();
        });
        this._mainApp.add_action(showShortcutViewer);

        const toggleVisibility =
            Gio.SimpleAction.new('toggleVisibility', null);
        toggleVisibility.connect('activate', () => {
            this._windowManager.toggleVisibility();
        });
        this._mainApp.add_action(toggleVisibility);
    }

    _updateClipboard() {
        return new Promise(resolve => {
            const clipboard = Gdk.Display.get_default().get_clipboard();
            this._isCut = false;
            this._clipboardFiles = null;
            /*
             * Before Gnome Shell 40, St API couldn't access binary data in the
             * clipboard, only text data. Also, the original Desktop Icons was a
             * pure extension, so it was limited to what Clutter and St offered.
             * That was the reason why Nautilus accepted a text format for CUT
             *  and COPY operations in the form
             *
             *     x-special/nautilus-clipboard
             *     OPERATION
             *     FILE_URI
             *     [FILE_URI]
             *     [...]
             *
             * In Gnome Shell 40, St was enhanced and now it supports binary
             * data; that's why Nautilus migrated to a binary format identified
             * by the atom 'x-special/gnome-copied-files', where the CUT or COPY
             *  operation is shared.
             *
             * To maintain compatibility, we first check if there's binary data
             * in that atom, and if not, we check if there is text data in the
             *  old format.
             */
            let text = null;
            const textDecoder = new TextDecoder();
            if (clipboard.get_formats()) {
                const mimetypes = clipboard.get_formats().to_string();
                if (mimetypes.includes('x-special/gnome-copied-files')) {
                    try {
                        clipboard.read_async(['x-special/gnome-copied-files'],
                            GLib.PRIORITY_DEFAULT,
                            null, (actor, result) => {
                                try {
                                    const success = actor.read_finish(result);

                                    const bytes =
                                        success[0].read_bytes(8192, null);

                                    text = textDecoder.decode(bytes.get_data());

                                    text =
                                        'x-special/nautilus-clipboard\n' +
                                        `${text}\n`;

                                    this._setClipboardContent(text);
                                    resolve(true);
                                } catch (e) {
                                    console.log(
                                        'Exception while reading clipboard:' +
                                        `${e.message}\n${e.stack}`
                                    );

                                    this._setClipboardContent(text);
                                    resolve(false);
                                }
                            });
                    } catch (e) {
                        console.log(
                            `Exception while reading clipboard mimetype
                            x-special/gnome-copied-files:
                            ${e.message}\n${e.stack}`
                        );

                        this._setClipboardContent(text);
                        resolve(false);
                    }
                } else if (mimetypes.includes('text/plain')) {
                    try {
                        clipboard.read_async(['text/plain'],
                            GLib.PRIORITY_DEFAULT,
                            null,
                            (actor, result) => {
                                try {
                                    const success = actor.read_finish(result);

                                    const bytes =
                                        success[0].read_bytes(8192, null);

                                    text = textDecoder.decode(bytes.get_data());

                                    if (text && !text.endsWith('\n'))
                                        text += '\n';

                                    this._setClipboardContent(text);
                                    resolve(true);
                                } catch (e) {
                                    this._setClipboardContent(text);
                                    resolve(false);
                                }
                            });
                    } catch (e) {
                        console.log(
                            'Exception while reading clipboard media-type ' +
                            `"text/plain": ${e.message}\n${e.stack}`
                        );

                        this._setClipboardContent(text);
                        resolve(false);
                    }
                } else {
                    this._setClipboardContent(text);
                    resolve(false);
                }
            } else {
                this._setClipboardContent(text);
                resolve(false);
            }
        });
    }

    _intDBusSignalMonitoring() {
        const fileOperationsManager =
            this._DBusUtils.RemoteFileOperations.fileOperationsManager;

        fileOperationsManager.connectToProxy(
            'g-properties-changed',
            this._undoStatusChanged.bind(this)
        );

        fileOperationsManager.connect('changed-status',
            (actor, available) => {
                if (available)
                    this._syncUndoRedo();
                else
                    this._syncUndoRedo(true);
            }
        );

        if (fileOperationsManager.isAvailable)
            this._syncUndoRedo();
    }

    _setClipboardContent(text) {
        const [valid, isCut, files] = this._parseClipboardText(text);
        if (valid) {
            this._isCut = isCut;
            this._clipboardFiles = files;
        }
        this.doPasteSimpleAction.set_enabled(valid);
    }

    _parseClipboardText(text) {
        if (text === null)
            return [false, false, null];

        const lines = text.split('\n');
        const [mime, action, ...files] = lines;

        if (mime !== 'x-special/nautilus-clipboard')
            return [false, false, null];
        if (!['copy', 'cut'].includes(action))
            return [false, false, null];
        const isCut = action === 'cut';

        /* Last line is empty due to the split */
        if (files.length <= 1)
            return [false, false, null];
        /* Remove last line */
        files.pop();

        return [true, isCut, files];
    }

    _syncUndoRedo(hide = false) {
        if (hide) {
            this.doUndoSimpleAction.set_enabled(false);
            this.doRedoSimpleAction.set_enabled(false);
            return;
        }
        switch (this._DBusUtils.RemoteFileOperations.UndoStatus()) {
        case this._Enums.UndoStatus.UNDO:
            this.doUndoSimpleAction.set_enabled(true);
            this.doRedoSimpleAction.set_enabled(false);
            break;
        case this._Enums.UndoStatus.REDO:
            this.doUndoSimpleAction.set_enabled(false);
            this.doRedoSimpleAction.set_enabled(true);
            break;
        default:
            this.doUndoSimpleAction.set_enabled(false);
            this.doRedoSimpleAction.set_enabled(false);
            break;
        }
    }

    _undoStatusChanged(proxy, properties) {
        if ('UndoStatus' in properties.deep_unpack())
            this._syncUndoRedo();
    }

    _doUndo() {
        this._DBusUtils.RemoteFileOperations.UndoRemote();
    }

    _doRedo() {
        this._DBusUtils.RemoteFileOperations.RedoRemote();
    }

    _doPaste() {
        if (this._clipboardFiles === null)
            return;
        if (!this._clickX && !this._clickY)
            return;
        const pasteCoordinates = [this._clickX, this._clickY];
        const desktopDir = this._desktopDir.get_uri();
        const remoteOperations = this._DBusUtils.RemoteFileOperations;

        if (this._isCut) {
            // This pops up GNOME Files error dialog, which is what we want.
            remoteOperations.MoveURIsRemote(this._clipboardFiles, desktopDir);
        } else {
            this._dragManager.clearFileCoordinates(
                this._clipboardFiles,
                pasteCoordinates,
                {doCopy: true}
            );
            remoteOperations.CopyURIsRemote(this._clipboardFiles, desktopDir);
        }
    }

    _selectAll() {
        for (let fileItem of this._displayList) {
            if (fileItem.isAllSelectable)
                fileItem.setSelected();
        }
    }

    async _onOpenDesktopInFilesClicked() {
        const context = Gdk.Display.get_default().get_app_launch_context();
        context.set_timestamp(Gdk.CURRENT_TIME);
        try {
            await Gio.AppInfo.launch_default_for_uri_async(
                this._desktopDir.get_uri(), context, null);
        } catch (e) {
            if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)) {
                const header =
                    _('Unable to open Desktop in Gnome Files');
                const text =
            _(`Desktop Folder ${this._desktopDir.get_path()} does not exist`);
                this._dbusManager.doNotify(header, text);
                return;
            }
            console.error(
                e, `Error opening desktop in GNOME Files: ${e.message}`
            );
        }
    }

    _onOpenTerminalClicked() {
        this._desktopManager.fileItemActions.launchTerminal();
    }

    _showPreferences() {
        if (this.preferencesWindow) {
            this._dbusManager.doNotify(
                _('Preferences Window is Open'),
                _('This Window is open. Please switch to the active window.')
            );
            return;
        }

        this.preferencesWindow = this._Prefs.getAdwPreferencesWindow();
        this.preferencesWindow.connect('close-request', () => {
            this.preferencesWindow = null;
        });
        this.preferencesWindow.set_title(_('Settings'));
        // Do not make modal or skip-taskbar as we have a .desktop icon
        // showing up in the dock for the window to assist navigation.
        // const modal = true;
        // this._DesktopIconsUtil.windowHidePagerTaskbarModal(
        //     this.preferencesWindow, modal);
        this.preferencesWindow.show();
    }

    _syncArrangeOrder(action, newValue) {
        if (!action.enabled)
            return;

        const currentSetting = this._Prefs.desktopSettings.get_string(
            this._Enums.SortOrder.ORDER);
        const newValueString = newValue.deep_unpack();

        if (currentSetting !== newValueString) {
            action.set_enabled(false);
            this._Prefs.desktopSettings.set_string(
                this._Enums.SortOrder.ORDER, newValueString);
            action.set_enabled(true);
        }

        const currentState = action.get_state().deep_unpack();
        if (currentState !== newValueString)
            action.set_state(newValue);

        this._desktopManager.onSortOrderChanged();
    }

    _selectFileItemInDirection(symbol) {
        var index;
        var multiplier;
        let selection = this.currentSelection;
        if (!selection) {
            if (this.activeFileItem && this.activeFileItem.isStackMarker)
                selection = [this.activeFileItem];
            else
                selection = this._displayList;
        }
        if (!selection)
            return false;

        let selected = selection[0];
        let selectedCoordinates = selected.getCoordinates();
        if (!this.isShift)
            this._desktopManager.unselectAll();
        if (selection.length > 1) {
            for (let item of selection) {
                let itemCoordinates = item.getCoordinates();
                if (itemCoordinates[0] > selectedCoordinates[0])
                    continue;

                if (symbol === Gdk.KEY_Down || symbol === Gdk.KEY_Right) {
                    if ((itemCoordinates[0] > selectedCoordinates[0]) ||
                        (itemCoordinates[1] > selectedCoordinates[1])) {
                        selected = item;
                        selectedCoordinates = itemCoordinates;
                        continue;
                    }
                } else if ((itemCoordinates[0] < selectedCoordinates[0]) ||
                        (itemCoordinates[1] < selectedCoordinates[1])) {
                    selected = item;
                    selectedCoordinates = itemCoordinates;
                    continue;
                }
            }
        }
        switch (symbol) {
        case Gdk.KEY_Left:
            index = 0;
            multiplier = -1;
            break;
        case Gdk.KEY_Right:
            index = 0;
            multiplier = 1;
            break;
        case Gdk.KEY_Up:
            index = 1;
            multiplier = -1;
            break;
        case Gdk.KEY_Down:
            index = 1;
            multiplier = 1;
            break;
        }
        let newDistance = null;
        let newItem = null;
        for (let item of this._displayList) {
            let itemCoordinates = item.getCoordinates();
            if ((selectedCoordinates[index] * multiplier) >=
                (itemCoordinates[index] * multiplier))
                continue;

            let distance =
                Math.pow(
                    selectedCoordinates[0] - itemCoordinates[0], 2) +
                Math.pow(
                    selectedCoordinates[1] -  itemCoordinates[1], 2);

            if ((newDistance === null) || (newDistance > distance)) {
                newDistance = distance;
                newItem = item;
            }
        }
        if (newItem === null)
            newItem = selected;

        newItem.setSelected();
        if (newItem.isStackMarker)
            newItem.keyboardSelected();

        this._desktopManager.fileItemMenu.activeFileItem = newItem;
        this.activeFileItem = newItem;
        return true;
    }

    _menuKeyPressed() {
        const selection = this.currentSelection;
        if (selection) {
            const fileItem = selection[0];
            const X =
                fileItem.iconRectangle.x + fileItem.iconRectangle.width / 2;
            const Y =
                fileItem.iconRectangle.y + fileItem.iconRectangle.height / 2;
            this._fileItemMenu.showMenu(fileItem, 3, 0, 0, X, Y, false, false);
        } else {
            const grid = this._desktops.filter(f =>
                f.coordinatesBelongToThisGrid(this._clickX, this._clickY));
            if (!grid)
                return;
            this._desktopManager.onPressButton(
                null,
                null,
                this._clickX,
                this._clickY,
                3,
                false,
                false,
                grid[0]
            ).catch(e => console.error(e));
        }
    }


    async _newDocument(template) {
        if (!template)
            return;

        const file = Gio.File.new_for_path(template);
        const finalName =
            this._desktopMonitor.getDesktopUniqueFileName(file.get_basename());
        const destination = this._desktopDir.get_child(finalName);

        try {
            await file.copy(destination, Gio.FileCopyFlags.NONE, null, null);

            try {
                const info = new Gio.FileInfo();
                info.set_attribute_string(
                    'metadata::nautilus-drop-position',
                    `${this._clickX},${this._clickY}`
                );
                info.set_attribute_string(
                    'metadata::desktop-icon-position', ''
                );
                info.set_attribute_uint32(Gio.FILE_ATTRIBUTE_UNIX_MODE, 0o600);
                await destination.set_attributes_async(
                    info,
                    Gio.FileQueryInfoFlags.NONE,
                    GLib.PRIORITY_DEFAULT,
                    null
                );
            } catch (e) {
                console.error(
                    e, `Failed to set template metadata ${e.message}`);
            }
        } catch (e) {
            if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND))
                this._desktopManager._performSanityChecks();
            else
                console.error(e, `Failed to create template ${e.message}`);
            const header = _('Template Creation Error');
            const text = _('Could not create document');
            this._dbusManager.doNotify(header, text);
        }
    }

    async _createDesktopShortcut(shortcutinfo) {
        const fileList = [shortcutinfo.uri];
        const X = parseInt(shortcutinfo.X);
        const Y = parseInt(shortcutinfo.Y);

        await this._dragManager.clearFileCoordinates(
            fileList,
            [X, Y],
            {doCopy: true}
        );

        await this._DesktopIconsUtil.copyDesktopFileToDesktop(
            shortcutinfo.uri,
            [X, Y]
        );
    }

    async updateClipboard() {
        await this._updateClipboard()
            .catch(e => console.error(e, 'Error updating Clipboard'));
    }

    get currentSelection() {
        return this._desktopManager.getCurrentSelection();
    }

    get activeFileItem() {
        return this._fileItemMenu.activeFileItem;
    }

    set activeFileItem(fileItem) {
        this._fileItemMenu.activeFileItem = fileItem;
    }

    get _displayList() {
        return this._desktopManager._displayList;
    }

    get _clickX() {
        return this._desktopManager._clickX;
    }

    get _clickY() {
        return this._desktopManager._clickY;
    }

    get _desktopDir() {
        return this._desktopMonitor.desktopDir;
    }

    get _desktops() {
        return this._desktopManager._desktops;
    }
};


const DesktopBackgroundMenu = class {
    constructor(desktopManager) {
        this._desktopManager = desktopManager;
        this._mainApp = desktopManager.mainApp;
        this._Prefs = desktopManager.Prefs;
        this._desktopActions = desktopManager.desktopActions;
        this._waitDelayMs = desktopManager.DesktopIconsUtil.waitDelayMs;
        this._Prefs = desktopManager.Prefs;
        this._desktopIconsUtil = desktopManager.DesktopIconsUtil;
        this._templatesScriptsManager = desktopManager.templatesScriptsManager;
        this._FileUtils = desktopManager.FileUtils;
        this._Enums = desktopManager.Enums;
        this._startMonitoringTemplatesDir();
    }

    _startMonitoringTemplatesDir() {
        this._templatesMonitor =
            new this._templatesScriptsManager.TemplatesScriptsManager(
                this._desktopIconsUtil.getTemplatesDir(),
                this._templatesDirSelectionFilter.bind(this),
                {
                    appName: 'app.newDocument',
                    FileUtils: this._FileUtils,
                    Enums: this._Enums,
                }
            );
    }

    _templatesDirSelectionFilter(fileinfo) {
        const name = this._desktopIconsUtil.getFileExtensionOffset(
            fileinfo.get_name()).basename;
        const hiddenfile = name.substring(0, 1) === '.';

        if (!this._Prefs.showHidden && hiddenfile)
            return null;

        return name;
    }

    _createDesktopBackgroundGioMenu() {
        this.desktopBackgroundGioMenu = Gio.Menu.new();

        const sortingRadioMenu = Gio.Menu.new();
        sortingRadioMenu.append(
            _('Name'), 'app.arrangeaction::NAME');
        sortingRadioMenu.append(
            _('Name Z-A'), 'app.arrangeaction::DESCENDINGNAME');
        sortingRadioMenu.append(
            _('Modified Time'), 'app.arrangeaction::MODIFIEDTIME');
        sortingRadioMenu.append(
            _('Type'), 'app.arrangeaction::KIND');
        sortingRadioMenu.append(
            _('Size'), 'app.arrangeaction::SIZE');


        const sortingSubMenu = Gio.Menu.new();
        this._keepArrangedMenuItem = Gio.MenuItem.new(
            _('Keep Arranged…'), 'app.keep-arranged');
        if (!this._Prefs.keepStacked)
            sortingSubMenu.append_item(this._keepArrangedMenuItem);

        sortingSubMenu.append(
            _('Keep Stacked by Type…'), 'app.keep-stacked');
        sortingSubMenu.append(
            _('Sort Home/Drives/Trash…'), 'app.sort-special-folders');
        sortingSubMenu.append_section(null, sortingRadioMenu);

        const settingSubMenu = Gio.Menu.new();
        settingSubMenu.append(
            _('Change Desktop'), 'app.changeDesktop');
        const restoreDefaultDesktop =
            this._mainApp.lookup_action('restoreDefaultDesktop');
        if (restoreDefaultDesktop.get_enabled()) {
            settingSubMenu.append(
                _('Restore Default Desktop'), 'app.restoreDefaultDesktop'
            );
        }
        settingSubMenu.append(
            _('Desktop Icon Settings'), 'app.changeDesktopIconSettings');
        settingSubMenu.append(
            _('Show Shortcuts'), 'app.showShortcutViewer');

        this.desktopBackgroundGioMenu.append(
            _('New Folder'), 'app.doNewFolder');

        const templatesmenu = this._templatesMonitor.getGioMenu();
        if (!(templatesmenu === null)) {
            this.desktopBackgroundGioMenu.append_submenu(
                _('New Document'), templatesmenu);
        }

        const pasteUndoRedoMenu = Gio.Menu.new();
        if (this._mainApp.lookup_action('doPaste').get_enabled())
            pasteUndoRedoMenu.append(_('Paste'), 'app.doPaste');
        if (this._mainApp.lookup_action('doUndo').get_enabled())
            pasteUndoRedoMenu.append(_('Undo'), 'app.doUndo');
        if (this._mainApp.lookup_action('doRedo').get_enabled())
            pasteUndoRedoMenu.append(_('Redo'), 'app.doRedo');

        if (pasteUndoRedoMenu.get_n_items())
            this.desktopBackgroundGioMenu.append_section(null, pasteUndoRedoMenu);

        const selectAllMenu = Gio.Menu.new();
        selectAllMenu.append(_('Select All'), 'app.selectAll');

        this.desktopBackgroundGioMenu.append_section(null, selectAllMenu);

        const sortingMenu = Gio.Menu.new();
        if (!this._Prefs.keepStacked) {
            const cleanUpMenuItem = Gio.MenuItem.new(
                _('Arrange Icons'), 'app.cleanUpIcons');
            sortingMenu.append_item(cleanUpMenuItem);
        }
        const arrangeSubMenuItem = Gio.MenuItem.new_submenu(
            _('Arrange By…'), sortingSubMenu);
        sortingMenu.append_item(arrangeSubMenuItem);

        this.desktopBackgroundGioMenu.append_section(null, sortingMenu);

        const desktopTerminalMenu = Gio.Menu.new();
        const nautilusName = this._Prefs.NautilusName;
        desktopTerminalMenu.append(
            _('Show Desktop In {0}').replace('{0}', nautilusName),
            'app.showDesktopInFiles'
        );
        const terminalString = this._Prefs.TerminalName;
        desktopTerminalMenu.append(
            _('Open In {0}').replace('{0}', terminalString),
            'app.openDesktopInTerminal'
        );

        this.desktopBackgroundGioMenu.append_section(
            null, desktopTerminalMenu);

        const settingsMenu = Gio.Menu.new();
        const settingSubMenuItem = Gio.MenuItem.new_submenu(
            _('Settings'), settingSubMenu);
        settingsMenu.append_item(settingSubMenuItem);

        this.desktopBackgroundGioMenu.append_section(null, settingsMenu);

        const backgroundMenu = Gio.Menu.new();
        backgroundMenu.append(
            _('Shell Menu…'), 'app.displayShellBackgroundMenu');

        // Following deprectiated, Shell Menu has these options anyway
        // this.backgroundMenu.append(
        //       _('Change Background…'), 'app.changeBackGround');
        // this.backgroundMenu.append(
        //      _('Display Settings'), 'app.changeDisplaySettings');

        this.desktopBackgroundGioMenu.append_section(null, backgroundMenu);
    }

    updateTemplates() {
        this._templatesMonitor.updateEntries();
    }

    menuclosed = () => {
        return new Promise(resolve => {
            this.popupmenuclosed = resolve;
        });
    };

    async showDesktopMenu(x, y, grid) {
        await this._desktopActions.updateClipboard()
            .catch(e => console.error(e, 'Error updating clipboard'));
        this._createDesktopBackgroundGioMenu();
        this.popupmenu =
            Gtk.PopoverMenu.new_from_model(this.desktopBackgroundGioMenu);
        this.popupmenu.set_parent(grid._container);
        const menuLocation = new Gdk.Rectangle({x, y, width: 1, height: 1});
        this.popupmenu.set_pointing_to(menuLocation);
        const menuGtkPosition = grid.getIntelligentPosition(menuLocation);
        if (menuGtkPosition)
            this.popupmenu.set_position(menuGtkPosition);

        this.popupmenu.set_has_arrow(false);
        this.popupmenu.popup();
        this.popupmenu.connect('closed', async () => {
            await this._waitDelayMs(50);
            this.popupmenu.unparent();
            this.popupmenu = null;
            if (this.popupmenuclosed)
                this.popupmenuclosed(true);
            this.popupmenuclosed = null;
        });
    }
};

