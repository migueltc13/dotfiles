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

import {Gtk, Gdk, Gio, GLib} from '../dependencies/gi.js';
import {_} from '../dependencies/gettext.js';


export {DragManager};

const DragManager = class {
    constructor(desktopManager) {
        this._desktopManager = desktopManager;
        this._mainApp = this._desktopManager.mainApp;
        this._FileUtils = desktopManager.FileUtils;
        this._DesktopIconsUtil = desktopManager.DesktopIconsUtil;
        this._DBusUtils = desktopManager.DBusUtils;
        this._Prefs = desktopManager.Prefs;
        this._GnomeShellDragDrop = this._desktopManager.GnomeShellDragDrop;
        this._Enums = this._desktopManager.Enums;
        this._dbusManager = this._desktopManager.dbusManager;
        this._pendingDropFiles = {};
        this._pendingSelfCopyFiles = {};
        this.pointerX = 0;
        this.pointerY = 0;
        this._dragList = null;
        this.dragItem = null;
        this.rubberBand = false;
        this.localDragOffset = [0, 0];
    }

    // Drag and Drop local Methods

    _saveCurrentFileCoordinatesForUndo(fileList = null) {
        if (this._Prefs.keepArranged || this._Prefs.keepStacked)
            return;

        this._pendingDropFiles = {};
        this._pendingSelfCopyFiles = {};

        fileList = fileList ? fileList : this.currentSelection;

        if (!fileList)
            return;

        fileList.forEach(f => {
            const savedCoordinates = [
                ...f.savedCoordinates,
                ...f.normalCoordinates,
                f.monitorIndex,
            ];
            this._pendingSelfCopyFiles[f.fileName] = savedCoordinates;
        });
    }

    _makeFileSystemLinks(fileList, destination) {
        let gioDestination = Gio.File.new_for_uri(destination);
        fileList.forEach(file => {
            const fileGio = Gio.File.new_for_uri(file);
            const baseNameParts =
                this._DesktopIconsUtil.getFileExtensionOffset(
                    fileGio.get_basename()
                );
            let i = 0;
            let newSymlinkName = fileGio.get_basename();
            let checkSymlinkGio;
            do {
                checkSymlinkGio =
                    Gio.File.new_for_commandline_arg(
                        GLib.build_filenamev(
                            [gioDestination.get_path(), newSymlinkName]
                        )
                    );
                try {
                    checkSymlinkGio.make_symbolic_link(
                        GLib.build_filenamev([fileGio.get_path()]),
                        null
                    );
                    break;
                } catch (e) {
                    if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.EXISTS)) {
                        i += 1;
                        newSymlinkName =
                            `${baseNameParts.basename}` +
                            `${i}${baseNameParts.extension}`;
                    } else {
                        console.error(e, 'Error making file-system links');
                        const header = _('Making SymLink Failed');
                        const text = _('Could not create symbolic link');
                        this._dbusManager.doNotify(header, text);
                        break;
                    }
                }
            } while (true);
        });
    }

    async _detectURLorText(dropData, dropCoordinates) {
    /**
     * Checks to see if a string is a URL
     *
     * @param {string} str A text URL
     * @returns {boolean} if the string is a URL
     */
        function isValidURL(str) {
            var pattern = new RegExp('^(https|http|ftp|rtsp|mms)?:\\/\\/?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$', 'i');
            return !!pattern.test(str);
        }

        const text = dropData.toString();

        if (text === '')
            return;

        if (isValidURL(text)) {
            await this._writeURLlinktoDesktop(text, dropCoordinates);
        } else {
            let filename = 'Dragged Text';
            const now = Date().valueOf().split(' ').join('').replace(/:/g, '-');
            filename = `${filename}-${now}`;
            await this._DesktopIconsUtil.writeTextFileToPath(
                text,
                this._desktopDir,
                filename,
                dropCoordinates
            );
        }
    }

    async _writeURLlinktoDesktop(link, dropCoordinates) {
        let filename = link.split('?')[0];
        filename = filename.split('//')[1];
        filename = filename.split('/')[0];
        const now = Date().valueOf().split(' ').join('').replace(/:/g, '-');
        filename = `${filename}-${now}`;
        await this._writeHTMLTypeLink(filename, link, dropCoordinates);
    }


    async _writeHTMLTypeLink(filename, link, dropCoordinates) {
        filename += '.html';
        let body = [
            '<html>',
            '    <head>',
            `        <meta http-equiv="refresh" content="0; url=${link}" />`,
            '    </head>',
            '    <body>',
            '    </body>',
            '</html>',
        ];
        body = body.join('\n');
        await this._DesktopIconsUtil.writeTextFileToPath(
            body,
            this._desktopDir,
            filename,
            dropCoordinates
        );
    }

    _startGnomeShellDrag() {
        if (!this.localDrag &&
            this.dragItem &&
            !this.gnomeShellDrag
        ) {
            this.gnomeShellDrag =
                new this._GnomeShellDragDrop
                    .GnomeShellDrag(this._desktopManager);
        }
    }

    _stopGnomeShellDrag() {
        this.gnomeShellDrag?.destroy();
        this.gnomeShellDrag = null;
    }

    _localDrag() {
        let localDrag = false;
        this._desktops.forEach(d => {
            if (d.localDrag)
                localDrag = true;
        });
        return localDrag;
    }

    _positiveOffsetGridAim(xGlobalDestination, yGlobalDestination) {
    // Find the grid where the destination lies and aim towards the positive
    // side, middle of grid to ensure drop in the grid
        let xbias = 0;
        let ybias = 0;
        for (let desktop of this._desktops) {
            if (desktop.coordinatesBelongToThisGrid(
                xGlobalDestination,
                yGlobalDestination)) {
                xbias = desktop._elementWidth / 2;
                ybias = desktop._elementHeight / 2;
                break;
            }
        }
        return [xGlobalDestination + xbias, yGlobalDestination + ybias];
    }

    async _getFsId(file) {
    /**
     * Returns filesystem id of file or null if file does not exist
     *
     * @param {file} Gio.File
     * @returns {str} filesystem ID of file or null
     */
        const info =
            await file.query_info_async(
                'id::filesystem',
                Gio.FileQueryInfoFlags.NONE,
                GLib.PRIORITY_DEFAULT,
                null
            ).catch(
                e => {
                    if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND))
                        return null;
                    throw e;
                }
            );

        if (info == null)
            return null;

        return info.get_attribute_string('id::filesystem');
    }

    async _desktopFsId() {
        const desktopFsId = await this._getFsId(this._desktopDir);

        return desktopFsId;
    }

    async _fileIsOnDesktopFileSystem(file) {
    /**
     * Checks to see if file is on the same filesystem as the Desktop Folder
     * Consider trash:// URI to be in the same folder as the Desktop
     * This forces a move from Trash instead of copy
     *
     * @param {file} Gio.File
     * @returns {boolean} if the file is on the same filesystem as Desktop
     * @returns {null} if the file does not exist
     */
        const fileSystemID = await this._getFsId(file);
        if (fileSystemID == null)
            return null;
        if (fileSystemID.startsWith('trash'))
            return true;
        const desktopFileSystemID = await this._desktopFsId();
        if (fileSystemID === desktopFileSystemID)
            return true;
        return false;
    }

    _drawSelectionRectangles() {
        for (let grid of this._desktops)
            grid.drawRubberBand();
    }

    // Global Methods
    // *******************************************************

    // Drag Preperation

    fillDragDataGet(target) {
        const fileList = this.currentSelection;
        if (!fileList)
            return null;

        let uriList = '';
        let pathList = '';

        switch (target) {
        case this._Enums.DndTargetInfo.GNOME_ICON_LIST:
            for (let fileItem of fileList) {
                uriList += fileItem.uri;
                const coordinates = fileItem.getCoordinates();
                if (coordinates !== null) {
                    uriList += `\r
                    ${coordinates[0]}:
                    ${coordinates[1]}:
                    ${coordinates[2] - coordinates[0] + 1}:
                    ${coordinates[3] - coordinates[1] + 1}`;
                }
                uriList += '\r\n';
            }
            return uriList;
        case this._Enums.DndTargetInfo.DING_ICON_LIST:
        case this._Enums.DndTargetInfo.TEXT_URI_LIST:
            uriList = fileList.map(f => f.uri).join('\r\n');
            uriList += '\r\n';
            return uriList;
        case this._Enums.DndTargetInfo.TEXT_PLAIN:
            pathList = fileList.map(f => f.path).join('n');
            pathList += '\n';
            return pathList;
        }
        return null;
    }

    makeFileListFromSelection(dropData, acceptFormat) {
        if (!dropData)
            return null;
        if (acceptFormat === this._Enums.DndTargetInfo.TEXT_PLAIN)
            return null;

        let fileList;

        if (acceptFormat === this._Enums.DndTargetInfo.GNOME_ICON_LIST) {
            fileList = GLib.Uri.list_extract_uris(dropData);
        } else if (acceptFormat === this._Enums.DndTargetInfo.DING_ICON_LIST) {
            fileList = dropData.get_files().map(f => f.get_uri());
        } else {
            fileList = dropData.split('\n').map(f => {
                if (GLib.Uri.peek_scheme(f))
                    return f;
                else
                    return GLib.filename_to_uri(f, null);
            });
        }

        // filename_to_uri can return null
        fileList = fileList.filter(f => {
            if (!f)
                return false;
            return true;
        });

        if (fileList && fileList.length)
            return fileList;
        else
            return null;
    }

    saveCurrentFileCoordinatesForUndo(fileList) {
        this._saveCurrentFileCoordinatesForUndo(fileList);
    }

    async clearFileCoordinates(fileList,
        dropCoordinates,
        opts = {doCopy: false}) {
        if (this._Prefs.keepArranged || this._Prefs.keepStacked)
            return;

        this.pendingDropFiles = {};
        this.pendingSelfCopyFiles = {};

        await Promise.all(fileList.map(async element => {
            let file = Gio.File.new_for_uri(element);

            if (!file.is_native()) {
                this.setPendingDropCoordinates(file, dropCoordinates);
                return;
            }

            let info = new Gio.FileInfo();
            info.set_attribute_string('metadata::desktop-icon-position', '');
            if (dropCoordinates !== null) {
                if (!opts.doCopy) {
                    info.set_attribute_string(
                        'metadata::nautilus-drop-position',
                        `${dropCoordinates[0]},${dropCoordinates[1]}`
                    );
                } else {
                    this.setPendingDropCoordinates(file, dropCoordinates);
                    return;
                }
            }

            try {
                await file.set_attributes_async(info,
                    Gio.FileQueryInfoFlags.NONE,
                    GLib.PRIORITY_LOW,
                    null);
            } catch (e) {
                if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND))
                    this.setPendingDropCoordinates(file, dropCoordinates);
            }
        }));
    }

    setPendingDropCoordinates(file, dropCoordinates) {
        if (!dropCoordinates)
            return;
        const basename = file.get_basename();

        this._pendingDropFiles = {};
        this._pendingSelfCopyFiles = {};

        let selfCopy = false;
        this.currentWorkingList.forEach(fileItem => {
            if (fileItem.fileName === basename) {
                this._pendingDropFiles[`${basename}COPYEXPECTED`] =
                    dropCoordinates;
                this._pendingSelfCopyFiles[basename] =
                    fileItem.savedCoordinates;
                selfCopy = true;
            }
        });

        if (!selfCopy)
            this._pendingDropFiles[basename] = dropCoordinates;
    }

    // Drag Methods

    startRubberband(X, Y) {
        this.rubberBandInitX = X;
        this.rubberBandInitY = Y;
        this.rubberBand = true;
        for (let item of this._displayList)
            item.touchedByRubberband = false;
    }

    onDragBegin(item) {
        this._saveCurrentFileCoordinatesForUndo();
        this.dragItem = item;
        this._stopGnomeShellDrag();
    }

    onDragMotion(X, Y) {
        if (this.dragItem === null) {
            for (let desktop of this._desktops)
                desktop.refreshDrag([[0, 0]], X, Y);

            return;
        }
        if (this._dragList === null) {
            const itemList = this._desktopManager.getCurrentSelection();
            if (!itemList)
                return;

            let [x1, y1] = this.dragItem.getCoordinates().slice(0, 3);
            let oX = x1;
            let oY = y1;
            this._dragList = [];
            for (let item of itemList) {
                [x1, y1] = item.getCoordinates().slice(0, 3);
                this._dragList.push([x1 - oX, y1 - oY]);
            }
        }
        for (let desktop of this._desktops)
            desktop.refreshDrag(this._dragList, X, Y);
        this._stopGnomeShellDrag();
        this.dragItem.setHighLighted();
    }

    onDragLeave() {
        this._dragList = null;
        for (let desktop of this._desktops)
            desktop.refreshDrag(null, 0, 0);
        // Synthesise, extrapolate drag motion on a shell actor
        this._startGnomeShellDrag();
    }

    onDragEnd() {
        this.dragItem = null;
        this._stopGnomeShellDrag();
    }

    async onDragDataReceived(
        xGlobalDestination,
        yGlobalDestination,
        xlocalDestination,
        ylocalDestination,
        dropData,
        acceptFormat,
        gdkDropAction,
        localDrop,
        event,
        dragItem
    ) {
        this.onDragLeave();

        let dropCoordinates;
        let xOrigin;
        let yOrigin;
        const forceCopy = gdkDropAction === Gdk.DragAction.COPY;
        const fileList = this.makeFileListFromSelection(dropData, acceptFormat);

        if (!this._Prefs.freePositionIcons) {
            [xGlobalDestination, yGlobalDestination] =
                this._positiveOffsetGridAim(
                    xGlobalDestination,
                    yGlobalDestination
                );
        }

        let returnAction;

        switch (acceptFormat) {
        case this._Enums.DndTargetInfo.DING_ICON_LIST:
            [xOrigin, yOrigin] = dragItem.getCoordinates().slice(0, 3);
            if (gdkDropAction === Gdk.DragAction.MOVE) {
                this.doMoveWithDragAndDrop(
                    xOrigin,
                    yOrigin,
                    xGlobalDestination,
                    yGlobalDestination
                );
                returnAction = Gdk.DragAction.MOVE;
                break;
            }
            // eslint-disable-next-line no-fallthrough
        case this._Enums.DndTargetInfo.GNOME_ICON_LIST:
        case this._Enums.DndTargetInfo.URI_LIST:
            if (!fileList)
                return;
            if (gdkDropAction === Gdk.DragAction.MOVE ||
                gdkDropAction === Gdk.DragAction.COPY) {
                try {
                    if (!localDrop) {
                        await this.clearFileCoordinates(
                            fileList,
                            [xGlobalDestination, yGlobalDestination],
                            {doCopy: forceCopy}
                        );
                    }
                    returnAction = await this.copyOrMoveUris(
                        fileList,
                        this._desktopDir.get_uri(),
                        event,
                        {forceCopy}
                    );
                } catch (e) {
                    console.error(e);
                }
            } else {
                if (gdkDropAction >= Gdk.DragAction.LINK)
                    returnAction = Gdk.DragAction.LINK;
                else
                    returnAction = Gdk.DragAction.COPY;
                this.askWhatToDoWithFiles(
                    fileList,
                    this._desktopDir.get_uri(),
                    xGlobalDestination,
                    yGlobalDestination,
                    xlocalDestination,
                    ylocalDestination,
                    event
                )
                .catch(e => logError(e));
            }
            break;
        case this._Enums.DndTargetInfo.TEXT_PLAIN:
            returnAction = Gdk.DragAction.COPY;
            dropCoordinates = [xGlobalDestination, yGlobalDestination];
            this._detectURLorText(dropData, dropCoordinates);
            break;
        default:
            returnAction = Gdk.DragAction.COPY;
        }
        // eslint-disable-next-line consistent-return
        return returnAction;
    }

    doMoveWithDragAndDrop(xOrigin, yOrigin, xDestination, yDestination) {
        const keepArranged =
            this._Prefs.keepArranged || this._Prefs.keepStacked;

        if (this._Prefs.sortSpecialFolders && keepArranged)
            return;

        let deltaX;
        let deltaY;

        if (!this._Prefs.freePositionIcons) {
            deltaX = xDestination - xOrigin;
            deltaY = yDestination - yOrigin;
        } else {
            deltaX = xDestination - xOrigin - this.localDragOffset[0] * 2;
            deltaY = yDestination - yOrigin - this.localDragOffset[1];
        }

        const fileItems = [];
        this._displayList.filter(item => item.isSelected).forEach(item => {
            if (!keepArranged || item.isSpecial) {
                fileItems.push(item);
                item.removeFromGrid({callOnDestroy: false});
                let [x, y] = item.getCoordinates().slice(0, 3);
                item.temporarySavedPosition = [x + deltaX, y + deltaY];
            }
        });

        // force to store the new coordinates
        this._desktopManager._addFilesToDesktop(fileItems,
            this._Enums.StoredCoordinates.OVERWRITE);
        if (keepArranged) {
            this._desktopManager.redrawDesktop().catch(e => {
                console.log(
                    'Exception while doing move with drag and drop and' +
                    `"Keep arranged…": ${e.message}\n${e.stack}`);
            });
        }
    }

    onTextDrop(dropData, [xGlobalDestination, yGlobalDestination]) {
        this._detectURLorText(
            dropData,
            [xGlobalDestination, yGlobalDestination]
        );
    }

    // Drag Motion

    onMotion(X, Y) {
        this.pointerX = X;
        this.pointerY = Y;
        if (this.rubberBand) {
            this.x1 = Math.min(X, this.rubberBandInitX);
            this.x2 = Math.max(X, this.rubberBandInitX);
            this.y1 = Math.min(Y, this.rubberBandInitY);
            this.y2 = Math.max(Y, this.rubberBandInitY);
            this.selectionRectangle =
                new Gdk.Rectangle({
                    'x': this.x1,
                    'y': this.y1,
                    'width': this.x2 - this.x1,
                    'height': this.y2 - this.y1,
                });
            this._drawSelectionRectangles();
            for (let item of this._displayList) {
                const labelintersect =
                    item.labelRectangle.intersect(this.selectionRectangle)[0];
                const iconintersect =
                    item.iconRectangle.intersect(this.selectionRectangle)[0];
                if (labelintersect || iconintersect) {
                    item.setSelected();
                    item.touchedByRubberband = true;
                } else if (item.touchedByRubberband) {
                    item.unsetSelected();
                }
            }
        }
    }

    onReleaseButton() {
        if (this.rubberBand) {
            this.rubberBand = false;
            this.selectionRectangle = null;
        }
        for (let grid of this._desktops)
            grid.drawRubberBand();

        return false;
    }

    // Selection HighLighting

    unHighLightDropTarget() {
        this._displayList.forEach(item => item.unHighLightDropTarget());
    }

    selected(fileItem, action) {
        switch (action) {
        case this._Enums.Selection.ALONE:
            if (!fileItem.isSelected) {
                for (let item of this._displayList) {
                    if (item === fileItem)
                        item.setSelected();
                    else
                        item.unsetSelected();
                }
            }
            break;
        case this._Enums.Selection.WITH_SHIFT:
            fileItem.toggleSelected();
            break;
        case this._Enums.Selection.RIGHT_BUTTON:
            if (!fileItem.isSelected) {
                for (let item of this._displayList) {
                    if (item === fileItem)
                        item.setSelected();
                    else
                        item.unsetSelected();
                }
            }
            break;
        case this._Enums.Selection.ENTER:
            if (this.rubberBand)
                fileItem.setSelected();

            break;
        case this._Enums.Selection.RELEASE:
            for (let item of this._displayList) {
                if (item === fileItem) {
                    if (item.isSelected)
                        item.setSelected();
                    else
                        item.unsetSelected();
                }
            }
            break;
        }
    }

    // File Copy Move Link Methods

    async copyOrMoveUris(uriList, destinationUri, event, params = {}) {
        if (params.forceCopy) {
            this._DBusUtils.RemoteFileOperations.pushEvent(event);
            this._DBusUtils.RemoteFileOperations.CopyURIsRemote(
                uriList,
                destinationUri
            );
            return Gdk.DragAction.COPY;
        }

        const moveFiles = [];
        const copyFiles = [];

        await Promise.all(uriList.map(async uri => {
            const f = Gio.File.new_for_uri(uri);
            const localFile = await this._fileIsOnDesktopFileSystem(f);

            // localFile is null if it does not exist, false if on different
            // fileystem, true if on the same filesystem as the Desktop Folder
            if (localFile == null) {
                console.error(`Cannot Copy/Move, ${uri} does not exist`);
                const header = _('Copy/Move Failed');
                const text = _('{0} Does not exist').replace('{0}', uri);
                this._dbusManager.doNotify(header, text);
                return;
            }
            if (localFile)
                moveFiles.push(uri);
            else
                copyFiles.push(uri);
        }));

        if (moveFiles.length) {
            this._DBusUtils.RemoteFileOperations.pushEvent(event);
            this._DBusUtils.RemoteFileOperations.MoveURIsRemote(
                moveFiles,
                destinationUri
            );
        }

        if (copyFiles.length) {
            this._DBusUtils.RemoteFileOperations.pushEvent(event);
            this._DBusUtils.RemoteFileOperations.CopyURIsRemote(
                copyFiles,
                destinationUri
            );
        }

        return moveFiles.length ? Gdk.DragAction.MOVE : Gdk.DragAction.COPY;
    }

    async askWhatToDoWithFiles(
        fileList,
        destinationuri,
        X,
        Y,
        x,
        y,
        event,
        opts = {desktopactions: true}
    ) {
        const window = this._mainApp.get_active_window();
        this._mainApp.activate_action('textEntryAccelsTurnOff', null);
        const chooser = new Gtk.AlertDialog();
        chooser.set_message(_('Choose Action for Files'));
        chooser.buttons = [_('Move'), _('Copy'), _('Link'), _('Cancel')];
        chooser.set_modal(false);
        chooser.set_cancel_button(3);
        chooser.set_default_button(3);
        const cancellable = Gio.Cancellable.new();
        if (this.dialogCancellable)
            this.dialogCancellable.cancel();
        this.dialogCancellable = cancellable;
        const showdialog = new Promise(resolve => {
            chooser.choose(window, cancellable, async (actor, choice) => {
                let retval = Gtk.ResponseType.CANCEL;
                try {
                    const buttonpress = actor.choose_finish(choice);
                    switch (buttonpress) {
                    case 0:
                        retval = Gdk.DragAction.MOVE;
                        try {
                            if (opts.desktopactions) {
                                await this.clearFileCoordinates(
                                    fileList,
                                    [X, Y]
                                );
                            }

                            let forceCopy = false;

                            await this.copyOrMoveUris(
                                fileList,
                                destinationuri,
                                event,
                                {forceCopy}
                            );
                        } catch {
                            console.error('Error moving files');
                        }
                        break;
                    case 1:
                        retval = Gdk.DragAction.COPY;
                        try {
                            if (opts.desktopactions) {
                                await this.clearFileCoordinates(
                                    fileList,
                                    [X, Y],
                                    {dopCopy: true}
                                );
                            }

                            let forceCopy = true;

                            await this.copyOrMoveUris(fileList,
                                destinationuri, event, {forceCopy});
                        } catch {
                            console.error('Error copying files');
                        }
                        break;
                    case 2:
                        retval = Gdk.DragAction.LINK;
                        try {
                            if (opts.desktopactions) {
                                await this.makeLinks(
                                    fileList,
                                    destinationuri,
                                    X,
                                    Y
                                );
                            } else {
                                this._makeFileSystemLinks(
                                    fileList,
                                    destinationuri
                                );
                            }
                        } catch {
                            console.error('Error making links');
                        }
                        break;
                    default:
                        retval = Gtk.ResponseType.CANCEL;
                    }
                    resolve(retval);
                } catch (e) {
                    if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) {
                        console.error(
                            e,
                            'Error asking choosing what to do with Files ' +
                            `${e.message}`
                        );
                    }
                    resolve(retval);
                }
            });
        });
        const retval = await showdialog.catch(e => logError(e));
        this.dialogCancellable = null;
        this._mainApp.activate_action('textEntryAccelsTurnOn', null);
        return retval;
    }

    async makeLinks(fileList, destination, X, Y) {
        const gioDestination = Gio.File.new_for_uri(destination);
        await Promise.all(fileList.map(async file => {
            const fileGio = Gio.File.new_for_uri(file);
            const newSymlinkName =
                this._desktopManager.desktopMonitor
                .getDesktopUniqueFileName(
                    fileGio.get_basename()
                );
            const symlinkGio =
                Gio.File.new_for_commandline_arg(
                    GLib.build_filenamev(
                        [gioDestination.get_path(), newSymlinkName]
                    )
                );
            try {
                const linkMade =
                    symlinkGio.make_symbolic_link(
                        GLib.build_filenamev([fileGio.get_path()]),
                        null
                    );

                if (linkMade) {
                    const info = new Gio.FileInfo();
                    info.set_attribute_string(
                        'metadata::nautilus-drop-position',
                        `${X},${Y}`
                    );
                    info.set_attribute_string(
                        'metadata::desktop-icon-position',
                        ''
                    );

                    try {
                        await symlinkGio.set_attributes_async(
                            info,
                            Gio.FileQueryInfoFlags.NONE,
                            GLib.PRIORITY_LOW,
                            null
                        );
                    } catch (e) {
                        console.error(e, 'Error setting link FileInfo');
                    }
                }
            } catch {
                console.error('Error making desktop links');
                const header = _('Making SymLink Failed');
                const text = _('Could not create symbolic link');
                this._dbusManager.doNotify(header, text);
            }
        }));
    }

    // Getters and Setters

    get pendingDropFiles() {
        return this._pendingDropFiles;
    }

    set pendingDropFiles(object) {
        this._pendingDropFiles = object;
    }

    get pendingSelfCopyFiles() {
        return this._pendingSelfCopyFiles;
    }

    set pendingSelfCopyFiles(object) {
        this._pendingSelfCopyFiles = object;
    }

    get currentSelection() {
        return this._desktopManager.getCurrentSelection();
    }

    get currentWorkingList() {
        return this._desktopManager.currentWorkingList;
    }

    get _displayList() {
        return this._desktopManager._displayList;
    }

    get _desktops() {
        return this._desktopManager._desktops;
    }

    get _desktopDir() {
        return this._desktopManager._desktopDir;
    }

    get localDrag() {
        return this._localDrag();
    }
};

