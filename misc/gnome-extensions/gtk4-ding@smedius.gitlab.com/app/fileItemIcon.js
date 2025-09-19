/* DING: Desktop Icons New Generation for GNOME Shell
 *
 * Adw-DING Copyright (C) 2022, 2025 Sundeep Mediratta (smedius@gmail.com)
 * Based on code original (C) Carlos Soriano and (c) Sergio Costas
 * SwitcherooControl code based on code original from Marsch84
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
import {DesktopIconItem} from '../dependencies/localFiles.js';

import {_} from '../dependencies/gettext.js';

export {FileItemIcon};

const Signals = imports.signals;

const FileItemIcon = class extends DesktopIconItem {
    constructor(desktopManager, file, fileInfo, fileTypeEnum, gioMount) {
        super(desktopManager, fileTypeEnum);
        this.DBusUtils = desktopManager.DBusUtils;
        this._fileInfo = fileInfo;
        this._gioMount = gioMount;
        this._file = file;
        this.isStackTop = false;
        this.stackUnique = false;

        this.readSavedCoordinates();
        this.readDropCoordinates();

        this._createIconActor();

        /* Set the metadata */
        this._updateMetadataFromFileInfo(fileInfo);

        if (this._attributeCanExecute)
            this._execLine = this.file.get_path();
        else
            this._execLine = null;

        this._updateName();
        if (this._dropCoordinates)
            this.setSelected();
    }

    /** *********************
     * Destroyers *
     ***********************/

    _destroy() {
        super._destroy();

        if (this._updatingIconCancellable)
            this._updatingIconCancellable.cancel();

        if (this._queryFileInfoCancellable)
            this._queryFileInfoCancellable.cancel();

        if (this._savedCoordinatesCancellable)
            this._savedCoordinatesCancellable.cancel();

        if (this._dropCoordinatesCancellable)
            this._dropCoordinatesCancellable.cancel();

        /* Metadata */
        if (this._setMetadataTrustedCancellable)
            this._setMetadataTrustedCancellable.cancel();
    }

    /** *********************
     * Creators *
     ***********************/

    _getVisibleName() {
        return this._fileInfo.get_display_name();
    }

    _setFileName(text) {
        this._setLabelName(text);
    }

    _setAccesibilityName() {
        const visibleName = this._getVisibleName();
        const folderName = _('Folder');
        const fileName = _('File');

        if (this._isDirectory) {
            /** TRANSLATORS: when using a screen reader, this is the text
             *  read when a folder is selected. Example: if a folder named
             * "things" is selected, it will say "things Folder" */
            this.container.update_property(
                [Gtk.AccessibleProperty.LABEL],
                [`${visibleName} ${folderName}`]
            );
        } else {
            /** TRANSLATORS: when using a screen reader, this is the text
             * read when a normal file is selected. Example: if a file
             * named "my_picture.jpg" is selected, it will say
             * "my_picture.jpg File" */
            this.container.update_property(
                [Gtk.AccessibleProperty.LABEL],
                [`${visibleName} ${fileName}`]
            );
        }
    }

    readSavedCoordinates() {
        const array = this._readCoordinatesFromAttribute(this._fileInfo,
            'metadata::desktop-icon-position'
        );
        this._parseSavedCoordinates(array);
    }

    readDropCoordinates() {
        const array = this._readCoordinatesFromAttribute(this._fileInfo,
            'metadata::nautilus-drop-position'
        );
        this._parseDropCoordinates(array);
    }

    _readCoordinatesFromAttribute(fileInfo, attribute) {
        const readCoordinates = fileInfo.get_attribute_as_string(attribute);

        if (readCoordinates !== null && readCoordinates !== '')
            return readCoordinates.split(',');

        return null;
    }

    async _refreshMetadataAsync(cancellable) {
        if ((cancellable && cancellable.is_cancelled()) || this._destroyed) {
            throw new GLib.Error(Gio.IOErrorEnum,
                Gio.IOErrorEnum.CANCELLED,
                'Operation was cancelled');
        } else if (!cancellable) {
            cancellable = new Gio.Cancellable();
        }

        if (this._queryFileInfoCancellable)
            this._queryFileInfoCancellable.cancel();

        this._queryFileInfoCancellable = cancellable;

        try {
            const newFileInfo =
                await this._file.query_info_async(
                    this.Enums.DEFAULT_ATTRIBUTES,
                    Gio.FileQueryInfoFlags.NONE,
                    GLib.PRIORITY_DEFAULT,
                    cancellable
                );

            this._updateMetadataFromFileInfo(newFileInfo);

            this._updateName();
        } catch (e) {
            if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
                console.error(e, `Error getting file info: ${e.message}`);
        } finally {
            if (this._queryFileInfoCancellable === cancellable)
                this._queryFileInfoCancellable = null;
        }
    }

    _updateMetadataFromFileInfo(fileInfo) {
        this._fileInfo = fileInfo;

        this._displayName = this._getVisibleName();

        this._attributeCanExecute = fileInfo.get_attribute_boolean(
            Gio.FILE_ATTRIBUTE_ACCESS_CAN_EXECUTE
        );

        this._unixmode = fileInfo.get_attribute_uint32(
            Gio.FILE_ATTRIBUTE_UNIX_MODE
        );

        this._writableByOthers =
            (this._unixmode & this.Enums.UnixPermissions.S_IWOTH) !== 0;

        this._attributeContentType = fileInfo.get_content_type();
        this._fileType = fileInfo.get_file_type();
        this._isDirectory = this._fileType === Gio.FileType.DIRECTORY;
        this._isSpecial = this._fileTypeEnum !== this.Enums.FileType.NONE;

        this._isHidden =
            fileInfo.get_attribute_boolean(
                Gio.FILE_ATTRIBUTE_STANDARD_IS_HIDDEN) ||
            fileInfo.get_attribute_boolean(
                Gio.FILE_ATTRIBUTE_STANDARD_IS_BACKUP);

        this._modifiedTime = fileInfo.get_attribute_uint64(
            Gio.FILE_ATTRIBUTE_TIME_MODIFIED
        );

        if (this.Prefs.showLinkEmblem)
            this._setEncryptionStatus().catch(logError);
    }

    async _setEncryptionStatus() {
        if (this.isEncrypted)
            return;

        switch (this._attributeContentType) {
        case 'application/x-7z-compressed':
            this._isEncrypted =
                this.DesktopIconsUtil.checkIf7zEncrypted(this._file);
            break;

        case 'application/pdf':
            this._isEncrypted =
                await this.DesktopIconsUtil.checkIfPdfEncrypted(this._file);
            break;

        case 'application/zip':
            this._isEncrypted =
                await this.DesktopIconsUtil.checkIfZipEncrypted(this._file);
            break;

        case 'application/epub+zip':
            this._isEncrypted =
                await this.DesktopIconsUtil.checkIfZipEncrypted(this._file);
            break;

        default:
            this._isEncrypted = false;
        }

        if (!this._isEncrypted)
            return;

        this.updateIcon()
        .catch(e =>
            console.error(`Error updating after setting encryption status ${e}`)
        );
    }

    async _doOpenContext(context = null, fileList) {
        if (!fileList)
            fileList = [];

        if (!this.DBusUtils.GnomeArchiveManager.isAvailable &&
            this._fileType === Gio.FileType.REGULAR &&
            this._desktopManager.autoAr.fileIsCompressed(this.fileName)
        ) {
            this._desktopManager.autoAr.extractFile(this.fileName);

            return;
        }

        try {
            await Gio.AppInfo.launch_default_for_uri_async(
                this.file.get_uri(),
                context,
                null
            );
        } catch (e) {
            if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_SUPPORTED)) {
                const title = _('Opening File Failed');

                const defaultAppInfo =
                    Gio.content_type_get_description(this.attributeContentType);

                const error =
                    _('There is no application installed to open "{fo}" files.')
                    .replace('{fo}', defaultAppInfo);

                const helpURI =
                    'https://gitlab.com/smedius/desktop-icons-ng/-/issues/73';

                this._showerrorpopup(title, error, helpURI);
            } else {
                console.error(
                    e, `Error opening file ${this.file.get_uri()}: ${e.message}`
                );
            }
        }
    }

    _showerrorpopup(title, error, helpURI = null) {
        const errorDialog = this._desktopManager.showError(
            title,
            error,
            helpURI
        );

        errorDialog.show();
    }

    _updateName() {
        this._setFileName(this._getVisibleName());

        this._setAccesibilityName();
    }

    /** *********************
     * Button Clicks *
     ***********************/

    _doButtonOnePressed(button, X, Y, x, y, shiftPressed, controlPressed) {
        super._doButtonOnePressed(
            button, X, Y, x, y, shiftPressed, controlPressed
        );

        if (this.getClickCount() === 2 && !this.Prefs.CLICK_POLICY_SINGLE)
            this.doOpen();
    }

    _doButtonOneReleased(
        _button, _X, _Y, _x, _y, shiftPressed, controlPressed
    ) {
        if (this.getClickCount() === 1 &&
             this.Prefs.CLICK_POLICY_SINGLE &&
             !shiftPressed &&
             !controlPressed)
            this.doOpen();
    }

    /** *********************
     * Drag and Drop *
     ***********************/

    async receiveDrop(
        X, Y,
        x, y,
        dropData,
        acceptFormat,
        gdkDropAction,
        localDrop,
        event,
        dragItem
    ) {
        if (!this.dropCapable)
            return false;

        if (acceptFormat !== this.Enums.DndTargetInfo.DING_ICON_LIST &&
            acceptFormat !== this.Enums.DndTargetInfo.GNOME_ICON_LIST &&
            acceptFormat !== this.Enums.DndTargetInfo.URI_LIST)
            return false;

        const fileList =
            this._dragManager.makeFileListFromSelection(dropData, acceptFormat);

        if (!fileList)
            return false;

        if (dragItem && (dragItem.uri === this._file.get_uri() ||
            !(this._isValidDesktopFile || this.isDirectory))) {
            // Dragging a file/folder over itself or over another file will
            // do nothing, allow drag to directory or valid desktop file
            return false;
        }

        const dropReturnValue = await this._handleDroppedUris(
            X, Y,
            x, y,
            fileList,
            gdkDropAction,
            localDrop,
            event
        );

        return dropReturnValue;
    }

    async _handleDroppedUris(
        X, Y,
        x, y,
        fileList,
        gdkDropAction,
        localDrop,
        event
    ) {
        const forceCopy = gdkDropAction === Gdk.DragAction.COPY;
        let returnAction;

        if (gdkDropAction === Gdk.DragAction.MOVE ||
            gdkDropAction === Gdk.DragAction.COPY
        ) {
            if (localDrop)
                this._dragManager.saveCurrentFileCoordinatesForUndo();
            try {
                returnAction =
                    await this._dragManager.copyOrMoveUris(
                        fileList, this._file.get_uri(), event, {forceCopy}
                    );
            } catch (e) {
                console.error(e);
                return false;
            }
        } else {
            if (gdkDropAction >= Gdk.DragAction.LINK)
                returnAction = Gdk.DragAction.LINK;
            else
                returnAction = Gdk.DragAction.COPY;

            this._dragManager.askWhatToDoWithFiles(
                fileList,
                this._file.get_uri(),
                X, Y,
                x, y,
                event,
                {desktopActions: false}
            );
        }

        return returnAction;
    }

    _hasToRouteDragToGrid() {
        return this._isSelected &&
            this._dragManager.dragItem &&
            this._dragManager.dragItem.uri !== this._file.get_uri();
    }

    _dropCapable() {
        if (this._isDirectory ||
            this._hasToRouteDragToGrid()
        )
            return true;
        else
            return false;
    }

    /** *********************
     * Icon Rendering *
     ***********************/

    async _reloadIcon(cancellable) {
        if (!cancellable)
            cancellable = new Gio.Cancellable();
        this._updatingIconCancellable = cancellable;
        try {
            await this._refreshMetadataAsync(cancellable);
            await this._updateIcon(cancellable);
            this._icon.queue_draw();
        } catch (e) {
            if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) {
                console.error(
                    e,
                    `Exception while updating ${
                        this._getVisibleName()
                            ? this._getVisibleName()
                            : 'updating icon'
                    }: ${e.message}`);
                throw e;
            }
        } finally {
            if (this._updatingIconCancellable === cancellable)
                this._updatingIconCancellable = null;
        }
    }

    _addEmblemsToIconIfNeeded(iconPaintable, position = 0) {
        let emblem = null;
        let newIconPaintable = iconPaintable;

        if (this.isEncrypted && this.Prefs.showLinkEmblem) {
            emblem = Gio.ThemedIcon.new('icon-emblem-locked');

            newIconPaintable =
                this._addEmblem(newIconPaintable, emblem, position);

            position += 1;
        }

        return newIconPaintable;
    }

    /** *********************
     * Class Methods *
     ***********************/

    onAttributeChanged() {
        if (this._destroyed)
            return;

        this._reloadIcon()
        .catch(e =>  {
            if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) {
                console.error(
                    e,
                    'Exception while updating icon on Attribute Changed: ' +
                    `${e.message}`
                );
            }
        }
        );
    }

    updatedMetadata() {
        this._reloadIcon().catch(e =>  {
            if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) {
                console.error(
                    e,
                    'Exception while updating icon on Metadata Changed: ' +
                    `${e.message}`
                );
            }
        });
    }

    doOpen(fileList) {
        if (!fileList)
            fileList = [];

        this._doOpenContext(null, fileList).catch(e => console.error(e));
    }

    async onAllowDisallowLaunchingClicked() {
        /*
         * we're marking as trusted, make the file executable too. Note that we
         * do not ever remove the executable bit, since we don't know who set
         * it.
         */
        if (this.metadataTrusted && !this._attributeCanExecute) {
            let info = new Gio.FileInfo();
            let newUnixMode = this._unixmode |
                this.Enums.UnixPermissions.S_IXUSR |
                this.Enums.UnixPermissions.S_IXGRP |
                this.Enums.UnixPermissions.S_IXOTH;

            info.set_attribute_uint32(
                Gio.FILE_ATTRIBUTE_UNIX_MODE,
                newUnixMode
            );

            await this._setFileAttributes(info).catch(e => {
                if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
                    throw e;
            });
        }

        this._updateName();
    }

    doDiscreteGpu() {
        if (!this.DBusUtils.discreteGpuAvailable) {
            console.log(
                'Could not apply discrete GPU environment, switcheroo-control' +
                ' not available'
            );
            return;
        }

        let gpus = this.DBusUtils.SwitcherooControl.proxy.GPUs;
        if (!gpus) {
            console.log(
                'Could not apply discrete GPU environment. No GPUs in list.'
            );
            return;
        }

        for (let gpu in gpus) {
            if (!gpus[gpu])
                continue;

            let defaultVariant = gpus[gpu]['Default'];
            if (!defaultVariant || defaultVariant.get_boolean())
                continue;

            let env = gpus[gpu]['Environment'];
            if (!env)
                continue;

            let envS = env.get_strv();
            let context = new Gio.AppLaunchContext();
            for (let i = 0; i < envS.length; i += 2)
                context.setenv(envS[i], envS[i + 1]);

            this._doOpenContext(context, null).catch(e => console.error(e));
            return;
        }
        console.log('Could not find discrete GPU data in switcheroo-control');
    }

    async _setFileAttributes(fileInfo, cancellable = null, updateIcon = true) {
        await this._file.set_attributes_async(
            fileInfo,
            Gio.FileQueryInfoFlags.NONE,
            GLib.PRIORITY_LOW,
            cancellable
        );

        if (cancellable && cancellable.is_cancelled()) {
            throw new GLib.Error(Gio.IOErrorEnum,
                Gio.IOErrorEnum.CANCELLED,
                'Operation was cancelled');
        }

        if (updateIcon) {
            await this._reloadIcon(cancellable).catch(e => {
                console.error(
                    'Error while updating icon while setting attributes'
                );
                throw e;
            });
        }
    }

    async _storeCoordinates(name, coords, cancellable = null) {
        const info = new Gio.FileInfo();
        info.set_attribute_string(
            `metadata::${name}`,
            `${coords ? coords.join(',') : ''}`
        );

        const updateIcon = true;
        await this._setFileAttributes(info, cancellable, !updateIcon);
    }

    writeSavedCoordinates(pos) {
        const oldPos = this._savedCoordinates;
        this._parseSavedCoordinates(pos);

        if (this._savedCoordinatesCancellable)
            this._savedCoordinatesCancellable.cancel();

        const cancellable = new Gio.Cancellable();
        this._savedCoordinatesCancellable = cancellable;

        this._storeCoordinates(
            'desktop-icon-position',
            pos,
            cancellable
        ).catch(e => {
            if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) {
                console.error(
                    e,
                    'Failed to store the desktop coordinates for ' +
                    `${this.uri}: ${e.message}`
                );
                this._savedCoordinates = oldPos;
            }
        }).finally(() => {
            if (this._savedCoordinatesCancellable === cancellable)
                this._savedCoordinatesCancellable = null;
        });
    }

    writeDroppedCoordinates(pos) {
        const oldPos = this._dropCoordinates;
        this._parseDropCoordinates(pos);

        if (this._dropCoordinatesCancellable)
            this._dropCoordinatesCancellable.cancel();

        const cancellable = new Gio.Cancellable();
        this._dropCoordinatesCancellable = cancellable;

        this._storeCoordinates(
            'nautilus-drop-position',
            pos,
            cancellable
        ).catch(e => {
            if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) {
                console.error(e,
                    'Failed to store the desktop coordinates for ' +
                    `${this.uri}: ${e.message}`
                );
                this._dropCoordinates = oldPos;
            }
        }).finally(() => {
            if (this._dropCoordinatesCancellable === cancellable)
                this._dropCoordinatesCancellable = null;
        });
    }

    /** *********************
     * Getters and setters *
     ***********************/

    get attributeContentType() {
        return this._attributeContentType;
    }

    get attributeCanExecute() {
        return this._attributeCanExecute;
    }

    get canRename() {
        return !this.trustedDesktopFile &&
            (this._fileTypeEnum === this.Enums.FileType.NONE);
    }

    get displayName() {
        return this._displayName || null;
    }

    get dropCoordinates() {
        return this._dropCoordinates;
    }

    set dropCoordinates(pos) {
        if (this.DesktopIconsUtil.coordinatesEqual(this._dropCoordinates, pos))
            return;
        this.writeDroppedCoordinates(pos);
    }

    get execLine() {
        return this._execLine;
    }

    get executableContentType() {
        return Gio.content_type_can_be_executable(this.attributeContentType);
    }

    get file() {
        return this._file;
    }

    get fileContainsText() {
        return this._attributeContentType === 'text/plain';
    }

    get fileName() {
        return this._fileInfo.get_name();
    }

    get fileSize() {
        return this._fileInfo.get_size();
    }

    get isAllSelectable() {
        return this._fileTypeEnum === this.Enums.FileType.NONE;
    }

    get isDirectory() {
        return this._isDirectory;
    }

    get isExecutable() {
        return this._attributeCanExecute;
    }

    get isHidden() {
        return this._isHidden;
    }

    get metadataTrusted() {
        return this._trusted;
    }

    set metadataTrusted(value) {
        this._trusted = value;

        if (this._setMetadataTrustedCancellable)
            this._setMetadataTrustedCancellable.cancel();


        const cancellable = new Gio.Cancellable();
        this._setMetadataTrustedCancellable = cancellable;

        let info = new Gio.FileInfo();
        info.set_attribute_string('metadata::trusted',
            value ? 'true' : 'false');

        this._setFileAttributes(info, cancellable)
        .catch(e => {
            if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) {
                console
                    .error(e, `Failed to set metadata::trusted: ${e.message}`);
            }
        })
        .finally(() => {
            if (cancellable === this._setMetadataTrustedCancellable)
                this._setMetadataTrustedCancellable = null;
        });
    }

    get modifiedTime() {
        return this._modifiedTime;
    }

    get path() {
        return this._file.get_path();
    }

    get savedCoordinates() {
        return this._savedCoordinates;
    }

    set savedCoordinates(pos) {
        if (this.DesktopIconsUtil.coordinatesEqual(this._savedCoordinates, pos))
            return;

        this.writeSavedCoordinates(pos);
    }

    get x() {
        return this._x1;
    }

    get y() {
        return this._y1;
    }

    get X() {
        return this._savedCoordinates[0];
    }

    get Y() {
        return this._savedCoordinates[1];
    }

    get uri() {
        return this._file.get_uri();
    }

    get writableByOthers() {
        return this._writableByOthers;
    }

    get isStackMarker() {
        if (this.isStackTop && !this.stackUnique)
            return true;
        else
            return false;
    }
};
Signals.addSignalMethods(FileItemIcon.prototype);
