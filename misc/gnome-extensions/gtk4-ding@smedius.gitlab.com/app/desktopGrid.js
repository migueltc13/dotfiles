/* DING: Desktop Icons New Generation for GNOME Shell
 *
 * Gtk4 Port Copyright (C) 2022 - 2025 Sundeep Mediratta (smedius@gmail.com)
 * Copyright (C) 2019 Sergio Costas (rastersoft@gmail.com)
 * Based on code original (C) Carlos Soriano
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
import {Gtk, Gdk, GLib, Gio, Graphene, Gsk, Adw} from '../dependencies/gi.js';
import {_} from '../dependencies/gettext.js';

export {DesktopGrid};

// eslint-disable-next-line no-unused-vars
const DisplayGrid = class {
    constructor(desktopManager, desktopName, desktopDescription, asDesktop, hidden = false) {
        this._destroying = false;
        this._desktopManager = desktopManager;
        this._dragManager = desktopManager.dragManager;
        this.Prefs = this._desktopManager.Prefs;
        this.DesktopIconsUtil = this._desktopManager.DesktopIconsUtil;
        this.DBusUtils = this._desktopManager.DBusUtils;
        this.Enums = this._desktopManager.Enums;
        this.elementSpacing = this.Enums.GRID_ELEMENT_SPACING;
        this.gridPadding = this.Enums.GRID_PADDING;
        this._desktopName = desktopName;
        this._asDesktop = asDesktop;
        this._desktopDescription = desktopDescription;
        this._using_X11 = this.DesktopIconsUtil.usingX11();
        this.directoryOpenTimer = null;
        this.windowGlobalRectangle = new Gdk.Rectangle();
        this._updateWindowGeometry();
        this._updateUnscaledHeightWidthMargins();
        this._createGrids();

        this._window =
            new Adw.ApplicationWindow(
                {
                    application: desktopManager.mainApp,
                    'title': desktopName,
                }
            );

        this._window.update_property(
            [Gtk.AccessibleProperty.LABEL],
            [_('Desktop Icons')]
        );

        if (this._asDesktop) {
            this._window.set_decorated(false);
            this._window.set_deletable(false);

            // Transparent Background only if this is working as a desktop
            this._window.set_name('desktopwindow');

            if (!this._using_X11) {
                // Wayland Compositer hang on some high resolution
                // requires all windows be maximized to map and display
                // initially.
                this._window.maximize();

                // However this creates an error where the window can
                // be moved by the user by dragging down on top panel.
                // So we unmaximize all windows after they are mapped
                //  as maximization is not needed anymore.
                this._window.connect('map', () => this._window.unmaximize());
            }
        } else {
            // Opaque black test window
            this._window.set_name('testwindow');
            const headerBar = Adw.HeaderBar.new();
            const headerTitle = Adw.WindowTitle.new('DING Test Window', '');
            headerBar.set_title_widget(headerTitle);
            headerBar.set_show_end_title_buttons(true);
            this.testbox = Gtk.Box.new(Gtk.Orientation.VERTICAL, 0);
            this.testbox.append(headerBar);
        }

        // Remove any other css classes, even if applied by other apps later
        this._window.set_css_classes(['background']);
        this._window.connect('notify::css_classes', () => {
            this._window.set_css_classes(['background']);
        });

        this._window.set_resizable(false);

        this._window.connect(
            'close-request',
            () => {
                if (this._destroying)
                    return false;

                if (this._asDesktop) {
                    // Do not destroy window when closing if the instance
                    // is working as desktop
                    return true;
                } else {
                    // Exit if this instance is working as an
                    // stand-alone window
                    this._desktopManager.terminateProgram();
                    return false;
                }
            }
        );

        this._container = new Gtk.Fixed();
        this._containerContext = this._container.get_style_context();
        this._containerContext.add_class('unhighlightdroptarget');
        this._sizeContainer(this._container);

        this._overlay = new Gtk.Overlay();
        this._overlay.set_child(this._container);
        if (this._asDesktop) {
            this._window.set_content(this._overlay);
        } else {
            this.testbox.append(this._overlay);
            this._window.set_content(this.testbox);
        }

        this.gridGlobalRectangle = new Gdk.Rectangle();

        this._selectedList = null;

        this._setGridStatus();

        if (!hidden)
            this._window.show();
        else
            this._window.hide();

        this._window.set_size_request(this._windowWidth, this._windowHeight);

        this._updateGridRectangle();
    }

    setErrorState() {
        this._window.set_name('errorstate');
    }

    unsetErrorState() {
        if (this._asDesktop)
            this._window.set_name('desktopwindow');
        else
            this._window.set_name('testwindow');
    }

    hide() {
        this._window.hide();
        this._hidden = true;
    }

    show() {
        this._window.present();
        this._hidden = false;
    }

    // Establish and update window geometry, establish and update
    // grid for the desktop icons

    updateGridDescription(desktopDescription) {
        this._desktopDescription = desktopDescription;
    }

    _updateWindowGeometry() {
        this._zoom = this._desktopDescription.zoom;
        this._x = this._desktopDescription.x;
        this._y = this._desktopDescription.y;
        this._monitor = this._desktopDescription.monitorIndex;
        this._sizer = this._zoom;

        if (this._asDesktop) {
            if (this._using_X11)
                this._sizer = Math.ceil(this._zoom);
            else if (this.Prefs.fractionalScaling)
                this._sizer = 1;
        }

        this._windowWidth =
            Math.floor(this._desktopDescription.width / this._sizer);
        this._windowHeight =
            Math.floor(this._desktopDescription.height / this._sizer);
        this.windowGlobalRectangle.x = this._x;
        this.windowGlobalRectangle.y = this._y;
        this.windowGlobalRectangle.width = this._windowWidth;
        this.windowGlobalRectangle.height = this._windowHeight;
    }

    resizeWindow() {
        this._updateWindowGeometry();
        this._desktopName = `@!${this._x},${this._y};BDHF`;
        this._window.set_title(this._desktopName);
        this._window.set_default_size(this._windowWidth, this._windowHeight);
        this._window.set_size_request(this._windowWidth, this._windowHeight);
        this.scale = this._window.get_scale_factor();
        this._drawArea.set_content_height(this._windowHeight);
        this._drawArea.set_content_width(this._windowWidth);
    }

    _updateUnscaledHeightWidthMargins() {
        this._marginLeftHiddenObject = false;
        this._marginRightHiddenObject = false;
        this._marginTopHiddenObject = false;
        this._marginBottomHiddenObject = false;

        this._marginTop = this._desktopDescription.marginTop + this.gridPadding;

        if (this._marginTop > 1000) {
            this._marginTopHiddenObject = true;
            this._marginTop -= 1000;
        }

        this._marginBottom =
            this._desktopDescription.marginBottom + this.gridPadding;

        if (this._marginBottom > 1000) {
            this._marginBottomHiddenObject = true;
            this._marginBottom -= 1000;
        }

        this._marginLeft =
            this._desktopDescription.marginLeft + this.gridPadding;

        if (this._marginLeft > 1000) {
            this._marginLeftHiddenObject = true;
            this._marginLeft -= 1000;
        }

        this._marginRight =
            this._desktopDescription.marginRight + this.gridPadding;

        if (this._marginRight > 1000) {
            this._marginRightHiddenObject = true;
            this._marginRight -= 1000;
        }

        this._width =
            this._desktopDescription.width -
            this._marginLeft -
            this._marginRight;

        this._height =
            this._desktopDescription.height -
            this._marginTop -
            this._marginBottom;
    }

    _createGrids() {
        this._width = Math.floor(this._width / this._sizer);
        this._height = Math.floor(this._height / this._sizer);
        this._marginTop = Math.floor(this._marginTop / this._sizer);
        this._marginBottom = Math.floor(this._marginBottom / this._sizer);
        this._marginLeft = Math.floor(this._marginLeft / this._sizer);
        this._marginRight = Math.floor(this._marginRight / this._sizer);

        this._maxColumns =
            Math.floor(
                this._width /
                (this.Prefs.DesiredWidth + 4 * this.elementSpacing)
            );

        this._maxRows =
            Math.floor(
                this._height /
                (this.Prefs.DesiredHeight + 4 * this.elementSpacing)
            );

        this._elementWidth = Math.floor(this._width / this._maxColumns);
        this._elementHeight = Math.floor(this._height / this._maxRows);
    }

    _updateGridRectangle() {
        this.gridGlobalRectangle.x = this._x + this._marginLeft;
        this.gridGlobalRectangle.y = this._y + this._marginTop;
        this.gridGlobalRectangle.width = this._width;
        this.gridGlobalRectangle.height = this._height;
    }

    _sizeContainer(widget) {
        widget.margin_top = this._marginTop;
        widget.margin_bottom = this._marginBottom;
        widget.margin_start = this._marginLeft;
        widget.margin_end = this._marginRight;
    }

    _setGridStatus() {
        this._fileItems = new Map();
        this._gridStatus = new Map();
        for (let y = 0; y < this._maxRows; y++) {
            for (let x = 0; x < this._maxColumns; x++)
                this._gridStatus.set(y * this._maxColumns + x, new Set());
        }
    }

    resizeGrid() {
        this._updateUnscaledHeightWidthMargins();
        this._createGrids();
        this._sizeContainer(this._container);
        this._sizeContainer(this._drawArea);
        this._updateGridRectangle();
        this._setGridStatus();
    }

    destroy() {
        this._destroying = true;
        this._window.destroy();
    }

    recomputeGridPosition(column, row) {
        if (column > this._maxColumns)
            return [this._x, this._y];

        if (row > this._maxRows)
            return [this._x, this._y];

        const [localX, localY] =
            this._getLocalCoordinatesForGrid(column, row);

        const [newGlobalX, newGlobalY] =
            this.coordinatesLocalToGlobal(localX, localY);

        return [newGlobalX, newGlobalY];
    }

    // Compute correct position for pop up menus relative to
    // margins to prevent going under/over margins

    getIntelligentPosition(gdkRectangle) {
        var clickLocation = 'center';

        if (this._marginLeft > 0 &&
            (gdkRectangle.x < (this._x + this._marginLeft * 2))
        )
            clickLocation = 'left';

        if (this._marginRight > 0 &&
            (
                gdkRectangle.x + gdkRectangle.width >
                (this._x + this._windowWidth - this._marginRight * 2.5)
            )
        )
            clickLocation = 'right';

        if (this._marginBottom > 0 &&
            (
                gdkRectangle.y + gdkRectangle.height >
                (this._y + this._windowHeight - this._marginBottom * 2)
            )
        ) {
            switch (clickLocation) {
            case 'left':
                clickLocation = 'bottomleft';
                break;
            case 'right':
                clickLocation = 'bottomright';
                break;
            default:
                clickLocation = 'bottom';
            }
        }

        if (this._marginTop > 0 &&
            (
                gdkRectangle.y < (this._y + this._marginTop * 2)
            )
        ) {
            switch (clickLocation) {
            case 'left':
                clickLocation = 'topLeft';
                break;
            case 'right':
                clickLocation = 'topRight';
                break;
            default:
                clickLocation = 'top';
            }
        }

        var returnvalue;

        //* Fix - Currently Gtk4 returns incorrect Gtk.PositionType Enums    *//
        //* Returning Integers instead of Enums                              *//
        //* Enums Gtk.PositionType.LEFT does not seem to work even when      *//
        //* returning 0 *//

        switch (clickLocation) {
        case 'left':
            if (this._marginLeftHiddenObject)
                returnvalue = 1; // Gtk.PositionType.RIGHT;
            else
                returnvalue = null;

            break;

        case 'right':
            if (this._marginRightHiddenObject)
                // Gtk.PositionType.LEFT = 0, overRiding with 1 as it works
                returnvalue = 1;
            else
                returnvalue = null;

            break;

        case 'top':
            if (this._marginTopHiddenObject)
                returnvalue = 3; // Gtk.PositionType.BOTTOM;
            else
                returnvalue = null;

            break;

        case 'bottom':
            if (this._marginBottomHiddenObject)
                returnvalue = 2; // Gtk.PositionType.TOP;
            else
                returnvalue = null;

            break;

        case 'center':
            returnvalue = null;
            break;

        case 'bottomRight':
            if (this._marginBottomHiddenObject &&
                this._marginRightHiddenObject) {
                // Gtk.PositionType.LEFT = 0, overRiding with 1 as it works
                returnvalue = 1;
                break;
            }

            if (this._marginBottomHiddenObject) {
                returnvalue = 2; // Gtk.PositionType.TOP
                break;
            }

            if (this._marginRightHiddenObject) {
                // Gtk.PositionType.LEFT = 0, overRiding with 1 as it works
                returnvalue = 1;
                break;
            }

            break;

        case 'bottomLeft':
            if (this._marginBottomHiddenObject &&
                this._marginLeftHiddenObject) {
                returnvalue = 1; // Gtk.PositionType.RIGHT
                break;
            }

            if (this._marginBottomHiddenObject) {
                returnvalue = 2; // Gtk.PositionType.TOP
                break;
            }

            if (this._marginLeftHiddenObject) {
                returnvalue = 1; // Gtk.PositionType.RIGHT
                break;
            }

            break;

        case 'topRight':
            if (this._marginTopHiddenObject && this._marginRightHiddenObject) {
                // Gtk.PositionType.LEFT = 0, overRiding with 1 as it works
                returnvalue = 1;
                break;
            }

            if (this._marginTopHiddenObject) {
                returnvalue = 3; // Gtk.PositionType.BOTTOM
                break;
            }

            if (this._marginRightHiddenObject) {
                // Gtk.PositionType.LEFT = 0, overRiding with 1 as it works
                returnvalue = 1;
                break;
            }

            break;

        case 'topLeft':
            if (this._marginTopHiddenObject && this._marginLeftHiddenObject) {
                returnvalue = 1; // Gtk.PositionType.RIGHT
                break;
            }
            if (this._marginTopHiddenObject) {
                returnvalue = 3; // Gtk.PositionType.BOTTOM
                break;
            }
            if (this._marginLeftHiddenObject) {
                returnvalue = 1; // Gtk.PositionType.RIGHT
                break;
            }
            break;

        default:
            returnvalue = null;
        }

        return returnvalue;
    }

    // Functions for computing postion/Geometry

    _getColumnRowFromLocal(x, y) {
        // Returns the column, row of the grid that holds the local x, y
        let placeX = Math.floor(x / this._elementWidth);
        let placeY = Math.floor(y / this._elementHeight);
        placeX = this.DesktopIconsUtil.clamp(placeX, 0, this._maxColumns - 1);
        placeY = this.DesktopIconsUtil.clamp(placeY, 0, this._maxRows - 1);

        return [placeX, placeY];
    }

    _getGridLocalCoordinates(x, y) {
        // Returns the local grid coordinates of top left rectangle
        // vertex of the grid that has local x,y
        const [column, row] = this._getColumnRowFromLocal(x, y);

        return this._getLocalCoordinatesForGrid(column, row);
    }

    _getLocalCoordinatesForGrid(column, row) {
        const localX = Math.floor(this._width * column / this._maxColumns);
        const localY = Math.floor(this._height * row / this._maxRows);

        return [localX, localY];
    }

    getDistance(x) {
        // Returns the distance to the middle point of this grid from X //
        return Math.pow(x - (this._x + this._windowWidth * this._zoom / 2), 2) +
            Math.pow(x - (this._y + this._windowHeight * this._zoom / 2), 2);
    }

    _coordinatesGlobalToLocal(X, Y, widget = null) {
        const [windowX, windowY] = this._coordinatesGlobalToWindow(X, Y);
        const sourcePoint = new Graphene.Point({x: windowX, y: windowY});

        if (!widget)
            widget = this._container;

        const [found, targetPoint] =
            this._window.compute_point(widget, sourcePoint);

        if (!found)
            return [0, 0];

        return [targetPoint.x, targetPoint.y];
    }

    _coordinatesGlobalToWindow(X, Y) {
        X -= this._x;
        Y -= this._y;
        return [X, Y];
    }

    _coordinatesWidgetToWidget(x, y, widget1, widget2) {
        const sourcePoint = new Graphene.Point({x, y});
        const [found, targetPoint] =
            widget1.compute_point(widget2, sourcePoint);

        if (!found)
            return [0, 0];

        return [targetPoint.x, targetPoint.y];
    }

    coordinatesLocalToWindow(x, y, widget = null) {
        if (!widget)
            widget = this._container;

        const sourcePoint = new Graphene.Point({x, y});
        const [found, targetPoint] =
            widget.compute_point(this._window, sourcePoint);

        if (!found)
            return [0, 0];

        return [targetPoint.x, targetPoint.y];
    }

    coordinatesLocalToGlobal(x, y, widget = null) {
        const [X, Y] = this.coordinatesLocalToWindow(x, y, widget);

        return [X + this._x, Y + this._y];
    }

    coordinatesBelongToThisGrid(X, Y) {
        const checkRectangle =
            new Gdk.Rectangle(
                {
                    x: X,
                    y: Y,
                    width: 1,
                    height: 1,
                }
            );

        return this.gridGlobalRectangle.intersect(checkRectangle)[0];
    }

    coordinatesBelongToThisGridWindow(X, Y) {
        const checkRectangle =
            new Gdk.Rectangle(
                {
                    x: X,
                    y: Y,
                    width: 1,
                    height: 1,
                }
            );

        return this.windowGlobalRectangle.intersect(checkRectangle)[0];
    }

    getGlobaltoLocalRectangle(gdkRectangle) {
        const [X, Y] =
            this._coordinatesGlobalToLocal(gdkRectangle.x, gdkRectangle.y);

        return new Gdk.Rectangle(
            {
                x: X,
                y: Y,
                width: gdkRectangle.width,
                height: gdkRectangle.height,
            }
        );
    }

    getCoordinatesOfGridContaining(X, Y, globalCoordinates = false) {
        // returns the local or global coordinates if requested,
        // of the local grid rectangle top left vertex that contains x, y

        if (this.coordinatesBelongToThisGrid(X, Y)) {
            const [x, y] = this._coordinatesGlobalToLocal(X, Y);

            if (globalCoordinates) {
                const a =
                    this._elementWidth *
                    Math.floor((x / this._elementWidth) + 0.5);

                const b =
                    this._elementHeight *
                    Math.floor((y / this._elementHeight) + 0.5);

                return this.coordinatesLocalToGlobal(a, b);
            } else {
                return this._getGridLocalCoordinates(x, y);
            }
        } else {
            return null;
        }
    }

    // Functions to query and set grid use by Icons and files

    _fileAtColumnRow(column, row) {
        // only works for grid placement of icons,
        // with free placements there maybe multiple fileItems per grid

        const setOfFileItemsOnGridNumber =
            this._gridStatus.get(row * this._maxColumns + column);

        if (!this.Prefs.freePositionIcons && setOfFileItemsOnGridNumber.size) {
            for (const fileItem of setOfFileItemsOnGridNumber.keys())
                return fileItem;
        }

        return null;
    }

    _fileAt(x, y) {
        if (!this.Prefs.freePositionIcons) {
            const [column, row] = this._getColumnRowFromLocal(x, y);

            return this._fileAtColumnRow(column, row);
        }

        const widgetAtPointer =
            this._container.pick(x, y, Gtk.PickFlags.GTK_PICK_DEFAULT);

        if (widgetAtPointer === this._container)
            return null;

        let fileItemFound = null;
        for (const fileItem of this._fileItems.keys()) {
            const [widgetX, widgetY] =
                this._coordinatesWidgetToWidget(
                    x, y,
                    this._container,
                    fileItem.container
                );

            if (widgetX === 0 && widgetY === 0)
                continue;

            const localWidget =
                fileItem.container.pick(
                    widgetX,
                    widgetY,
                    Gtk.PickFlags.GTK_PICK_DEFAULT
                );

            if (localWidget === widgetAtPointer) {
                fileItemFound = fileItem;

                break;
            }
        }

        return fileItemFound;
    }

    isAvailable() {
        // Returns true if there is an available slot in the grid
        let isFree = false;
        for (const [, setOfFileItemsOnGridNumber] of this._gridStatus.entries()
        ) {
            if (!setOfFileItemsOnGridNumber.size) {
                isFree = true;

                break;
            }
        }

        return isFree;
    }

    _setUseColumnRowOverlappingThis(fileItem, column, row, X, Y) {
        this._setGridUse(column, row, fileItem);
        const Xr = X + this._elementWidth - 2;
        const Yr = Y + this._elementHeight - 2;
        const [xr, yr] = this._coordinatesGlobalToLocal(Xr, Yr);
        const [bottomRightColumn, bottomRightRow] =
            this._getColumnRowFromLocal(xr, yr);

        if (bottomRightColumn !== column &&
            bottomRightRow !== row) {
            this._setGridUse(bottomRightColumn, bottomRightRow, fileItem);
            this._setGridUse(column, bottomRightRow, fileItem);
            this._setGridUse(bottomRightColumn, row, fileItem);

            return;
        }

        if (bottomRightColumn === column && bottomRightRow !== row) {
            this._setGridUse(column, bottomRightRow, fileItem);

            return;
        }

        if (bottomRightColumn !== column && bottomRightRow === row)
            this._setGridUse(bottomRightColumn, row, fileItem);
    }

    _isEmptyAt(column, row) {
        // returns if grid at column row has a file or not
        const setOfFileItemsOnGridNumber =
            this._gridStatus.get(row * this._maxColumns + column);

        return setOfFileItemsOnGridNumber.size === 0;
    }

    _gridInUse(x, y) {
        // returns if the local grid containing local coordinates
        // x, y has a file assigned.
        const [placeX, placeY] = this._getColumnRowFromLocal(x, y);

        return !this._isEmptyAt(placeX, placeY);
    }

    _setGridUse(column, row, fileItem) {
        const setOfFileItemsOnGridNumber =
            this._gridStatus.get(row * this._maxColumns + column);
        setOfFileItemsOnGridNumber.add(fileItem);
    }

    _getEmptyPlaceClosestTo(x, y, coordinatesAction, reverseHorizontal) {
        // returns the column row of empty grid available at global X, Y
        let cornerInversion = this.Prefs.StartCorner;

        if (reverseHorizontal)
            cornerInversion[0] = !cornerInversion[0];

        const [placeX, placeY] = this._getColumnRowFromLocal(x, y);

        if (this._isEmptyAt(placeX, placeY) &&
            coordinatesAction !== this.Enums.StoredCoordinates.ASSIGN)
            return [placeX, placeY];

        let found = false;
        let resColumn = null;
        let resRow = null;
        let minDistance = Infinity;
        let column, row;

        for (let tmpColumn = 0; tmpColumn < this._maxColumns; tmpColumn++) {
            if (cornerInversion[0])
                column = this._maxColumns - tmpColumn - 1;
            else
                column = tmpColumn;

            for (let tmpRow = 0; tmpRow < this._maxRows; tmpRow++) {
                if (cornerInversion[1])
                    row = this._maxRows - tmpRow - 1;
                else
                    row = tmpRow;

                if (!this._isEmptyAt(column, row))
                    continue;

                let proposedX = column * this._elementWidth;
                let proposedY = row * this._elementHeight;
                if (coordinatesAction === this.Enums.StoredCoordinates.ASSIGN)
                    return [column, row];
                let distance =
                    this.DesktopIconsUtil.distanceBetweenPoints(
                        proposedX,
                        proposedY,
                        x, y
                    );

                if (distance < minDistance) {
                    found = true;
                    minDistance = distance;
                    resColumn = column;
                    resRow = row;
                }
            }
        }

        if (!found)
            throw new Error('No available space on the monitor');


        return [resColumn, resRow];
    }

    // Finally the actual code that places and removes icons on the desktop

    _addFileItemToGrid(fileItem, column, row, coordinatesAction) {
        if (this._destroying)
            return;

        let [localX, localY] = this._getLocalCoordinatesForGrid(column, row);

        localX += this.elementSpacing;
        localY += this.elementSpacing;

        this._container.put(fileItem.container, localX, localY);
        this._setGridUse(column, row, fileItem);

        fileItem.column = column;
        fileItem.row = row;

        this._fileItems.set(fileItem, [localX, localY]);

        const [X, Y] = this.coordinatesLocalToGlobal(localX, localY);

        fileItem.setCoordinates(
            X,
            Y,
            this._elementWidth - 2 * this.elementSpacing,
            this._elementHeight - 2 * this.elementSpacing,
            this.elementSpacing,
            this
        );

        /* If this file is new in the Desktop and hasn't yet
         * fixed coordinates, store the new position to ensure
         * that the next time it will be shown in the same position.
         * Also store the new position if it has been moved by the user,
         * and not triggered by a screen change.
         */
        if ((fileItem.savedCoordinates === null) ||
            (coordinatesAction === this.Enums.StoredCoordinates.OVERWRITE)) {
            const [normalizedX, normalizedY] =
                this.getNormalizedCoordinates(localX, localY);

            const array = [X, Y, normalizedX, normalizedY, this._monitor];

            fileItem.writeSavedCoordinates(array);
        }
    }

    removeItem(fileItem) {
        if (this._fileItems.has(fileItem))
            this._fileItems.delete(fileItem);

        this._gridStatus.forEach(
            setOfFileItemsOnGridNumber =>
                setOfFileItemsOnGridNumber.delete(fileItem)
        );

        this._container.remove(fileItem.container);
    }

    _placeIntoPosition(
        fileItem,
        X, Y,
        x, y,
        emptycolumn,
        emptyrow,
        coordinatesAction
    ) {
        // For sanpping to grid
        if (fileItem.savedCoordinates == null ||
            (fileItem.savedCoordinates[0] === 0 &&
            fileItem.savedCoordinates[1] === 0) ||
            !this.Prefs.freePositionIcons ||
            this.Prefs.keepArranged ||
            this.Prefs.keepStacked
        ) {
            this._addFileItemToGrid(
                fileItem,
                emptycolumn,
                emptyrow,
                coordinatesAction
            );

            return;
        }

        if (this._destroying)
            return;

        // For free placement

        // Make sure the icon lands inside the grid and does not protrude out
        const [currentColumn, currentRow] = this._getColumnRowFromLocal(x, y);
        let translocated = false;

        if (currentColumn === this._maxColumns - 1 &&
            x + this._elementWidth > this._width
        ) {
            x = this._width - this._elementWidth;
            translocated = true;
        }

        if (currentRow === this._maxRows - 1 &&
            y + this._elementHeight > this._height
        ) {
            y = this._height - this._elementHeight;
            translocated = true;
        }

        if (x < 0) {
            x = 0;
            translocated = true;
        }

        if (y < 0) {
            y = 0;
            translocated = true;
        }

        // recompute global coordinates from the translocatedd local coordinates
        if (translocated)
            [X, Y] = this.coordinatesLocalToGlobal(x, y);

        this._container.put(fileItem.container, x, y);
        this._fileItems.set(fileItem, [x, y]);
        fileItem.setCoordinates(X,
            Y,
            this._elementWidth - 2 * this.elementSpacing,
            this._elementHeight - 2 * this.elementSpacing,
            this.elementSpacing,
            this);

        // set column row being used for all four vertices
        this._setUseColumnRowOverlappingThis(
            fileItem,
            currentColumn,
            currentRow,
            X, Y
        );

        /* If this file is new in the Desktop and hasn't yet
         * fixed coordinates, store the new position to ensure
         * that the next time it will be shown in the same position.
         * Also store the new position if it has been moved by the user,
         * and not triggered by a screen change.
         */
        if ((fileItem.savedCoordinates === null) ||
            (coordinatesAction === this.Enums.StoredCoordinates.OVERWRITE)
        ) {
            const [normalizedX, normalizedY] =
                this.getNormalizedCoordinates(x, y);

            const array = [X, Y, normalizedX, normalizedY, this._monitor];

            fileItem.writeSavedCoordinates(array);
            fileItem.column = null;
            fileItem.row = null;
        }
    }

    addFileItemCloseTo(fileItem, X, Y, coordinatesAction) {
        const addVolumesOpposite = this.Prefs.AddVolumesOpposite;
        const [x, y] = this._coordinatesGlobalToLocal(X, Y);
        const [column, row] = this._getEmptyPlaceClosestTo(
            x,
            y,
            coordinatesAction,
            fileItem.isDrive && addVolumesOpposite
        );
        this._placeIntoPosition(
            fileItem,
            X, Y,
            x, y,
            column,
            row,
            coordinatesAction
        );
    }

    makeTopLayerOnGrid(fileItem) {
        if (!this.Prefs.freePositionIcons)
            return;

        const [x, y] = this._fileItems.get(fileItem);

        this._container.remove(fileItem.container);
        this._container.put(fileItem.container, x, y);
    }

    getNormalizedCoordinates(x, y) {
        return [x / this.normalizedWidth, y / this.normalizedHeight];
    }

    setNormalizedCoordinates(x, y) {
        const newGlobalX = x * this.normalizedWidth;
        const newGlobalY = y * this.normalizedHeight;

        return [newGlobalX, newGlobalY];
    }

    get normalizedWidth() {
        return this._width;
    }

    get normalizedHeight() {
        return this._height;
    }

    get monitorIndex() {
        return this._monitor;
    }
};


const DrawGrid =  class extends DisplayGrid {
    constructor(desktopManager, desktopName, desktopDescription, asDesktop) {
        super(desktopManager, desktopName, desktopDescription, asDesktop);

        this._drawArea = new Gtk.DrawingArea();
        this._drawArea.set_content_height(this._windowHeight);
        this._drawArea.set_content_width(this._windowWidth);
        this._sizeContainer(this._drawArea);
        this._drawArea.set_draw_func(this._doDrawOnGrid.bind(this));
        this._overlay.add_overlay(this._drawArea);
        this._drawArea.set_can_target(false);
    }

    // Functions for drawing on the grid

    queue_draw() {
        this._drawArea.queue_draw();
    }

    highLightGridAt(x, y) {
        const globalCoordinates = false;
        const selected = this.getCoordinatesOfGridContaining(x, y, globalCoordinates);
        this._selectedList = [selected];
        this._drawDropRectangles();
    }

    unHighLightGrids() {
        this._selectedList = null;
        this._drawDropRectangles();
    }

    drawRubberBand() {
        this._drawArea.queue_draw();
    }

    _doDrawOnGrid(actor, cr) {
        this._doDrawRubberBand(cr);
        this._doDrawDropRectangles(cr).catch(console.error);
        cr.$dispose();
    }

    _drawDropRectangles() {
        this._drawArea.queue_draw();
    }

    _doDrawRubberBand(cr) {
        if (!this._dragManager.rubberBand ||
            !this._dragManager.selectionRectangle ||
            !this.gridGlobalRectangle
            .intersect(this._dragManager.selectionRectangle)[0]
        )
            return;

        const [xInit, yInit] =
            this._coordinatesGlobalToLocal(
                this._dragManager.x1,
                this._dragManager.y1
            );

        const [xFin, yFin] =
            this._coordinatesGlobalToLocal(
                this._dragManager.x2,
                this._dragManager.y2
            );

        const width = xFin - xInit;
        const height = yFin - yInit;

        const fillColor = new Gdk.RGBA({
            red: this.Prefs.selectColor.red,
            green: this.Prefs.selectColor.green,
            blue: this.Prefs.selectColor.blue,
            alpha: 0.15,
        });

        const outlineColor = new Gdk.RGBA({
            red: this.Prefs.selectColor.red,
            green: this.Prefs.selectColor.green,
            blue: this.Prefs.selectColor.blue,
            alpha: 1.0,
        });

        this._roundedRectangleDraw(
            xInit,
            yInit,
            width,
            height,
            cr,
            fillColor,
            outlineColor
        );
    }

    async _doDrawDropRectangles(cr) {
        if (!this.Prefs.showDropPlace || this._selectedList === null)
            return;

        const fillColor = new Gdk.RGBA({
            red: 1.0 - this.Prefs.selectColor.red,
            green: 1.0 - this.Prefs.selectColor.green,
            blue: 1.0 - this.Prefs.selectColor.blue,
            alpha: 0.4,
        });

        const outlineColor = new Gdk.RGBA({
            red: 1.0 - this.Prefs.selectColor.red,
            green: 1.0 - this.Prefs.selectColor.green,
            blue: 1.0 - this.Prefs.selectColor.blue,
            alpha: 1.0,
        });

        const dropRectanglePromises =
            this._selectedList.map(
                ([x, y]) => {
                    return this._rectangleDraw(
                        x, y,
                        this._elementWidth,
                        this._elementHeight,
                        cr,
                        fillColor,
                        outlineColor
                    );
                }
            );

        await Promise.all(dropRectanglePromises).catch(console.error);
    }

    _rectangleDraw(x, y, width, height, cr, fillColor, outlineColor) {
        return new Promise(resolve => {
            cr.rectangle(x + 0.5, y + 0.5, width, height);
            Gdk.cairo_set_source_rgba(cr, fillColor);
            cr.fillPreserve();
            cr.setLineWidth(0.5);
            Gdk.cairo_set_source_rgba(cr, outlineColor);
            cr.stroke();
            resolve(true);
        });
    }

    _roundedRectangleDraw(x, y, width, height, cr, fillColor, outlineColor) {
        const cornerRadius = 5;
        const degrees = 3.14 / 180;

        const isSquare = width === height;
        const tooLarge = cornerRadius * 2 > Math.min(width, height);

        cr.newSubPath();

        if (cornerRadius <= 0 || tooLarge || isSquare) {
            // Just draw a plain rectangle
            cr.rectangle(x, y, width, height);
        } else {
            const radius = Math.min(cornerRadius, width / 2, height / 2);

            cr.arc(
                x + width - radius,
                y + radius, radius,
                -90 * degrees,
                0 * degrees
            );

            cr.arc(
                x + width - radius,
                y + height - radius,
                radius, 0 * degrees,
                90 * degrees
            );

            cr.arc(
                x + radius,
                y + height - radius,
                radius,
                90 * degrees,
                180 * degrees
            );

            cr.arc(
                x + radius,
                y + radius,
                radius,
                180 * degrees,
                270 * degrees
            );

            cr.closePath();
        }

        Gdk.cairo_set_source_rgba(cr, fillColor);
        cr.fillPreserve();

        cr.setLineWidth(1.0);
        Gdk.cairo_set_source_rgba(cr, outlineColor);

        cr.stroke();
    }
};


const DesktopGrid = class extends DrawGrid {
    constructor(desktopManager, desktopName, desktopDescription, asDesktop) {
        super(desktopManager, desktopName, desktopDescription, asDesktop);
        this._addDragControllers();
    }

    _addDragControllers() {
        this._eventKey = Gtk.EventControllerKey.new();
        this._window.add_controller(this._eventKey);

        this._eventKey.connect(
            'key-pressed',
            (actor, keyval, keycode, state) => {
                this._desktopManager.onKeyPress(keyval, keycode, state, this);
            }
        );

        this._eventMotion = Gtk.EventControllerMotion.new();
        this._eventMotion.set_propagation_phase(Gtk.PropagationPhase.BUBBLE);
        this._container.add_controller(this._eventMotion);

        this._eventMotion.connect(
            'motion',
            (actor, x, y) => {
                if (!this._dragManager.rubberBand)
                    return false;

                const [X, Y] = this.coordinatesLocalToGlobal(x, y);
                this._dragManager.onMotion(X, Y);
                return false;
            }
        );

        this._buttonClick = Gtk.GestureClick.new();
        this._buttonClick.set_button(0);
        this._buttonClick.set_propagation_phase(Gtk.PropagationPhase.BUBBLE);
        this._container.add_controller(this._buttonClick);

        this._buttonClick.connect(
            'pressed',
            (actor, nPress, x, y) => {
                if (this._desktopManager.closePopUps())
                    return;

                const button = actor.get_current_button();
                const state = this._buttonClick.get_current_event_state();
                const isCtrl = (state & Gdk.ModifierType.CONTROL_MASK) !== 0;
                const isShift = (state & Gdk.ModifierType.SHIFT_MASK) !== 0;
                const [X, Y] = this.coordinatesLocalToGlobal(x, y);

                const clickItem = this._fileAt(x, y);

                if (clickItem) {
                    const clickRectangle =
                        new Gdk.Rectangle({x: X, y: Y, width: 1, height: 1});

                    if (clickRectangle.intersect(clickItem.iconRectangle)[0] ||
                        clickRectangle.intersect(clickItem.labelRectangle)[0]) {
                        clickItem._onPressButton(
                            actor,
                            X, Y,
                            x, y,
                            isShift,
                            isCtrl
                        );
                        return;
                    }
                }

                this._desktopManager
                .onPressButton(X, Y,
                    x, y,
                    button,
                    isShift,
                    isCtrl,
                    this)
                .catch(e => console.error(e));
            }
        );

        this._buttonClick.connect(
            'released',
            (actor, nPress, x, y) => {
                const state = this._buttonClick.get_current_event_state();
                const isCtrl = (state & Gdk.ModifierType.CONTROL_MASK) !== 0;
                const isShift = (state & Gdk.ModifierType.SHIFT_MASK) !== 0;
                const [X, Y] = this.coordinatesLocalToGlobal(x, y);

                const clickItem = this._fileAt(x, y);

                if (clickItem && !this._dragManager.rubberBand) {
                    const clickRectangle =
                        new Gdk.Rectangle({x: X, y: Y, width: 1, height: 1});

                    if (clickRectangle.intersect(clickItem.iconRectangle)[0] ||
                        clickRectangle.intersect(clickItem.labelRectangle)[0]) {
                        clickItem
                        ._onReleaseButton(actor, X, Y, x, y, isShift, isCtrl);
                        return;
                    }
                }

                this._dragManager.onReleaseButton(this);
            }
        );

        this._setDropDestination(this._container);
        this._setDragSource(this._container);
    }

    _setDropDestination(widget) {
        this.gridDropController = new Gtk.DropTargetAsync();
        this.gridDropController.set_actions(
            Gdk.DragAction.MOVE |
            Gdk.DragAction.COPY |
            Gdk.DragAction.ASK
        );
        const desktopAcceptFormats =
            Gdk.ContentFormats.new(this.Enums.DndTargetInfo.MIME_TYPES);
        const fileItemAcceptFormats =
            Gdk.ContentFormats.new([
                this.Enums.DndTargetInfo.GNOME_ICON_LIST,
                this.Enums.DndTargetInfo.URI_LIST,
            ]);
        const desktopMoveIconsFormat =
            Gdk.ContentFormats.new([this.Enums.DndTargetInfo.DING_ICON_LIST]);
        const textDropFormat =
            Gdk.ContentFormats.new([this.Enums.DndTargetInfo.TEXT_PLAIN]);
        const oldNautilusDropFormat =
            Gdk.ContentFormats.new([this.Enums.DndTargetInfo.GNOME_ICON_LIST]);
        this.gridDropController.set_formats(desktopAcceptFormats);

        let acceptFormat = null;
        let dropData = null;

        this.gridDropController.connect(
            'accept',
            (actor, drop) => {
                if (drop.get_formats().match(desktopAcceptFormats))
                    return true;
                else
                    return false;
            }
        );

        this.gridDropController.connect(
            'drag-enter',
            (actor, drop) => {
                this.localDrag = true;
                drop.status(
                    Gdk.DragAction.COPY |
                        Gdk.DragAction.MOVE |
                        Gdk.DragAction.LINK,
                    Gdk.DragAction.MOVE
                );

                return Gdk.DragAction.MOVE;
            }
        );

        this.gridDropController.connect(
            'drag-motion',
            (actor, drop, x, y) => {
                let desktopDropZone = false;
                let fileItemDropZone = false;
                const fileItem = this._fileAt(x, y);
                const [X, Y] = this.coordinatesLocalToGlobal(x, y);
                const dropRectangle =
                    new Gdk.Rectangle({x: X, y: Y, width: 1, height: 1});
                const desktopMove =
                    drop.get_formats().match(desktopMoveIconsFormat);
                const filesMove =
                    drop.get_formats().match(fileItemAcceptFormats);

                if (fileItem) {
                    if (!this.Prefs.freePositionIcons)
                        fileItemDropZone = true;

                    else if (dropRectangle
                            .intersect(fileItem.iconRectangle)[0] ||
                        dropRectangle
                        .intersect(fileItem.labelRectangle)[0])
                        fileItemDropZone = true;

                    if (desktopMove && fileItem._hasToRouteDragToGrid())
                        fileItemDropZone = false;
                }

                desktopDropZone = !fileItemDropZone;

                this.receiveMotion(x, y, false);

                if (fileItemDropZone && !fileItem.dropCapable)
                    return false;

                if (fileItemDropZone && fileItem.dropCapable) {
                    if (!filesMove)
                        return false;

                    if (fileItem._fileExtra !==
                        this.Enums.FileType.EXTERNAL_DRIVE)
                        return Gdk.DragAction.MOVE;

                    if (fileItem._fileExtra ===
                        this.Enums.FileType.EXTERNAL_DRIVE)
                        return Gdk.DragAction.COPY;
                }

                if (desktopDropZone) {
                    if (desktopMove) {
                        if (this.Prefs.keepArranged ||
                            this.Prefs.keepStacked) {
                            if (this.Prefs.sortSpecialFolders)
                                return false;
                            else if (this._desktopManager
                                .getCurrentSelection()
                                ?.filter(f => !f.isSpecial).length >= 1)
                                return false;
                        }
                    }

                    return Gdk.DragAction.MOVE;
                }

                return false;
            });

        this.gridDropController.connect('drag-leave', () => {
            this.localDrag = false;
            this._receiveLeave();
        });

        this.gridDropController.connect('drop', (actor, drop, x, y) => {
            const event = {
                'parentWindow': this._window,
                'timestamp': Gdk.CURRENT_TIME,
            };

            let desktopDropZone = false;
            let fileItemDropZone = false;
            const fileItem = this._fileAt(x, y);
            const [X, Y] = this.coordinatesLocalToGlobal(x, y);
            const dropRectangle =
                new Gdk.Rectangle({x: X, y: Y, width: 1, height: 1});
            const desktopMove =
                drop.get_formats().match(desktopMoveIconsFormat);
            const filesMove =
                drop.get_formats().match(fileItemAcceptFormats);
            const oldNautilusMove =
                drop.get_formats().match(oldNautilusDropFormat);
            let readFormat = Gdk.FileList.$gtype;

            if (fileItem) {
                if (!this.Prefs.freePositionIcons)
                    fileItemDropZone = true;
                else if (dropRectangle.intersect(fileItem.iconRectangle)[0] ||
                    dropRectangle.intersect(fileItem.labelRectangle)[0])
                    fileItemDropZone = true;
                if (desktopMove && fileItem._hasToRouteDragToGrid())
                    fileItemDropZone = false;
            }

            desktopDropZone = !fileItemDropZone;

            const textDrop =
                drop.get_formats().match(textDropFormat) &&
                    !desktopMove &&
                    !filesMove;

            if (textDrop) {
                acceptFormat = this.Enums.DndTargetInfo.TEXT_PLAIN;
                readFormat = String.$gtype;
            }

            if (desktopMove)
                acceptFormat = this.Enums.DndTargetInfo.DING_ICON_LIST;

            if (filesMove && !desktopMove) {
                if (oldNautilusMove) {
                    acceptFormat = this.Enums.DndTargetInfo.GNOME_ICON_LIST;
                    readFormat = String.$gtype;
                } else {
                    acceptFormat = this.Enums.DndTargetInfo.URI_LIST;
                    readFormat = String.$gtype;
                }
            }

            let gdkDropAction = drop.get_actions();

            if (!Gdk.DragAction.is_unique(gdkDropAction)) {
                if (this._using_X11 &&
                    (gdkDropAction >=
                            (Gdk.DragAction.COPY | Gdk.DragAction.MOVE)))
                    gdkDropAction = Gdk.DragAction.MOVE;

                else if (gdkDropAction >
                        (Gdk.DragAction.COPY | Gdk.DragAction.MOVE))
                    gdkDropAction = Gdk.DragAction.ASK;
            }

            let gdkReturnAction = Gdk.DragAction.COPY;

            if (desktopMove &&
                desktopDropZone &&
                (gdkDropAction === Gdk.DragAction.MOVE)
            ) {
                let [xOrigin, yOrigin] =
                    this._dragManager.dragItem.getCoordinates()
                    .slice(0, 3);

                this._dragManager.doMoveWithDragAndDrop(xOrigin, yOrigin, X, Y);

                this._receiveLeave();
                drop.finish(gdkDropAction);

                return true;
            }

            try {
                drop.read_value_async(
                    readFormat,
                    GLib.PRIORITY_DEFAULT,
                    null,
                    async (dropactor, result) => {
                        dropData = dropactor.read_value_finish(result);

                        if (!dropData || !acceptFormat) {
                            drop.finish(0);
                            this._receiveLeave();
                            return false;
                        }

                        if (dropData && textDrop) {
                            gdkReturnAction = Gdk.DragAction.COPY;
                            this._dragManager.onTextDrop(dropData, [X, Y]);
                            drop.finish(gdkReturnAction);
                            this._receiveLeave();
                            return true;
                        }

                        gdkReturnAction =
                            await this._completeDrop(
                                X, Y,
                                x, y,
                                drop,
                                dropData,
                                gdkDropAction,
                                fileItem,
                                acceptFormat,
                                fileItemDropZone,
                                desktopDropZone,
                                desktopMove,
                                filesMove,
                                textDrop,
                                event
                            ).catch(e => console.error(e));

                        if (gdkReturnAction) {
                            drop.finish(gdkReturnAction);
                            this._receiveLeave();
                            return true;
                        } else {
                            drop.finish(0);
                            this._receiveLeave();
                            return false;
                        }
                    }
                );
            } catch (e) {
                console.error(e);
                drop.finish(0);
                this._receiveLeave();
            }
            return false;
        });

        widget.add_controller(this.gridDropController);

        this.gridDropControllerMotion = new Gtk.DropControllerMotion();

        this.gridDropControllerMotion.connect(
            'motion',
            (actor, x, y) => {
                if (!this.gridDropControllerMotion.is_pointer) {
                    const fileItem = this._fileAt(x, y);
                    const [X, Y] = this.coordinatesLocalToGlobal(x, y);
                    const pointerRectangle =
                        new Gdk.Rectangle({x: X, y: Y, width: 1, height: 1});

                    if (fileItem && fileItem.dropCapable) {
                        this._dragManager.unHighLightDropTarget();

                        if (!this.Prefs.freePositionIcons)
                            fileItem.highLightDropTarget();

                        else if (
                            pointerRectangle
                            .intersect(fileItem.iconRectangle)[0] ||
                            pointerRectangle
                            .intersect(fileItem.labelRectangle)[0])
                            fileItem.highLightDropTarget();
                    }

                    if (fileItem && (fileItem.isDirectory || fileItem.isDrive))
                        this._startSpringLoadedTimer(fileItem);
                } else {
                    this._dragManager.unHighLightDropTarget();
                    this._stopSpringLoadedTimer();
                }
            });

        widget.add_controller(this.gridDropControllerMotion);
    }

    async _completeDrop(
        X, Y,
        x, y,
        drop,
        dropData,
        gdkDropAction,
        fileItem,
        acceptFormat,
        fileItemDropZone,
        desktopDropZone,
        desktopMove,
        filesMove,
        textDrop,
        event
    ) {
        let returnAction = Gdk.DragAction.COPY;
        const localDrop = !!drop.get_drag();

        if (fileItemDropZone && (desktopMove || filesMove)) {
            returnAction =
                await fileItem.receiveDrop(
                    X, Y,
                    x, y,
                    dropData,
                    acceptFormat,
                    gdkDropAction,
                    localDrop,
                    event,
                    this._dragManager.dragItem
                ).catch(e => console.error(e));

            return returnAction;
        }

        if (desktopDropZone && (desktopMove || filesMove)) {
            returnAction = await this._receiveDrop(
                x, y,
                dropData,
                acceptFormat,
                gdkDropAction,
                localDrop,
                event,
                this._dragManager.dragItem
            ).catch(e => console.error(e));

            return returnAction;
        }

        // Finally if all above does not work, catchall-
        return false;
    }


    _setDragSource(widget) {
        const widgetDragController = Gtk.DragSource.new();
        let clickItem;

        widgetDragController.set_actions(
            Gdk.DragAction.MOVE | Gdk.DragAction.COPY | Gdk.DragAction.ASK);

        widgetDragController.connect(
            'prepare',
            // eslint-disable-next-line consistent-return
            (actor, x, y) => {
                const draggedItem = this._fileAt(x, y);

                if (draggedItem && !this._dragManager.rubberBand) {
                    clickItem = draggedItem;
                    const [a, b] =
                        this._coordinatesWidgetToWidget(
                            x, y,
                            this._container,
                            clickItem._icon
                        )
                        .map(f => Math.floor(Math.max(f)));

                    this._dragManager.localDragOffset = [a, b];

                    const dragIcon = this._createStackedDragIcon(clickItem);

                    widgetDragController.set_icon(dragIcon, a, b);
                    clickItem.dragSourceOffset = [a, b];

                    this._loadDragData();

                    if (this.contentProvider)
                        return this.contentProvider;
                }
            }
        );

        widgetDragController.connect('drag-begin', () => {
            this._dragManager.onReleaseButton(this);
            this._dragManager.onDragBegin(clickItem);
        });

        widgetDragController.connect(
            'drag-cancel',
            async (actor, drag, reason) => {
                if (reason === Gdk.DragCancelReason.NO_TARGET ||
                    reason === Gdk.DragCancelReason.ERROR) {
                    const gnomedropDetected =
                        await this._dragManager.gnomeShellDrag
                        ?.completeGnomeShellDrop()
                        .catch(e => console.error(e));

                    if (gnomedropDetected)
                        return true;
                    else
                        return false;
                } else {
                    return false;
                }
            }
        );

        widgetDragController.connect('drag-end', () => {
            this._dragManager.onDragEnd();
            this._dragManager.selected(clickItem, this.Enums.Selection.RELEASE);
        });

        widget.add_controller(widgetDragController);
    }

    _loadDragData() {
        this.contentProvider = null;
        const textCoder = new TextEncoder();

        const uriList =
            this._dragManager.fillDragDataGet(
                this.Enums.DndTargetInfo.DING_ICON_LIST);

        if (!uriList)
            return;

        const encodedUriList = textCoder.encode(uriList);

        const dingContentProvider =
            Gdk.ContentProvider.new_for_bytes(
                this.Enums.DndTargetInfo.DING_ICON_LIST,
                encodedUriList
            );

        if (this._desktopManager.checkIfSpecialFilesAreSelected()) {
            this.contentProvider = dingContentProvider;
            return;
        }

        const gnomeUriList =
            this._dragManager.fillDragDataGet(
                this.Enums.DndTargetInfo.GNOME_ICON_LIST);

        if (!gnomeUriList)
            return;

        const gnomeContentProvider =
            Gdk.ContentProvider.new_for_bytes(
                this.Enums.DndTargetInfo.GNOME_ICON_LIST,
                textCoder.encode(gnomeUriList)
            );

        const textPathList =
            this._dragManager.fillDragDataGet(
                this.Enums.DndTargetInfo.TEXT_PLAIN
            );

        if (!textPathList)
            return;

        const encodedPathList = textCoder.encode(textPathList);

        const textUriListContentProvider =
            Gdk.ContentProvider.new_for_bytes(
                this.Enums.DndTargetInfo.URI_LIST,
                encodedUriList
            );

        const textListContentProvider =
            Gdk.ContentProvider.new_for_bytes(
                this.Enums.DndTargetInfo.TEXT_PLAIN,
                encodedPathList
            );

        const textUtf8ListContentProvider =
            Gdk.ContentProvider.new_for_bytes(
                this.Enums.DndTargetInfo.TEXT_PLAIN_UTF8,
                encodedPathList
            );

        this.contentProvider = Gdk.ContentProvider.new_union([
            dingContentProvider,
            gnomeContentProvider,
            textUriListContentProvider,
            textListContentProvider,
            textUtf8ListContentProvider,
        ]);
    }

    // The following code is translated from Nautilus C to Javascript
    //  to form the similar stack of items

    _createStackedDragIcon(draggedItem) {
        const  selectionArray = this._desktopManager.getCurrentSelection();
        selectionArray.sort(
            // eslint-disable-next-line no-nested-ternary
            (a, b) => a.uri === draggedItem.uri
                ? -1
                : b.uri === draggedItem.uri
                    ? 1
                    : 0
        );

        const dragIconArray = selectionArray.map(f => f._icon.get_paintable());
        const numberOfIcons = dragIconArray.length;

        const dragIcon = Gtk.Snapshot.new();

        /* A wide shadow for the pile of icons gives a sense of floating. */
        const stackShadow =
            {
                color: {red: 0, green: 0, blue: 0, alpha: 0.15},
                dx: 0,
                dy: 2,
                radius: 10,
            };

        /* A slight shadow swhich makes each icon in the stack look separate. */
        const iconShadow =
            {
                color: {red: 0, green: 0, blue: 0, alpha: 0.30},
                dx: 0,
                dy: 1,
                radius: 1,
            };

        let xOffset = numberOfIcons % 2 === 1 ? 6 : -6;
        let yOffset;

        switch (numberOfIcons) {
        case 1:
            yOffset = 0;
            break;
        case 2:
            yOffset = 10;
            break;
        case 3:
            yOffset = 6;
            break;
        default:
            yOffset = 4;
        }

        dragIcon.translate(
            new Graphene.Point(
                {
                    x: 10 + (xOffset / 2),
                    y: yOffset * numberOfIcons,
                }
            )
        );

        const shadow = new Gsk.Shadow(stackShadow);
        dragIcon.push_shadow([shadow]);

        dragIconArray.reverse().forEach(
            paintableWidget => {
                const w = paintableWidget.get_intrinsic_width();
                const h = paintableWidget.get_intrinsic_height();
                const X = Math.floor((this.Prefs.IconSize - w) / 2);
                const Y = Math.floor((this.Prefs.IconSize - h) / 2);

                dragIcon.translate(
                    new Graphene.Point(
                        {
                            x: -xOffset,
                            y: -yOffset,
                        }
                    )
                );

                xOffset = -xOffset;

                dragIcon.translate(new Graphene.Point({x: X, y: Y}));
                dragIcon.push_shadow([new Gsk.Shadow(iconShadow)]);

                paintableWidget.snapshot(dragIcon, w, h);

                dragIcon.pop();

                dragIcon.translate(new Graphene.Point({x: -X, y: -Y}));
            }
        );
        dragIcon.pop();

        return dragIcon.to_paintable(null);
    }

    _receiveLeave() {
        this._stopSpringLoadedTimer();
        this._window.queue_draw();
        this._dragManager.onDragLeave();
    }

    receiveLeave() {
        this._receiveLeave();
    }

    receiveMotion(x, y, global) {
        let X;
        let Y;
        if (!global) {
            x = this._elementWidth * Math.floor(x / this._elementWidth);
            y = this._elementHeight * Math.floor(y / this._elementHeight);
            [X, Y] = this.coordinatesLocalToGlobal(x, y);
        }
        this._dragManager.onDragMotion(X, Y);
    }

    async _receiveDrop(
        x, y,
        selection,
        info,
        gdkDropAction,
        localDrop,
        event,
        dragItem
    ) {
        x = this._elementWidth * Math.floor(x / this._elementWidth);
        y = this._elementHeight * Math.floor(y / this._elementHeight);
        const [X, Y] = this.coordinatesLocalToGlobal(x, y);
        const returnAction =
            await this._dragManager
                .onDragDataReceived(
                    X, Y,
                    x, y,
                    selection,
                    info,
                    gdkDropAction,
                    localDrop,
                    event,
                    dragItem
                )
                .catch(e => console.error(e));
        return returnAction;
    }

    refreshDrag(selectedList, ox, oy) {
        if (!this.Prefs.showDropPlace)
            return;

        if (selectedList === null) {
            this._selectedList = null;
            this._drawDropRectangles();

            return;
        }

        let newSelectedList = [];

        for (let [x, y] of selectedList) {
            x += this._elementWidth / 2;
            y += this._elementHeight / 2;
            x += ox;
            y += oy;

            const r = this.getCoordinatesOfGridContaining(x, y);

            if (r &&
                !isNaN(r[0]) &&
                !isNaN(r[1]) &&
                (!this._gridInUse(r[0], r[1]) ||
                this._fileAt(r[0], r[1])?.isSelected)
            )
                newSelectedList.push(r);
        }

        if (newSelectedList.length === 0) {
            if (this._selectedList !== null) {
                this._selectedList = null;
                this._drawDropRectangles();
            }

            return;
        }

        if (this._selectedList !== null) {
            if ((newSelectedList[0][0] === this._selectedList[0][0]) &&
                (newSelectedList[0][1] === this._selectedList[0][1])
            )
                return;
        }

        this._selectedList = newSelectedList;
        this._drawDropRectangles();
    }

    _startSpringLoadedTimer(fileItem) {
        if (!this.Prefs.openFolderOnDndHover || this.directoryOpenTimer)
            return;

        if (this._dragManager.dragItem?.uri === fileItem.uri)
            return;

        this.directoryOpenTimer =
            GLib.timeout_add(
                GLib.PRIORITY_DEFAULT,
                this.Enums.DND_HOVER_TIMEOUT,
                () => {
                    const context =
                        Gdk.Display.get_default()
                        .get_app_launch_context();

                    context.set_timestamp(Gdk.CURRENT_TIME);

                    try {
                        Gio.AppInfo.launch_default_for_uri(
                            fileItem.uri,
                            context
                        );
                    } catch (e) {
                        console.error(e, `Error opening ${fileItem.uri}` +
                            ` in GNOME Files: ${e.message}`);
                    }

                    this.directoryOpenTimer = 0;
                    return GLib.SOURCE_REMOVE;
                }
            );
    }

    _stopSpringLoadedTimer() {
        if (this.directoryOpenTimer)
            GLib.Source.remove(this.directoryOpenTimer);

        this.directoryOpenTimer = 0;
    }
};
