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

import {Gtk, Gio} from '../dependencies/gi.js';
import {FileItemIcon} from '../dependencies/localFiles.js';

import {_} from '../dependencies/gettext.js';

export {VolumeIcon};

const VolumeIcon = class extends FileItemIcon {
    constructor(desktopManager, file, fileInfo, fileExtra, gioMount) {
        super(desktopManager, file, fileInfo, fileExtra, gioMount);

        if (this._gioMount) {
            /* gjs doesn't handle some virtual implementations well*/
            Gio._promisify(this._gioMount.constructor.prototype,
                'eject_with_operation');
            Gio._promisify(this._gioMount.constructor.prototype,
                'unmount_with_operation');
        }
    }

    _destroy() {
        super._destroy();

        if (this._umountCancellable)
            this._umountCancellable.cancel();

        if (this._ejectCancellable)
            this._ejectCancellable.cancel();
    }

    _getVisibleName() {
        if (this._fileTypeEnum === this.Enums.FileType.EXTERNAL_DRIVE)
            return this._gioMount.get_name();

        return super._getVisibleName();
    }

    _setAccesibilityName() {
        const visibleName = this._getVisibleName();
        const driveName = _('Drive');

        if (this._fileTypeEnum === this.Enums.FileType.EXTERNAL_DRIVE) {
        /** TRANSLATORS: when using a screen reader, this is the text
         * read when an external drive is selected.
         * Example: if a USB stick named "my_portable"
         * is selected, it will say "my_portable Drive" */
            this.container.update_property(
                [Gtk.AccessibleProperty.LABEL],
                [`${visibleName} ${driveName}`]
            );
        }
    }

    _getDefaultIcon() {
        if (this._fileTypeEnum === this.Enums.FileType.EXTERNAL_DRIVE)
            return this._gioMount.get_icon();

        return super._getDefaultIcon();
    }


    async eject(atWidget) {
        if (!this._gioMount || this._ejectCancellable)
            return;

        const parentWidget =  atWidget ?? this._grid._window;
        const mountOp = new Gtk.MountOperation();
        mountOp.set_parent(parentWidget);
        this._ejectCancellable = new Gio.Cancellable();

        try {
            await this._gioMount.eject_with_operation(
                Gio.MountUnmountFlags.NONE,
                mountOp,
                this._ejectCancellable
            );
        } catch (e) {
            // I cannot find the exact Gio Enum, Gio.MountOperationResult
            // does not work. Shortcut :)
            // logError(e, `Mount failed: ${e.domain} ${e.code}`);
            if (!(e.domain === 195 && e.code === 30)) {
                console.error(
                    e,
                    `Exception ejecting Volume ${
                        this._getVisibleName()
                            ? this._getVisibleName()
                            : 'Volume icon'
                    }: ${e.message}`
                );
            }
        } finally {
            this._ejectCancellable = null;
        }
    }

    async unmount(atWidget) {
        if (!this._gioMount || this._umountCancellable)
            return;

        const parentWidget = atWidget ?? this._grid._window;
        const mountOp = new Gtk.MountOperation();
        mountOp.set_parent(parentWidget);
        this._umountCancellable = new Gio.Cancellable();

        try {
            await this._gioMount.unmount_with_operation(
                Gio.MountUnmountFlags.NONE,
                mountOp,
                this._umountCancellable
            );
        } catch (e) {
            // I cannot find the exact Gio Enum, Gio.MountOperationResult
            // does not work. Shortcut :)
            // logError(e, `Mount failed: ${e.domain} ${e.code}`);
            if (!(e.domain === 195 && e.code === 30)) {
                console.error(
                    e,
                    `Exception unmounting Volume ${
                        this._getVisibleName()
                            ? this._getVisibleName()
                            : 'Volume icon'
                    }: ${e.message}`
                );
            }
        } finally {
            this._umountCancellable = null;
        }
    }

    get canEject() {
        if (this._gioMount)
            return this._gioMount.can_eject();
        else
            return false;
    }

    get canUnmount() {
        if (this._gioMount)
            return this._gioMount.can_unmount();
        else
            return false;
    }
};
