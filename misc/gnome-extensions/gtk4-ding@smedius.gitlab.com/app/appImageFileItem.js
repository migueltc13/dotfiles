/*
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

import {Gio} from '../dependencies/gi.js';
import {FileItemIcon} from '../dependencies/localFiles.js';

import {_} from '../dependencies/gettext.js';

export {AppImageFileIcon};

const AppImageFileIcon = class extends FileItemIcon {
    _updateMetadataFromFileInfo(fileInfo) {
        super._updateMetadataFromFileInfo(fileInfo);

        this._isAppImageFile =
            this._attributeContentType === 'application/vnd.appimage';

        this._trusted =
            fileInfo.get_attribute_as_string('metadata::trusted') === 'true';
    }

    async onAllowDisallowLaunchingClicked() {
        if (this._isAppImageFile)
            this.metadataTrusted = !this.trustedAppImageFile;

        await super.onAllowDisallowLaunchingClicked();
    }

    async _doOpenContext(context, fileList) {
        if (this._isAppImageFile) {
            try {
                this._launchAppImageFile(context, fileList);
            } catch (e) {}

            return;
        }

        await super._doOpenContext(context, fileList);
    }

    _launchAppImageFile() {
        if (this._writableByOthers || !this._attributeCanExecute) {
            const title = _('Invalid Permissions on AppImage File');
            let error =
                _(
                    'This AppImage File has incorrect Permissions.' +
                    ' Right Click to edit Properties, then:\n'
                );

            if (this._writableByOthers) {
                error +=
                _(
                    '\nSet Permissions, in "Others Access", "Read Only"' +
                    ' or "None"'
                );
            }

            if (!this._attributeCanExecute) {
                error +=
                    _('\nEnable option, "Allow Executing File as a Program"');
            }

            this._showerrorpopup(title, error);
            return;
        }

        if (!this.trustedAppImageFile) {
            const title = _('Untrusted AppImage File');
            const error =
                _(
                    'This AppImage file is not trusted, it can not be launched.' +
                    ' To enable launching, right-click, then:\n\n' +
                    'Enable "Allow Launching"'
                );

            this._showerrorpopup(title, error);
            return;
        }

        const appImageHandler =
            Gio.AppInfo.get_all_for_type(this.attributeContentType);

        if (appImageHandler.some(
            app => {
                if (app.get_name().toLowerCase().includes('appimagelauncher'))
                    return app.launch_uris([this.uri], null);

                return false;
            }
        )
        )
            return;

        this.DesktopIconsUtil.trySpawn(this._desktopDir.get_path(),
            [this.path], null, false);
    }

    _addEmblemsToIconIfNeeded(iconPaintable, position = 0) {
        let emblem = null;
        let newIconPaintable = iconPaintable;

        if (this.isAppImageFile && !this.trustedAppImageFile) {
            emblem = Gio.ThemedIcon.new('icon-emblem-unreadable');

            newIconPaintable =
                this._addEmblem(newIconPaintable, emblem, position);

            position += 1;
        }

        return super._addEmblemsToIconIfNeeded(newIconPaintable, position);
    }

    get isAppImageFile() {
        return this._isAppImageFile;
    }

    get trustedAppImageFile() {
        return this._isAppImageFile &&
        this._attributeCanExecute &&
        this.metadataTrusted &&
        !this._desktopManager.writableByOthers &&
        !this._writableByOthers;
    }
};
