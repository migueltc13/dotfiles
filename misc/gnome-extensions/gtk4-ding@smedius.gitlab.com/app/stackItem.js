
/* DING: Desktop Icons New Generation for GNOME Shell
 *
 * Copyright (C) Gtk4 port 2022, 2025 Sundeep Mediratta (smedius@gmail.com)
 * Copyright (C) 2019 Sergio Costas (rastersoft@gmail.com)
 * Based on code original (C) Carlos Soriano
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
import {_} from '../dependencies/gettext.js';
import {Gdk, Gio, Graphene, Gtk, Gsk, GLib} from '../dependencies/gi.js';
import * as DesktopIconItem from './desktopIconItem.js';

export {StackItem};

const Signals = imports.signals;

const StackItem = class extends DesktopIconItem.DesktopIconItem {
    constructor(desktopManager, file, attributeContentType, fileTypeEnum) {
        super(desktopManager, fileTypeEnum);
        this._isSpecial = false;
        this._file = file;
        this.isStackTop = true;
        this.stackUnique = false;
        this._size = null;
        this._modifiedTime = null;
        this._attributeContentType = attributeContentType;
        this._createIconActor();
        this._createStackTopIcon();
        const stackName = this._file;
        /** TRANSLATORS: when using a screen reader,
         * this is the text read when a stack is
         * selected. Example: if a stack named "pictures"
         *  is selected, it will say "Stack pictures" */
        const accessibleName = _('Stack');
        this._setLabelName(stackName);
        this.container.update_property(
            [Gtk.AccessibleProperty.LABEL],
            [`${accessibleName} ${stackName}`]
        );
        this._savedCoordinates = null;
    }

    _createStackedAttributeContentTypeIcon()  {
        const stackIcon = Gtk.Snapshot.new();
        /* A shadow for the pile of icons gives a sense of floating. */
        const stackShadow = {
            color: {red: 0, green: 0, blue: 0, alpha: 0.15},
            dx: 2,
            dy: 0,
            radius: 1,
        };
        /* A slight shadow swhich makes each icon in the stack look separate. */
        const iconShadow = {
            color: {red: 0, green: 0, blue: 0, alpha: 0.30},
            dx: 1,
            dy: 0,
            radius: 1,
        };
        const numberOfIcons = 5;
        let yOffset = 0;
        let xOffset = this.unStacked ? 8 : 4;
        const icon = Gio.content_type_get_icon(this._attributeContentType);
        const theme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default());
        const scale = this._icon.get_scale_factor();
        let iconPaintable = null;
        try {
            iconPaintable = theme.lookup_by_gicon(
                icon,
                this.Prefs.IconSize,
                scale, Gtk.TextDirection.NONE,
                Gtk.IconLookupFlags.FORCE_SIZE
            );
        } catch (e) {
            iconPaintable = theme.lookup_icon(
                'image-missing',
                [],
                this.Prefs.IconSize,
                scale,
                Gtk.TextDirection.NONE,
                Gtk.IconLookupFlags.FORCE_SIZE
            );
        }
        const stackIconArray = Array(numberOfIcons).fill(iconPaintable);
        const w = iconPaintable.get_intrinsic_width();
        const h = iconPaintable.get_intrinsic_height();
        let X = xOffset * numberOfIcons;
        let Y = yOffset;

        stackIcon.translate(new Graphene.Point({x: X, y: Y}));
        stackIcon.push_shadow([new Gsk.Shadow(stackShadow)]);

        stackIconArray.forEach(paintableWidget => {
            // Position each widget from right to left
            X =  -xOffset;
            stackIcon.translate(new Graphene.Point({x: X, y: Y}));
            stackIcon.push_shadow([new Gsk.Shadow(iconShadow)]);

            // Render the paintable widget
            paintableWidget.snapshot(stackIcon, w, h);

            stackIcon.pop(); // Remove shadow effect for the next widget
        });
        // Remove the initial transformation & shadow
        stackIcon.pop();

        return stackIcon.to_paintable(null);
    }

    _createStackTopIcon() {
        const stackIcon = this._createStackedAttributeContentTypeIcon();
        const iconPaintable = this._addEmblemsToIconIfNeeded(stackIcon);
        this._icon.set_paintable(iconPaintable);
    }

    // eslint-disable-next-line no-unused-vars
    _doButtonOnePressed(button, X, Y, x, y, shiftPressed, controlPressed) {
        const variant = GLib.Variant.new('s', this.attributeContentType);
        this._desktopManager.mainApp.activate_action(
            'stackunstack',
            variant
        );
    }

    setSelected() {
        this.container.grab_focus();
    }

    unsetSelected() {
        this._keyboardUnSelected();
    }

    updateIcon() {
        this._createStackTopIcon();
    }

    _addEmblemsToIconIfNeeded(iconPaintable) {
        let emblem = null;

        if (this.isStackTop && !this.stackUnique)
            emblem = Gio.ThemedIcon.new('icon-emblem-stack');

        return this._addEmblem(iconPaintable, emblem);
    }

    keyboardSelected() {
        if (!this._iconContainer.get_css_classes().includes('mimic-hovered')) {
            this._iconContainer.add_css_class('mimic-hovered');
            this._labelContainer.add_css_class('mimic-hovered');
        }
    }

    _keyboardUnSelected() {
        if (this._iconContainer.get_css_classes().includes('mimic-hovered')) {
            this._iconContainer.remove_css_class('mimic-hovered');
            this._labelContainer.remove_css_class('mimic-hovered');
        }
    }

    /** *********************
     * Getters and setters *
     ***********************/

    get attributeContentType() {
        return this._attributeContentType;
    }

    get displayName() {
        return this._file;
    }

    get file() {
        return this._file;
    }

    get fileName() {
        return this._file;
    }

    get fileSize() {
        return this._size;
    }

    get isAllSelectable() {
        return false;
    }

    get modifiedTime() {
        return this._modifiedTime;
    }

    get path() {
        return `/tmp/${this._file}`;
    }

    get uri() {
        return `file:///tmp/${this._file}`;
    }

    get isStackMarker() {
        return true;
    }

    get savedCoordinates() {
        return this._savedCoordinates;
    }

    get unStacked() {
        return this.Prefs.UnstackList.includes(this._attributeContentType);
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

    set size(size) {
        this._size = size;
    }

    set time(time) {
        this._modifiedTime = time;
    }

    set savedCoordinates(pos) {
    }
};
Signals.addSignalMethods(StackItem.prototype);
