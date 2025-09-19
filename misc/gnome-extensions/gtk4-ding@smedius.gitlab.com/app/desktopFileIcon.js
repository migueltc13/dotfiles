/* DING: Desktop Icons New Generation for GNOME Shell
 *
 * Adw-DING Copyright (C) 2022, 2025 Sundeep Mediratta (smedius@gmail.com)
 * Based on code original (C) Carlos Soriano and (c) Sergio Costas
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

import {Gdk, Gio, GLib} from '../dependencies/gi.js';
import {FileItemIcon} from '../dependencies/localFiles.js';

import {_} from '../dependencies/gettext.js';

export {DesktopFileIcon};

const DesktopFileIcon = class extends FileItemIcon {
    _updateMetadataFromFileInfo(fileInfo) {
        super._updateMetadataFromFileInfo(fileInfo);

        this._isDesktopFile =
            this._attributeContentType === 'application/x-desktop';

        if (this._isDesktopFile && this._writableByOthers) {
            console.log(
                `desktop-icons: File ${this._displayName} is writable` +
                'by others - will not allow launching'
            );
        }

        if (this._isDesktopFile) {
            try {
                this._desktopFile = Gio.DesktopAppInfo.new_from_filename(
                    this._file.get_path()
                );

                if (!this._desktopFile) {
                    console.log(
                        `Couldn’t parse ${this._displayName} as a desktop` +
                        ' file, will treat it as a regular file.'
                    );

                    this._isValidDesktopFile = false;
                } else {
                    this._isValidDesktopFile = true;
                }
            } catch (e) {
                console.log(`Error reading Desktop file ${this.uri}: ${e}`);
            }
        } else {
            this._isValidDesktopFile = false;
        }

        if (this._isValidDesktopFile)
            this._execLine = null;

        this._trusted =
            fileInfo.get_attribute_as_string('metadata::trusted') === 'true';

        this._getActions();
    }

    _getActions() {
        if (!this.trustedDesktopFile)
            return;

        this.desktopAppInfo =
            Gio.DesktopAppInfo.new_from_filename(this.path);

        this.actionMap = new Map();

        const actions = this.desktopAppInfo.list_actions();

        actions.forEach(action => {
            const actionName =
                this.desktopAppInfo.get_action_name(action);

            this.actionMap.set(actionName, action);
        });
    }

    _makeActionMenu() {
        this._actionmenu = Gio.Menu.new();
        for (const [actionName, action] of this.actionMap) {
            const variant =
                new GLib.Variant('as', [this.path, actionName, action]);

            const menuItem = Gio.MenuItem.new(actionName, null);
            menuItem.set_action_and_target_value('app.desktopAction', variant);
            this._actionmenu.append_item(menuItem);
        }
    }

    getMenu() {
        if (!this.hasActions)
            return null;

        this._makeActionMenu();
        return this._actionmenu;
    }

    async _doOpenContext(context, fileList = []) {
        if (this._isDesktopFile) {
            try {
                this._launchDesktopFile(context, fileList);
            } catch (e) {}

            return;
        }

        await super._doOpenContext(context, fileList);
    }

    _launchDesktopFile(context, fileList) {
        if (this._desktopManager.writableByOthers) {
            const title = _('The Displayed Desktop is writable by others');
            const error =
                _(
                    '.deskop files cannot be launched from this Desktop' +
                    ' as the Desktop Folder is writable by other users.\n\n' +
                    'Please check the permissions of this Desktop Folder,' +
                    ' and make sure it is not writable by others.'
                );

            this._showerrorpopup(title, error);
            return;
        }
        if (!this._isValidDesktopFile) {
            const title = _('Broken Desktop File');
            const error =
                _(
                    'This .desktop file has errors or points to a program' +
                    ' without permissions. It can not be executed.\n\n' +
                    'Edit the file to set the correct executable Program.'
                );

            this._showerrorpopup(title, error);
            return;
        }

        if (this._writableByOthers || !this._attributeCanExecute) {
            const title = _('Invalid Permissions on Desktop File');
            let error =
                _(
                    'This .desktop File has incorrect Permissions.' +
                    ' Right Click to edit Properties, then:\n'
                );

            if (this._writableByOthers) {
                error +=
                _(
                    '\nSet Permissions, in "Others Access",' +
                    ' "Read Only" or "None"'
                );
            }

            if (!this._attributeCanExecute) {
                error +=
                _(
                    '\nEnable option, "Allow Executing File as a Program"'
                );
            }

            this._showerrorpopup(title, error);
            return;
        }

        if (!this.trustedDesktopFile) {
            const title = _('Untrusted Desktop File');
            const error =
                _(
                    'This .desktop file is not trusted, it can not be' +
                    ' launched. To enable launching, right-click, then:\n\n' +
                    'Enable "Allow Launching"'
                );

            this._showerrorpopup(title, error);
            return;
        }

        let object =
            this.DesktopIconsUtil.checkAppOpensFileType(
                this._desktopFile,
                fileList[0],
                null
            );

        if (this.trustedDesktopFile &&
            (!fileList.length || object.canopenFile)
        ) {
            this._desktopFile.launch_uris_as_manager(
                fileList,
                context,
                GLib.SpawnFlags.SEARCH_PATH,
                null,
                null
            );
        } else if (this.trustedDesktopFile && !object.canopenFile) {
            const Appname = object.Appname;
            const title = _('Could not open File');
            const error =
                _('{appName} can not open files of this Type!')
                .replace('{appName}', Appname);

            this._showerrorpopup(title, error);
        }
    }

    _updateName() {
        if (this._isValidDesktopFile &&
            !this._desktopManager.writableByOthers &&
            !this._writableByOthers &&
            this.trustedDesktopFile
        )
            this._setFileName(this._desktopFile.get_locale_string('Name'));
        else
            this._setFileName(this._getVisibleName());

        this._setAccesibilityName();
    }

    _handleDroppedUris(
        X, Y,
        x, y,
        fileList,
        _gdkDropAction,
        _localDrop,
        _event
    ) {
        if (this._isValidDesktopFile) {
            // open the desktop file with these dropped files as the arguments
            this.doOpen(fileList);
            return Gdk.DragAction.COPY;
        } else {
            return false;
        }
    }

    _dropCapable() {
        if (this._isValidDesktopFile)
            return true;
        else
            return false;
    }

    _addEmblemsToIconIfNeeded(iconPaintable, position = 0) {
        let emblem = null;
        let newIconPaintable = iconPaintable;

        if (this._isDesktopFile &&
            (!this._isValidDesktopFile || !this.trustedDesktopFile)
        ) {
            emblem = Gio.ThemedIcon.new('icon-emblem-unreadable');

            newIconPaintable =
                this._addEmblem(newIconPaintable, emblem, position);

            position += 1;
        }

        return super._addEmblemsToIconIfNeeded(newIconPaintable, position);
    }

    async onAllowDisallowLaunchingClicked() {
        if (this._isDesktopFile)
            this.metadataTrusted = !this.trustedDesktopFile;

        await super.onAllowDisallowLaunchingClicked();
    }

    get canRename() {
        return !this.trustedDesktopFile;
    }

    get displayName() {
        if (this.trustedDesktopFile)
            return this._desktopFile.get_name();

        return super.displayName;
    }

    get isDesktopFile() {
        return this._isDesktopFile;
    }

    get trustedDesktopFile() {
        return this._isValidDesktopFile &&
               this._attributeCanExecute &&
               this.metadataTrusted &&
               !this._desktopManager.writableByOthers &&
               !this._writableByOthers;
    }

    get isValidDesktopFile() {
        return this._isValidDesktopFile;
    }

    get hasActions() {
        return this.trustedDesktopFile && this.actionMap.size > 0;
    }
};
