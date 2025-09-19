/* DING: Desktop Icons New Generation for GNOME Shell
 *
 * Gtk4 Port Copyright (C) 2022 - 2025 Sundeep Mediratta (smedius@gmail.com)
 * Copyright (C) 2021 Sergio Costas (rastersoft@gmail.com)
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
import {Gtk, Gdk, Gio, GLib} from '../dependencies/gi.js';
import {_, Gettext} from '../dependencies/gettext.js';

export {FileItemMenu};
export {FileItemActions};

const FileItemMenu = class {
    constructor(desktopManager) {
        this._desktopManager = desktopManager;
        this._codePath = this._desktopManager.codePath;
        this._mainApp = this._desktopManager.mainApp;
        this._Prefs = this._desktopManager.Prefs;
        this._Enums = this._desktopManager.Enums;
        this._DesktopIconsUtil = this._desktopManager.DesktopIconsUtil;
        this._DBusUtils = desktopManager.DBusUtils;
        this._Enums = desktopManager.Enums;
        this._dragManager = desktopManager.dragManager;

        this._templatesScriptsManager =
            this._desktopManager.templatesScriptsManager;

        this._monitorScripts();
        this._activeFileItem = null;
    }

    _monitorScripts() {
        this.scriptsMonitor =
        new this._templatesScriptsManager.TemplatesScriptsManager(
            this._DesktopIconsUtil.getScriptsDir(),
            this._scriptsDirSelectionFilter.bind(this),
            {
                appName: 'app.onScriptClicked',
                FileUtils: this._desktopManager.FileUtils,
                Enums: this._Enums,
            }
        );
    }

    _scriptsDirSelectionFilter(fileinfo) {
        let name = fileinfo.get_name();
        let hidden = name.substring(0, 1) === '.';
        let executable = fileinfo.get_attribute_boolean('access::can-execute');
        if (!hidden && executable)
            return name;
        else
            return null;
    }

    /* Shows all possible values that can be assigned to this function */
    showMenu(
        fileItem,
        _button = null,
        X = null,
        _Y = null,
        x = null,
        y = null,
        _shiftSelected = false,
        _controlSelected = false
    ) {
        this.activeFileItem = fileItem;
        const selectedItemsNum =
            this._desktopManager.getNumberOfSelectedItems();
        const scriptsSubmenu = this.scriptsMonitor.getGioMenu();
        const menulocation = X
            ? new Gdk.Rectangle({x, y, width: 1, height: 1})
            : fileItem._grid.getGlobaltoLocalRectangle(fileItem.iconRectangle);

        this._menu = Gio.Menu.new();
        let makeFolderMenu = Gio.Menu.new();
        let openMenu = Gio.Menu.new();
        let runAsProgram = Gio.Menu.new();
        let cutCopyPasteMenu = Gio.Menu.new();
        let trashMenu = Gio.Menu.new();
        let allowLaunchingMenu = Gio.Menu.new();
        let emptyTrashMenu = Gio.Menu.new();
        let driveMenu = Gio.Menu.new();
        let propertiesMenu = Gio.Menu.new();
        let showInFilesMenu = Gio.Menu.new();
        let openInTerminalMenu = Gio.Menu.new();

        if (fileItem.isAllSelectable &&
            !this._desktopManager.checkIfSpecialFilesAreSelected() &&
            (selectedItemsNum >= 2)) {
            makeFolderMenu.append(
                Gettext
                    .ngettext(
                        'New Folder with {0} item',
                        'New Folder with {0} items',
                        selectedItemsNum)
                    .replace('{0}', selectedItemsNum),
                'app.newfolderfromselection'
            );
        }

        if (!this.activeFileItem.isStackMarker) {
            if (selectedItemsNum > 1) {
                openMenu.append(_('Open All...'), 'app.openMultipleFileAction');
            } else {
                let app;
                let menuLabel;

                if (this.activeFileItem.executableContentType &&
                    this.activeFileItem.isExecutable &&
                    this.activeFileItem.trustedDesktopFile)
                    menuLabel = _('Launch');

                const canOpenUri = true;
                const type = this.activeFileItem.attributeContentType;
                const defaultApp = Gio.AppInfo.get_default_for_type;
                const recommendedApp = Gio.AppInfo.get_recommended_for_type;
                app = defaultApp(type, !canOpenUri)?.get_name();
                if (!app)
                    app = recommendedApp(type)[0]?.get_name();
                if (!app)
                    app = defaultApp(type, canOpenUri)?.get_name();

                if (!this.activeFileItem.isDesktopFile && app)
                    menuLabel = _('Open with {foo}');

                if (!menuLabel || this.activeFileItem.isAppImageFile)
                    menuLabel = _('Open');

                if (menuLabel) {
                    openMenu.append(
                        menuLabel.replace('{foo}', app),
                        'app.openOneFileAction'
                    );
                }
            }
        }

        if (fileItem.isAllSelectable &&
            !this._desktopManager.checkIfSpecialFilesAreSelected() &&
            (selectedItemsNum >= 1)
        ) {
            let addedExtractHere = false;
            if (this._getExtractableAutoAr()) {
                addedExtractHere = true;
                openMenu.append(_('Extract Here'), 'app.extractautoar');
            }
            if (selectedItemsNum === 1 && this._getExtractable()) {
                if (!addedExtractHere)
                    openMenu.append(_('Extract Here'), 'app.extracthere');

                openMenu.append(_('Extract To...'), 'app.extractto');
            }
        }

        if (fileItem.isDirectory &&
            selectedItemsNum === 1 &&
            !fileItem.isDrive &&
            !fileItem.isTrash)
            openMenu.append(_('Open With...'), 'app.doopenwith');

        if (!this.activeFileItem.isStackMarker &&
            !fileItem.isDirectory) {
            openMenu.append(
                selectedItemsNum > 1
                    ? _('Open All With Other Application...')
                    : _('Open With...'),
                'app.doopenwith'
            );

            if (this._DBusUtils.discreteGpuAvailable &&
                fileItem.trustedDesktopFile) {
                openMenu.append(
                    _('Launch using Integrated Graphics Card'),
                    'app.graphicslaunch'
                );
            }
        }

        const keepStacked =
            this._Prefs.desktopSettings.get_boolean('keep-stacked');

        if (keepStacked &&
            !fileItem.stackUnique) {
            if (!fileItem.isSpecial &&
                !fileItem.isDirectory &&
                !fileItem.isValidDesktopFile
            ) {
                const contentType = fileItem.attributeContentType;
                const typeInList =
                    this._Prefs.UnstackList.includes(contentType);

                const menuitem =
                    Gio.MenuItem.new(
                        typeInList
                            ? _('Stack This Type')
                            : _('Unstack This Type'),
                        null
                    );

                const variant = GLib.Variant.new('s', contentType);

                menuitem.set_action_and_target_value(
                    'app.stackunstack',
                    variant
                );
                openMenu.append_item(menuitem);
            }
        }

        // fileExtra == NONE

        if (fileItem.isAllSelectable &&  !fileItem.isStackMarker) {
            const contentType = fileItem.attributeContentType;
            if (fileItem.attributeCanExecute &&
                !fileItem.isDirectory &&
                !fileItem.isDesktopFile &&
                !fileItem.isAppImageFile &&
                fileItem.execLine &&
                Gio.content_type_can_be_executable(contentType))
                runAsProgram.append(_('Run as a Program'), 'app.runasaprogram');

            if (scriptsSubmenu !== null)
                openMenu.append_submenu(_('Scripts'), scriptsSubmenu);

            const allowCutCopyTrash =
                !this._desktopManager.checkIfSpecialFilesAreSelected();
            if (allowCutCopyTrash) {
                cutCopyPasteMenu.append(_('Cut'), 'app.docut');
                cutCopyPasteMenu.append(_('Copy'), 'app.docopy');
            }

            if (!this._desktopManager.checkIfSpecialFilesAreSelected()) {
                cutCopyPasteMenu.append(_('Move to...'), 'app.bulkMove');
                cutCopyPasteMenu.append(_('Copy to...'), 'app.bulkCopy');
            }

            if (fileItem.canRename && (selectedItemsNum === 1))
                trashMenu.append(_('Rename…'), 'app.dorename');

            if (fileItem.isAllSelectable &&
                !this._desktopManager.checkIfSpecialFilesAreSelected() &&
                (selectedItemsNum >= 1)) {
                trashMenu.append(_('Create Link...'), 'app.makeLinks');

                if (this._desktopManager
                    .getCurrentSelection()
                    ?.every(f => f.isDirectory)) {
                    trashMenu.append(
                        Gettext.ngettext(
                            'Compress {0} folder',
                            'Compress {0} folders', selectedItemsNum)
                            .replace('{0}', selectedItemsNum),
                        'app.compressfiles'
                    );
                } else {
                    trashMenu.append(
                        Gettext.ngettext(
                            'Compress {0} file',
                            'Compress {0} files', selectedItemsNum)
                            .replace('{0}', selectedItemsNum),
                        'app.compressfiles'
                    );
                }

                trashMenu.append(_('Email to...'), 'app.sendto');

                if (!this._desktopManager.checkIfDirectoryIsSelected()) {
                    const sel = this._desktopManager.getCurrentSelection();
                    const remoteoperation =
                        this._DBusUtils.RemoteSendFileOperations;
                    const gsconnectsubmenu =
                        remoteoperation.create_gsconnect_menu(sel);
                    if (gsconnectsubmenu) {
                        trashMenu.append_submenu(
                            _('Send to Mobile Device'),
                            gsconnectsubmenu
                        );
                    }
                }
            }

            if (allowCutCopyTrash) {
                trashMenu.append(_('Move to Trash'), 'app.movetotrash');

                const showDeletePermanently =
                    this._Prefs.nautilusSettings
                        .get_boolean('show-delete-permanently');

                if (showDeletePermanently) {
                    trashMenu.append(
                        _('Delete permanently'),
                        'app.deletepermanantly'
                    );
                }
            }

            if ((fileItem.isValidDesktopFile || fileItem.isAppImageFile) &&
                !this._desktopManager.writableByOthers &&
                !fileItem.writableByOthers &&
                (selectedItemsNum === 1)) {
                if (fileItem.isDesktopFile) {
                    allowLaunchingMenu.append(
                        fileItem.trustedDesktopFile
                            ? _("Don't Allow Launching")
                            : _('Allow Launching'),
                        'app.allowdisallowlaunching');
                    if (fileItem.hasActions) {
                        const actionItem =
                            Gio.MenuItem.new_section(
                                null,
                                fileItem.getMenu()
                            );
                        allowLaunchingMenu.append_item(actionItem);
                    }
                } else if (fileItem.isAppImageFile) {
                    allowLaunchingMenu.append(
                        fileItem.trustedAppImageFile
                            ? _("Don't Allow Launching")
                            : _('Allow Launching'),
                        'app.allowdisallowlaunching');
                }
            }
        }

        // fileExtra == TRASH

        if (fileItem.isTrash)
            emptyTrashMenu.append(_('Empty Trash'), 'app.emptytrash');

        // fileExtra == EXTERNAL_DRIVE

        if (fileItem.isDrive) {
            if (fileItem.canEject)
                driveMenu.append(_('Eject'), 'app.eject');

            if (fileItem.canUnmount)
                driveMenu.append(_('Unmount'), 'app.unmount');
        }

        if (!fileItem.isStackMarker) {
            propertiesMenu.append(
                selectedItemsNum > 1
                    ? _('Common Properties')
                    : _('Properties'),
                'app.properties'
            );

            const nautilusName = this._Prefs.NautilusName;
            showInFilesMenu.append(
                selectedItemsNum > 1
                    ? _('Show All in {0}').replace('{0}', nautilusName)
                    : _('Show in {0}').replace('{0}', nautilusName),
                'app.showinfiles'
            );
        }

        if (fileItem.isDirectory &&
            (fileItem.path !== null) &&
            (selectedItemsNum === 1)) {
            const terminalstring = this._Prefs.TerminalName;

            const menuitem = Gio.MenuItem.new(
                _('Open in {0}').replace('{0}', terminalstring),
                null
            );

            menuitem.set_action_and_target_value(
                'app.openinterminal',
                null
            );

            openInTerminalMenu.append_item(menuitem);
        }

        this._menu.append_section(null, makeFolderMenu);
        this._menu.append_section(null, openMenu);
        this._menu.append_section(null, runAsProgram);
        this._menu.append_section(null, cutCopyPasteMenu);
        this._menu.append_section(null, trashMenu);
        this._menu.append_section(null, allowLaunchingMenu);
        this._menu.append_section(null, emptyTrashMenu);
        if (fileItem.canEject || fileItem.canUnmount)
            this._menu.append_section(null, driveMenu);
        this._menu.append_section(null, showInFilesMenu);
        this._menu.append_section(null, openInTerminalMenu);
        this._menu.append_section(null, propertiesMenu);

        this.popupmenu = Gtk.PopoverMenu.new_from_model(this._menu);
        this.popupmenu.set_parent(fileItem._grid._container);
        this.popupmenu.set_pointing_to(menulocation);
        const menuGtkPosition =
            fileItem._grid.getIntelligentPosition(menulocation);
        if (menuGtkPosition)
            this.popupmenu.set_position(menuGtkPosition);

        this.popupmenu.popup();
        this.popupmenu.connect('closed', async () => {
            await this._DesktopIconsUtil.waitDelayMs(50);
            this.popupmenu.unparent();
            this.popupmenu = null;
            if (this.popupmenuclosed)
                this.popupmenuclosed(true);
            this.popupmenuclosed = null;
        });
    }

    menuclosed = () => {
        return new Promise(resolve => {
            this.popupmenuclosed = resolve;
        });
    };

    showToolTip(fileItem) {
        if (this._toolTipPopup)
            return;
        if (this.popupmenu && (fileItem.uri === this.activeFileItem.uri))
            return;
        this._toolTipPopup = Gtk.Popover.new();
        this._toolTipPopup.set_pointing_to(fileItem.iconLocalWindowRectangle);
        this._toolTipPopup.set_autohide(false);
        this._toolTipLabel = Gtk.Label.new(fileItem._currentFileName);
        this._toolTipPopup.set_child(this._toolTipLabel);
        this._toolTipPopup.set_parent(fileItem._grid._window);
        const popupLocation =
            new Gdk.Rectangle({
                x: fileItem.iconLocalWindowRectangle.x,
                y: fileItem.iconLocalWindowRectangle.y,
                width: 1,
                height: 1,
            });
        const popupGtkPosition =
            fileItem._grid.getIntelligentPosition(popupLocation);
        if (popupGtkPosition)
            this._toolTipPopup.set_position(popupGtkPosition);
        this._toolTipPopup.popup();
        this._toolTipPopup.connect(
            'closed',
            () => {
                this._toolTipPopup.unparent();
                this._toolTipPopup = null;
            }
        );
    }

    hideToolTip() {
        if (this._toolTipPopup)
            this._toolTipPopup.popdown();
    }

    _getExtractableAutoAr() {
        const fileList = this._desktopManager.getCurrentSelection();
        const remotecompress = this._DBusUtils.GnomeArchiveManager;
        if (remotecompress.isAvailable && (fileList.length === 1))
            return false;

        for (let item of fileList) {
            if (!this._desktopManager.autoAr.fileIsCompressed(item.fileName))
                return false;
        }
        return true;
    }

    _getExtractable() {
        const item = this._desktopManager.getCurrentSelection()[0];

        if (!item)
            return false;

        const contentType = item.attributeContentType;

        const decompressibleTypes =
            this._DBusUtils.RemoteFileOperations.decompressibleTypes;

        return decompressibleTypes.includes(contentType);
    }

    set activeFileItem(fileItem) {
        this._activeFileItem = fileItem;
    }

    get activeFileItem() {
        return this._activeFileItem;
    }
};


const FileItemActions = class {
    constructor(desktopManager) {
        this._desktopManager = desktopManager;
        this._mainApp = this._desktopManager.mainApp;
        this._codePath = this._desktopManager.codePath;
        this._Prefs = this._desktopManager.Prefs;
        this._DBusUtils = this._desktopManager.DBusUtils;
        this._DesktopIconsUtil = this._desktopManager.DesktopIconsUtil;
        this._Enums = this._desktopManager.Enums;
        this._appChooser = this._desktopManager.appChooser;
        this._dbusManager = this._desktopManager.dbusManager;
        this._dragManager = this._desktopManager.dragManager;
        this._createFileItemMenuActions();
    }

    _createFileItemMenuActions() {
        const openMultipleFileAction =
            Gio.SimpleAction.new('openMultipleFileAction', null);
        openMultipleFileAction.connect(
            'activate',
            this._doMultiOpen.bind(this)
        );
        this._mainApp.add_action(openMultipleFileAction);

        const openOneFileAction =
            Gio.SimpleAction.new('openOneFileAction', null);
        openOneFileAction.connect(
            'activate',
            () => {
                if (this.activeFileItem) {
                    if (this.activeFileItem.isStackMarker) {
                        this._onToggleStackUnstackThisTypeClicked(
                            this.activeFileItem.attributeContentType);
                    } else {
                        this.activeFileItem.doOpen();
                    }
                }
            }
        );
        openOneFileAction.set_state_hint(GLib.Variant.new('s', _('Open Item')));
        this._mainApp.add_action(openOneFileAction);

        const stackunstack =
            Gio.SimpleAction.new('stackunstack', GLib.VariantType.new('s'));
        stackunstack.connect(
            'activate',
            (_action, paramenter) => {
                this._onToggleStackUnstackThisTypeClicked(paramenter.unpack());
            });
        this._mainApp.add_action(stackunstack);

        const doopenwith = Gio.SimpleAction.new('doopenwith', null);
        doopenwith.connect('activate', () => {
            this._doOpenWith().catch(e => logError(e));
        });
        this._mainApp.add_action(doopenwith);

        const graphicslaunch = Gio.SimpleAction.new('graphicslaunch', null);
        graphicslaunch.connect('activate', () => {
            if (!this.activeFileItem)
                return;
            this.activeFileItem._doDiscreteGpu();
        });
        this._mainApp.add_action(graphicslaunch);

        const runasaprogram = Gio.SimpleAction.new('runasaprogram', null);
        runasaprogram.connect(
            'activate',
            this._runExecutableScript.bind(this)
        );
        this._mainApp.add_action(runasaprogram);

        this._docut = Gio.SimpleAction.new('docut', null);
        this._docut.connect(
            'activate',
            this._doCut.bind(this)
        );
        this._mainApp.add_action(this._docut);

        this._docopy = Gio.SimpleAction.new('docopy', null);
        this._docopy.connect(
            'activate',
            this._doCopy.bind(this)
        );
        this._mainApp.add_action(this._docopy);

        const dorename = Gio.SimpleAction.new('dorename', null);
        dorename.connect('activate', () => {
            this._desktopManager
                .doRename(this.activeFileItem, false)
                .catch(e => logError(e));
        });
        this._mainApp.add_action(dorename);

        this.moveToTrash = Gio.SimpleAction.new('movetotrash', null);
        this.moveToTrash.connect(
            'activate',
            () => this.doTrash()
        );

        this._mainApp.add_action(this.moveToTrash);

        this.deletePermanantly =
            Gio.SimpleAction.new('deletepermanantly', null);
        this.deletePermanantly.connect(
            'activate',
            () => this.doDeletePermanently()
        );

        this._mainApp.add_action(this.deletePermanantly);

        const emptytrash = Gio.SimpleAction.new('emptytrash', null);
        emptytrash.connect(
            'activate',
            () => this.doEmptyTrash()
        );
        this._mainApp.add_action(emptytrash);

        const allowdisallowlaunching = Gio.SimpleAction.new(
            'allowdisallowlaunching', null);
        allowdisallowlaunching.connect('activate', () => {
            if (!this.activeFileItem)
                return;

            this.activeFileItem
                .onAllowDisallowLaunchingClicked()
                .catch(e => console.error(e));
        });
        this._mainApp.add_action(allowdisallowlaunching);

        const eject = Gio.SimpleAction.new('eject', null);
        eject.connect('activate', () => {
            this.activeFileItem.eject().catch(e => console.error(e));
        });
        this._mainApp.add_action(eject);

        const unmount = Gio.SimpleAction.new('unmount', null);
        unmount.connect('activate', () => {
            this.activeFileItem.unmount().catch(e => console.error(e));
        });
        this._mainApp.add_action(unmount);

        const extractautoar = Gio.SimpleAction.new('extractautoar', null);
        extractautoar.connect(
            'activate',
            () => {
                this._desktopManager.getCurrentSelection()
                ?.forEach(
                    f => this._desktopManager.autoAr.extractFile(f.fileName));
            }
        );
        this._mainApp.add_action(extractautoar);

        const extracthere = Gio.SimpleAction.new('extracthere', null);
        extracthere.connect(
            'activate',
            this._extractFileFromSelection.bind(this, true)
        );
        this._mainApp.add_action(extracthere);

        const extractto = Gio.SimpleAction.new('extractto', null);
        extractto.connect(
            'activate',
            this._extractFileFromSelection.bind(this, false)
        );
        this._mainApp.add_action(extractto);

        const sendto = Gio.SimpleAction.new('sendto', null);
        sendto.connect(
            'activate',
            this._mailFilesFromSelection.bind(this, null)
        );
        this._mainApp.add_action(sendto);

        const compressfiles = Gio.SimpleAction.new('compressfiles', null);
        compressfiles.connect(
            'activate',
            this._doCompressFilesFromSelection.bind(this, null)
        );
        this._mainApp.add_action(compressfiles);

        const newfolderfromselection =
            Gio.SimpleAction.new('newfolderfromselection', null);
        newfolderfromselection.connect(
            'activate',
            this._newFolderFromSelection.bind(this)
        );
        this._mainApp.add_action(newfolderfromselection);

        const properties = Gio.SimpleAction.new('properties', null);
        properties.connect(
            'activate',
            this._onPropertiesClicked.bind(this)
        );
        this._mainApp.add_action(properties);

        const showinfiles = Gio.SimpleAction.new('showinfiles', null);
        showinfiles.connect(
            'activate',
            this._onShowInFilesClicked.bind(this)
        );
        this._mainApp.add_action(showinfiles);

        const openinterminal = Gio.SimpleAction.new('openinterminal', null);
        openinterminal.connect(
            'activate',
            this._openInTerminal.bind(this)
        );
        this._mainApp.add_action(openinterminal);

        const makeLinks = Gio.SimpleAction.new('makeLinks', null);
        makeLinks.connect(
            'activate',
            this._makeLinks.bind(this)
        );

        this._mainApp.add_action(makeLinks);

        const bulkCopy = Gio.SimpleAction.new('bulkCopy', null);
        bulkCopy.connect(
            'activate',
            this._bulkCopy.bind(this)
        );
        this._mainApp.add_action(bulkCopy);

        const bulkMove = Gio.SimpleAction.new('bulkMove', null);
        bulkMove.connect(
            'activate',
            this._bulkMove.bind(this)
        );
        this._mainApp.add_action(bulkMove);

        const onScriptClicked =
            Gio.SimpleAction.new('onScriptClicked', GLib.VariantType.new('s'));
        onScriptClicked.connect(
            'activate',
            (_action, parameter) => {
                this._onScriptClicked(parameter.unpack());
            }
        );
        this._mainApp.add_action(onScriptClicked);

        const desktopAction =
            Gio.SimpleAction.new('desktopAction', GLib.VariantType.new('as'));
        desktopAction.connect(
            'activate',
            (_action, parameter) => {
                const [path, actionName, action] = parameter.deepUnpack();
                this._desktopFileAction(path, actionName, action);
            }
        );
        this._mainApp.add_action(desktopAction);
    }

    _doMultiOpen() {
        for (let fileItem of this._desktopManager.getCurrentSelection()) {
            fileItem.unsetSelected();
            fileItem.doOpen();
        }
    }

    _onToggleStackUnstackThisTypeClicked(
        type, typeInList = null, unstackList = null) {
        if (!unstackList) {
            unstackList = this._Prefs.UnstackList;
            typeInList = unstackList.includes(type);
        }
        if (typeInList) {
            let index = unstackList.indexOf(type);
            unstackList.splice(index, 1);
        } else {
            unstackList.push(type);
        }
        this._Prefs.UnstackList = unstackList;
    }

    async _doOpenWith() {
        const fileItems = this._desktopManager.getCurrentSelection();
        if (!this.activeFileItem)
            this.activeFileItem = fileItems[0];
        if (fileItems) {
            const context = Gdk.Display.get_default().get_app_launch_context();
            context.set_timestamp(Gdk.CURRENT_TIME);
            let chooser =
                new this._appChooser.AppChooserDialog(
                    fileItems,
                    this.activeFileItem,
                    this._dbusManager,
                    this._DesktopIconsUtil
                );
            this._mainApp.activate_action('textEntryAccelsTurnOff', null);
            chooser.show();
            const appInfo =
                await chooser.getApplicationSelected()
                    .catch(e => console.error(e));
            if (appInfo) {
                const fileList = [];
                for (let item of fileItems)
                    fileList.push(item.file);

                appInfo.launch(fileList, context);
            }
            this._mainApp.activate_action('textEntryAccelsTurnOn', null);
            chooser.hide();
            chooser.finalize();
            chooser = null;
        }
    }

    _runExecutableScript() {
        if (!this.activeFileItem)
            return;

        this._DesktopIconsUtil.trySpawn(this._desktopDir.get_path(),
            [this.activeFileItem.path], null);
    }

    async _extractFileFromSelection(extractHere) {
        let extractFileItemURI;
        let extractFolderName;
        let position;
        const header = _('Extraction Cancelled');
        const text = _('Unable to extract File, no destination folder');
        const remOp = this._DBusUtils.RemoteFileOperations;

        for (let fileItem of this._desktopManager.getCurrentSelection()) {
            extractFileItemURI = fileItem.file.get_uri();
            extractFolderName = fileItem.fileName;
            position = fileItem.getCoordinates().slice(0, 2);
            fileItem.unsetSelected();
        }

        if (extractHere) {
            extractFolderName =
                this._DesktopIconsUtil
                    .getFileExtensionOffset(extractFolderName).basename;
            const targetURI =
                await this._desktopManager
                    .doNewFolder(position, extractFolderName, {rename: false});
            if (targetURI)
                remOp.ExtractRemote(extractFileItemURI, targetURI, true);
            else
                this._desktopManager.dbusManager.doNotify(header, text);

            return;
        }

        const folder = await this._getSelectedFolderGio()
            .catch(e => console.error(e));

        if (folder)
            remOp.ExtractRemote(extractFileItemURI, folder.get_uri(), true);
        else
            this._desktopManager.dbusManager.doNotify(header, text);
    }

    async _getSelectedFolderGio(dialogTitle = null, selectionText = null) {
        let result;
        try {
            result =
                await this._getSelectedFolderGioNewMethod(
                    dialogTitle,
                    selectionText
                );
        } catch (e) {
            console.log('Reverting to old method of selecting');
            result =
                await this._getSelectedFolderGioOldMethod(
                    dialogTitle,
                    selectionText
                );
        }
        return result;
    }

    _getSelectedFolderGioNewMethod(dialogTitle = null, selectionText = null) {
        return new Promise(resolve => {
            if (!dialogTitle)
                dialogTitle =  _('Select Destination');
            const window = this._mainApp.get_active_window();
            if (!selectionText)
                selectionText = _('Select');
            const dialog = new Gtk.FileDialog({
                title: dialogTitle,
                accept_label: selectionText,
                modal: true,
                initial_folder: this._desktopDir,
            });
            dialog.select_folder(window, null, (actor, gioasyncresponse) => {
                let folder;
                try {
                    folder = actor.select_folder_finish(gioasyncresponse);
                } catch (e) {
                    resolve(false);
                }
                if (folder)
                    resolve(folder);
                else
                    resolve(false);
            });
        });
    }


    _getSelectedFolderGioOldMethod(dialogTitle = null, selectionText = null) {
        return new Promise(resolve => {
            if (!dialogTitle)
                dialogTitle =  _('Select Destination');
            if (!selectionText)
                selectionText = _('Select');
            let returnValue = null;
            const window = this._mainApp.get_active_window();
            const dialog = new Gtk.FileChooserDialog({title: dialogTitle});
            dialog.set_action(Gtk.FileChooserAction.SELECT_FOLDER);
            dialog.set_create_folders(true);
            dialog.set_current_folder(this._desktopDir);
            dialog.add_button(_('Cancel'), Gtk.ResponseType.CANCEL);
            dialog.add_button(selectionText, Gtk.ResponseType.ACCEPT);
            dialog.set_transient_for(window);
            const modal = true;
            dialog.set_modal(modal);
            this._DesktopIconsUtil.windowHidePagerTaskbarModal(dialog, modal);
            this._mainApp.activate_action('textEntryAccelsTurnOff', null);
            dialog.show();
            dialog.present_with_time(Gdk.CURRENT_TIME);
            dialog.connect('close', () => {
                dialog.response(Gtk.ResponseType.CANCEL);
            });
            dialog.connect(
                'response',
                (_actor, response) => {
                    if (response === Gtk.ResponseType.ACCEPT) {
                        const folder = dialog.get_file();
                        if (folder)
                            returnValue = folder;
                        else
                            returnValue = false;
                    }
                    this._mainApp
                        .activate_action('textEntryAccelsTurnOn', null);
                    dialog.destroy();
                    resolve(returnValue);
                }
            );
        });
    }

    _mailFilesFromSelection() {
        if (this._desktopManager.checkIfSpecialFilesAreSelected())
            return;
        const pathnameArray = this._desktopManager.getCurrentSelection()
            .map(f => f.path);

        if (this._desktopManager.checkIfDirectoryIsSelected()) {
            this._mailzippedFilesFromSelection(pathnameArray)
                .catch(e => console.error(e));
            return;
        }
        this._xdgEmailFiles(pathnameArray);
        this._desktopManager.unselectAll();
    }

    async _mailzippedFilesFromSelection(pathnameArray) {
        this._mainApp.activate_action('textEntryAccelsTurnOff', null);
        const chooser = new Gtk.AlertDialog();
        chooser.set_message(_('Can not email a Directory'));
        chooser.set_detail(
            _('Selection includes a Directory, compress to a .zip file first?')
        );
        chooser.buttons = [_('Cancel'), _('OK')];
        chooser.set_modal(true);
        chooser.set_cancel_button(0);
        chooser.set_default_button(1);
        await chooser.choose(
            this.activeFileItem._grid._window,
            null,
            (actor, choice) => {
                const buttonpress = actor.choose_finish(choice);
                if (buttonpress === 1) {
                    const archive = this._makezippedArchive(pathnameArray);
                    if (archive)
                        this._xdgEmailFiles([archive]);
                }
                this._desktopManager.unselectAll();
            }
        );
        this._mainApp.activate_action('textEntryAccelsTurnOn', null);
    }

    _makezippedArchive(pathnameArray) {
        const zipCommand = GLib.find_program_in_path(this._Enums.ZIP_CMD);
        if (!zipCommand) {
            console.log('zip command not installed, cannot send email');
            const header = _('Mail Error');
            const text =
                _('Unable to find zip command, please install the program');
            this._dbusManager.doNotify(header, text);
            return null;
        }

        // Translators - basename for a zipped archive created for mailing
        const archiveName = _('Archive.zip');

        let archiveFile;
        let checkDir;
        // Create a random directory in /tmp
        do {
            const randomString = GLib.uuid_string_random().slice(0, 5);
            const dir = `/tmp/gtk4-ding-${randomString}`;
            archiveFile = `${dir}/${archiveName}`;
            checkDir = Gio.File.new_for_commandline_arg(dir);
        } while (!checkDir.make_directory(null));

        const args = [zipCommand, this._Enums.ZIP_CMD_OPTIONS, archiveFile];
        try {
            const async = false;
            const env = null;
            const workdir = this._desktopDir.get_path();
            const relativePathArray =
                pathnameArray.map(f => GLib.path_get_basename(f));
            const spawncommand = this._DesktopIconsUtil.trySpawn;
            spawncommand(workdir, args.concat(relativePathArray), env, async);
        } catch (e) {
            console.log(`Error Zipping Files, ${e}`);
            const header = _('Mail Error');
            const text = _('There was an error in creating a zip archive');
            this._dbusManager.doNotify(header, text);
        }

        if (Gio.File.new_for_commandline_arg(archiveFile).query_exists(null))
            return archiveFile;
        else
            return null;
    }

    _xdgEmailFiles(pathnameArray) {
        const xdgEmailCommand =
            GLib.find_program_in_path(this._Enums.XDG_EMAIL_CMD);

        if (!xdgEmailCommand) {
            console.log('xdg-email command not installed, cannot send email');
            const header = _('Mail Error');
            const text =
                _('Unable to find xdg-email, please install the program');
            this._dbusManager.doNotify(header, text);
            return;
        }

        const args = [xdgEmailCommand];

        try {
            const newPathNameArray = [];
            pathnameArray.forEach(f => {
                newPathNameArray.push(this._Enums.XDG_EMAIL_CMD_OPTIONS);
                newPathNameArray.push(f);
            });
            const spawncommand = this._DesktopIconsUtil.trySpawn;
            spawncommand(null, args.concat(newPathNameArray));
        } catch (e) {
            console.log(`Error emailing Files, ${e}`);
            const header = _('Mail Error');
            const text = _('There was an error in emailing Files');
            this._dbusManager.doNotify(header, text);
        }
    }

    _doCompressFilesFromSelection() {
        const desktopFolder = this._desktopDir;
        if (!desktopFolder)
            return;

        const toCompress = this._desktopManager.getCurrentSelection();
        if (!toCompress)
            return;

        const uriListtoCompress = toCompress?.map(f => f.uri);

        const remotecompressAvailable =
            this._DBusUtils.GnomeArchiveManager.isAvailable;

        if (remotecompressAvailable) {
            this._DBusUtils.RemoteFileOperations.CompressRemote(
                uriListtoCompress,
                desktopFolder.get_uri(),
                true
            );
        } else {
            this._desktopManager.autoAr.compressFileItems(
                toCompress,
                desktopFolder.get_path()
            );
        }

        this._desktopManager.unselectAll();
    }

    async _newFolderFromSelection() {
        const event = {
            'parentWindow': this.activeFileItem._grid._window,
            'timestamp': Gdk.CURRENT_TIME,
        };
        await this._doNewFolderFromSelection(
            this.activeFileItem.savedCoordinates,
            this.activeFileItem,
            event
        ).catch(e => console.error(e));
    }

    async _doNewFolderFromSelection(newposition = null, clickedItem, event) {
        if (!clickedItem)
            return;
        const newFolderFileItems =
            this._desktopManager.getCurrentSelectionAsUri();
        if (!newFolderFileItems)
            return;

        const position = newposition
            ? newposition
            : clickedItem.savedCoordinates;
        const newFolder = await this._desktopManager.doNewFolder(position);

        if (!newFolder)
            return;

        this._desktopManager.unselectAll();
        clickedItem.removeFromGrid({callOnDestroy: false});
        this._DBusUtils.RemoteFileOperations.pushEvent(event);
        const remoteOp = this._DBusUtils.RemoteFileOperations;
        remoteOp.MoveURIsRemote(newFolderFileItems, newFolder);
    }

    _onPropertiesClicked() {
        const propList = this._desktopManager.getCurrentSelectionAsUri();
        if (!propList)
            return;

        const timestamp = Gdk.CURRENT_TIME;

        this._desktopManager
            .DBusUtils
            .RemoteFileOperations
            .ShowItemPropertiesRemote(
                propList,
                timestamp
            );
    }

    _onShowInFilesClicked() {
        const showInFilesList = this._desktopManager.getCurrentSelectionAsUri();
        if (!showInFilesList)
            return;

        const timestamp = Gdk.CURRENT_TIME;

        this._desktopManager
            .DBusUtils
            .RemoteFileOperations
            .ShowItemsRemote(
                showInFilesList,
                timestamp
            );
    }

    _openInTerminal() {
        if (!this.activeFileItem || !this.activeFileItem.isDirectory)
            return;

        this.launchTerminal(this.activeFileItem.path, null);
    }


    launchTerminal(fileItemPath = null, commandLine = null) {
        let workingdir =
            fileItemPath ? fileItemPath : this._desktopDir.get_path();

        if (!GLib.file_test(workingdir, GLib.FileTest.EXISTS)) {
            const header = _('Can Not open the Working Directory');
            const text = _(`${workingdir} does not exist`);
            this._dbusManager.doNotify(header, text);
            return;
        }

        let success = false;
        const xdgTerminalExec =
            GLib.find_program_in_path(this._Enums.XDG_TERMINAL_EXEC);

        if (xdgTerminalExec) {
            try {
                commandLine = commandLine ? commandLine : '';
                const [args] =
                    GLib.shell_parse_argv(`${xdgTerminalExec} ${commandLine}`)
                        .slice(1);
                this._DesktopIconsUtil.trySpawn(workingdir, args, null);
                console.log('Executed xdg-terminal-exec');
                success = true;
            } catch (e) {
                console.log(`Error opening xdg-terminal-exec ${e}`);
                success = false;
            }
        }

        if (success)
            return;

        if (this._Prefs.Terminal) {
            this._Prefs.TerminalGioList.some(t => {
                let exec =
                    t.get_string(this._Enums.DESKTOPFILE_TERMINAL_EXEC_KEY);
                if (exec === 'ptyxis')
                    exec = `${exec} --new-window -d ${workingdir}`;
                let execswitch =
                    t.get_string(this._Enums.DESKTOPFILE_TERMINAL_EXEC_SWITCH);
                execswitch = execswitch ? execswitch : '-e';
                commandLine = commandLine ? `${execswitch} ${commandLine}` : '';
                const [args] =
                    GLib.shell_parse_argv(`${exec} ${commandLine}`)
                        .slice(1);
                try {
                    this._DesktopIconsUtil.trySpawn(workingdir, args, null);
                    success = true;
                } catch (e) {
                    console.log(`{Error opening ${t.get_string('Name')}, ${e}`);
                    success = false;
                }
                return success;
            });
        } else {
            const header = _('Unable to Open in Gnome Console');
            const text =
                _('Please Install Gnome Console or other Terminal Program');
            this._dbusManager.doNotify(header, text);
        }

        if (success)
            return;

        const header =
            _('Unable to Open {0}').replace('{0}', this._Prefs.TerminalName);
        const text =
            _('Please Install {0}').replace('{0}', this._Prefs.TerminalName);
        this._dbusManager.doNotify(header, text);
    }

    _makeLinks() {
        const toLink = this._desktopManager.getCurrentSelectionAsUri();
        if (!toLink || this._desktopManager.checkIfSpecialFilesAreSelected())
            return;

        const desktopFolderUri = this._desktopDir.get_uri();
        const [X, Y] = this.activeFileItem.getCoordinates().slice(0, 2);
        this._dragManager.makeLinks(toLink, desktopFolderUri, X, Y)
        .catch(e => logError(e));
    }

    _doCopy() {
        const copy = true;
        this._manageCutCopy(copy);
    }

    _doCut() {
        const cut = false;
        this._manageCutCopy(cut);
    }

    async _bulkCopy() {
        if (this._desktopManager.checkIfSpecialFilesAreSelected())
            return;

        const copyList = this._desktopManager.getCurrentSelectionAsUri();
        if (!copyList)
            return;

        const folder = await this._getSelectedFolderGio()
            .catch(e => console.error(e));

        if (folder) {
            this._DBusUtils
                .RemoteFileOperations
                .CopyURIsRemote(copyList, folder.get_uri());

            return;
        }

        const header = _('Copy Cancelled');
        const text = _('Unable to copy Files, no destination folder');
        this._dbusManager.doNotify(header, text);
    }

    async _bulkMove() {
        if (this._desktopManager.checkIfSpecialFilesAreSelected())
            return;

        const moveList = this._desktopManager.getCurrentSelectionAsUri();
        if (!moveList)
            return;

        const folder = await this._getSelectedFolderGio()
            .catch(e => console.error(e));

        if (folder) {
            this._dragManager.saveCurrentFileCoordinatesForUndo();
            this._DBusUtils
                .RemoteFileOperations
                .MoveURIsRemote(moveList, folder.get_uri());
            return;
        }

        const header = _('Move Cancelled');
        const text = _('Unable to move Files, no destination folder');
        this._dbusManager.doNotify(header, text);
    }

    _desktopFileAction(path, actionName, action) {
        if (!this.activeFileItem)
            return;

        if (path === this.activeFileItem.path &&
            this.activeFileItem.actionMap.has(actionName)
        ) {
            let context = new Gio.AppLaunchContext();
            this.activeFileItem.desktopAppInfo.launch_action(action, context);
        }
    }

    doTrash(localDrag = false, event = null) {
        const currentSelection = this._desktopManager.getCurrentSelection();

        if (!currentSelection)
            return;

        const selectionItems = currentSelection.filter(i => !i.isSpecial);

        if (!selectionItems || !selectionItems.length)
            return;

        if (!localDrag)
            this._dragManager.saveCurrentFileCoordinatesForUndo(selectionItems);

        const selectionURIs = [];

        selectionItems.forEach(f => {
            selectionURIs.push(f.file.get_uri());
        });

        if (event)
            this._DBusUtils.RemoteFileOperations.pushEvent(event);

        this._DBusUtils.RemoteFileOperations.TrashURIsRemote(selectionURIs);
    }

    doDeletePermanently() {
        const currentSelection = this._desktopManager.getCurrentSelection();

        if (!currentSelection)
            return;

        const toDelete =
            currentSelection
            .filter(i => !i.isSpecial)
            .map(i => i.file.get_uri());

        if (!toDelete || !toDelete.length) {
            if (this._desktopManager.getCurrentSelection()
                .some(i => i.isTrash)
            )
                this.doEmptyTrash();

            return;
        }

        this._DBusUtils.RemoteFileOperations.DeleteURIsRemote(toDelete);
    }

    doEmptyTrash(askConfirmation = true) {
        this._DBusUtils.RemoteFileOperations.EmptyTrashRemote(askConfirmation);
    }

    _onScriptClicked(menuItemPath) {
        let pathList = 'NAUTILUS_SCRIPT_SELECTED_FILE_PATHS=';
        let uriList = 'NAUTILUS_SCRIPT_SELECTED_URIS=';
        let currentUri =
            `NAUTILUS_SCRIPT_CURRENT_URI=${this._desktopDir.get_uri()}`;
        let params = [menuItemPath];
        for (let item of this._desktopManager.getCurrentSelection()) {
            if (!item.isSpecial) {
                pathList += `${item.file.get_path()}\n`;
                uriList += `${item.file.get_uri()}\n`;
                params.push(item.file.get_path());
            }
        }

        let environ = this._DesktopIconsUtil.getFilteredEnviron();
        environ.push(pathList);
        environ.push(uriList);
        environ.push(currentUri);
        this._DesktopIconsUtil.trySpawn(null, params, environ);
    }

    // Clipboard management
    // ************************************************************************ */
    /*
     * Before Gnome Shell 40, St API couldn't access binary data in the clipboard,
     * only text data. Also, the original Desktop Icons was a pure extension, so it
     * was limited to what Clutter and St offered. That was the reason why Nautilus
     * accepted a text format for CUT and COPY operations in the form:
     *
     *     x-special/nautilus-clipboard
     *     OPERATION
     *     FILE_URI
     *     [FILE_URI]
     *     [...]
     *
     * In Gnome Shell 40, St was enhanced and now it supports binary data; that's
     * why Nautilus migrated to a binary format identified by the atom
     * 'x-special/gnome-copied-files', where the CUT or COPY operation is shared.
     *
     * To maintain compatibility, in the past, we checked the current Gnome Shell
     * version and, based on that, set the binary or the text clipboards.
     *
     * With the newer versions of gtk4-ding, we only set the binary version and add
     * other composite providers for the plain text versions like the newer
     * Nautilus/Files.
     */

    _manageCutCopy(action) {
        const uriList =
            this._dragManager
            .fillDragDataGet(this._Enums.DndTargetInfo.TEXT_URI_LIST);

        if (!uriList?.length)
            return;

        const pathList =
            this._dragManager
            .fillDragDataGet(this._Enums.DndTargetInfo.TEXT_PLAIN);

        const clipboard = Gdk.Display.get_default().get_clipboard();
        const textCoder = new TextEncoder();

        let content = action ? 'copy\n' : 'cut\n';
        content += uriList?.replaceAll('\r', '').trim();

        const encodedUriList = textCoder.encode(uriList);
        const encodedPathList = textCoder.encode(pathList);

        const gnomeContentProvider =
            Gdk.ContentProvider.new_for_bytes(
                'x-special/gnome-copied-files',
                textCoder.encode(content)
            );

        const textUriListContentProvider =
            Gdk.ContentProvider
            .new_for_bytes(
                this._Enums.DndTargetInfo.URI_LIST,
                encodedUriList
            );

        const textListContentProvider =
            Gdk.ContentProvider
                .new_for_bytes(
                    this._Enums.DndTargetInfo.TEXT_PLAIN,
                    encodedPathList
                );

        const textUtf8ListContentProvider =
            Gdk.ContentProvider
            .new_for_bytes(
                this._Enums.DndTargetInfo.TEXT_PLAIN_UTF8,
                encodedPathList
            );

        const clipboardContentProvider =
            Gdk.ContentProvider.new_union([
                gnomeContentProvider,
                textUriListContentProvider,
                textListContentProvider,
                textUtf8ListContentProvider,
            ]);

        clipboard.set_content(clipboardContentProvider);
    }


    get _desktopDir() {
        return this._desktopManager._desktopDir;
    }

    get activeFileItem() {
        return this._desktopManager.activeFileItem;
    }
};
