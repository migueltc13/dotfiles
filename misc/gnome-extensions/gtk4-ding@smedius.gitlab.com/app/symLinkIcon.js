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

import {_} from '../dependencies/gettext.js';

export {SymLinkIcon};

const SymLinkIcon = class {
    constructor(
        Basetype,
        ddesktopManager,
        ffile,
        ffileInfo,
        ffileTypeEnum,
        ggioMount
    ) {
        const SymLinkSuperClass = class extends Basetype {
            constructor(
                desktopManager,
                file,
                fileInfo,
                fileTypeEnum,
                gioMount
            ) {
                super(desktopManager, file, fileInfo, fileTypeEnum, gioMount);

                this._isSymlink = fileInfo.get_attribute_boolean(
                    Gio.FILE_ATTRIBUTE_STANDARD_IS_SYMLINK
                );

                /*
                * This is a glib trick to detect broken symlinks. If a file is a
                * symlink, the filetype points to the final file, unless it is broken;
                * thus if the file type is SYMBOLIC_LINK, it must be a broken link.
                * https://developer.gnome.org/gio/stable/GFile.html#g-file-query-info
                */
                this._isBrokenSymlink =
                    this._isSymlink &&
                    this._fileType === Gio.FileType.SYMBOLIC_LINK;

                if (this._isSymlink && !this._symlinkFileMonitor)
                    this._monitorSymlink();
            }

            _updateMetadataFromFileInfo(fileInfo) {
                this._isSymlink = fileInfo.get_attribute_boolean(
                    Gio.FILE_ATTRIBUTE_STANDARD_IS_SYMLINK
                );

                /*
                * This is a glib trick to detect broken symlinks. If a file is a
                * symlink, the filetype points to the final file, unless it is broken;
                * thus if the file type is SYMBOLIC_LINK, it must be a broken link.
                * https://developer.gnome.org/gio/stable/GFile.html#g-file-query-info
                */
                this._isBrokenSymlink =
                    this._isSymlink &&
                    this._fileType === Gio.FileType.SYMBOLIC_LINK;

                super._updateMetadataFromFileInfo(fileInfo);
            }

            _destroy() {
                super._destroy();

                if (this._symlinkFileMonitorId) {
                    this._symlinkFileMonitor.disconnect(this._symlinkFileMonitorId);
                    this._symlinkFileMonitor.cancel();
                    this._symlinkFileMonitorId = 0;
                }
            }

            async _doOpenContext(context, fileList) {
                if (!fileList)
                    fileList = [];

                if (this._isBrokenSymlink) {
                    try {
                        console.log(
                            `Error: Can’t open ${this.file.get_uri()}` +
                        ' because it is a broken symlink.'
                        );

                        const title = _('Broken Link');
                        const error =
                        _('Can not open this File because it is a Broken Symlink');

                        this._showerrorpopup(title, error);
                    } catch (e) {}

                    return;
                }

                await super._doOpenContext(context, fileList);
            }

            _monitorSymlink() {
                let symlinkTarget = this._fileInfo.get_symlink_target();
                let symlinkTargetGioFile = Gio.File.new_for_path(symlinkTarget);

                this._symlinkFileMonitor = symlinkTargetGioFile.monitor(
                    Gio.FileMonitorFlags.WATCH_MOVES,
                    null
                );

                this._symlinkFileMonitor.set_rate_limit(1000);

                this._symlinkFileMonitorId = this._symlinkFileMonitor.connect(
                    'changed',
                    this._updateSymlinkIcon.bind(this)
                );
            }

            async _updateSymlinkIcon() {
                await this._reloadIcon().catch(e => {
                    if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) {
                        console.error(
                            e,
                            `Exception while updating ${
                                this._getVisibleName()
                                    ? this._getVisibleName()
                                    : 'symlink icon'
                            }: ${e.message}`);
                    }
                });
            }

            _addEmblemsToIconIfNeeded(iconPaintable, position = 0) {
                let emblem = null;
                let newIconPaintable = iconPaintable;

                if (this._isSymlink && this.Prefs.showLinkEmblem) {
                    emblem = Gio.ThemedIcon.new('icon-emblem-symbolic-link');

                    newIconPaintable =
                    this._addEmblem(newIconPaintable, emblem, position);

                    position += 1;
                }

                if (this._isBrokenSymlink) {
                    emblem = Gio.ThemedIcon.new('icon-emblem-unreadable');

                    newIconPaintable =
                    this._addEmblem(newIconPaintable, emblem, position);

                    position += 1;
                }

                return super._addEmblemsToIconIfNeeded(newIconPaintable, position);
            }
        };

        return new SymLinkSuperClass(
            ddesktopManager,
            ffile,
            ffileInfo,
            ffileTypeEnum,
            ggioMount
        );
    }
};
