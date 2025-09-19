/* DING: Desktop Icons New Generation for GNOME Shell
 *
 * Gtk4 Port Copyright (C) 2022 - 2025 Sundeep Mediratta (smedius@gmail.com)
 * Based on code original (C) Carlos Soriano and Sergio Costas
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

import {Gtk, Gdk, Gio} from '../dependencies/gi.js';
import {FileItemIcon} from '../dependencies/localFiles.js';

import {_} from '../dependencies/gettext.js';

export {SpecialFolderIcon};

const SpecialFolderIcon = class extends FileItemIcon {
    constructor(desktopManager, file, fileInfo, fileTypeEnum, gioMount) {
        super(desktopManager, file, fileInfo, fileTypeEnum, gioMount);

        this._isTrash =
            this._fileTypeEnum === this.Enums.FileType.USER_DIRECTORY_TRASH;

        if (this.isTrash) {
            // if this icon is the trash, monitor the state of the
            //  directory to update the icon
            this._monitorTrash();
        } else {
            this._monitorTrashId = 0;
        }
    }

    _destroy() {
        super._destroy();
        /* Trash */
        if (this._monitorTrashId) {
            this._monitorTrashDir.disconnect(this._monitorTrashId);
            this._monitorTrashDir.cancel();
            this._monitorTrashId = 0;
        }
    }

    _setFileName(text) {
        if (this._fileTypeEnum === this.Enums.FileType.USER_DIRECTORY_HOME) {
            // TRANSLATORS: "Home" is the text that will be shown in
            //  the user's personal folder
            text = _('Home');
        }
        super._setLabelName(text);
    }

    _setAccesibilityName() {
        const trashName = _('Trash');

        switch (this._fileTypeEnum) {
        case  this.Enums.FileType.USER_DIRECTORY_HOME:
            this.container.update_property(
                [Gtk.AccessibleProperty.LABEL],
                [_('Home')]
            );
            break;

        case this.Enums.FileType.USER_DIRECTORY_TRASH:
            /** TRANSLATORS: when using a screen reader,this is the text read
             *  when the trash folder is selected. */
            this.container.update_property(
                [Gtk.AccessibleProperty.LABEL],
                [`${trashName}`]
            );
            break;
        }
    }

    _updateMetadataFromFileInfo(fileInfo) {
        super._updateMetadataFromFileInfo(fileInfo);

        this._isTrash =
            this._fileTypeEnum === this.Enums.FileType.USER_DIRECTORY_TRASH;
    }

    _monitorTrash() {
        this._monitorTrashDir =
            this._file.monitor_directory(
                Gio.FileMonitorFlags.WATCH_MOVES,
                null
            );

        this._monitorTrashDir.set_rate_limit(1000);

        this._monitorTrashId =
            this._monitorTrashDir.connect(
                'changed',
                (_obj, _file, _otherFile, eventType) => {
                    this._refreshTrashIcon(eventType);
                }
            );
    }

    async _refreshTrashIcon(eventType) {
        switch (eventType) {
        case Gio.FileMonitorEvent.DELETED:
        case Gio.FileMonitorEvent.MOVED_OUT:
        case Gio.FileMonitorEvent.CREATED:
        case Gio.FileMonitorEvent.MOVED_IN:
            await this._reloadIcon().catch(e => {
                if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) {
                    console.error(
                        e,
                        `Exception while updating ${
                            this._getVisibleName()
                                ? this._getVisibleName()
                                : 'Trash icon'
                        }: ${e.message}`);
                }
            });

            break;
        }

        return false;
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

        if (this._fileTypeEnum === this.Enums.FileType.USER_DIRECTORY_TRASH) {
            if (localDrop) {
                this._desktopManager
                .fileItemActions
                .doTrash(localDrop, event);
            } else {
                this.DBusUtils.RemoteFileOperations.pushEvent(event);
                this.DBusUtils.RemoteFileOperations.TrashURIsRemote(fileList);
            }

            if (forceCopy)
                return Gdk.DragAction.COPY;
            else
                return Gdk.DragAction.MOVE;
        }

        const returnaction = await super._handleDroppedUris(
            X, Y,
            x, y,
            fileList,
            gdkDropAction,
            localDrop,
            event
        );

        return returnaction;
    }

    get isTrash() {
        return this._isTrash;
    }
};
