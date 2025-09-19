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
import {
    DesktopGrid
} from '../dependencies/localFiles.js';

import {Gio, GLib} from '../dependencies/gi.js';

export {WindowManager};

const WindowManager = class {
    constructor(desktopManager, desktopList, asDesktop, primaryIndex) {
        this._desktopManager = desktopManager;
        this._Prefs = desktopManager.Prefs;
        this.mainApp = desktopManager.mainApp;
        this._desktopList = desktopList;
        this._primaryIndex = primaryIndex;

        if (primaryIndex < desktopList.length)
            this._primaryScreen = desktopList[primaryIndex];
        else
            this._primaryScreen = null;

        this._priorDesktopList = [];
        this._desktops = [];
        this._asDesktop = asDesktop;
        this._zoom = 1;
        this._primaryIndex = null;
        this._primaryMonitorIndex = null;
        this._priorPrimaryIndex = null;
        this._priorPrimaryMonitorIndex = null;
        this._primaryScreen = null;
        this._differentZooms = false;
        this._hidden = false;

        this._dbusAdvertiseUpdate();
    }

    _dbusAdvertiseUpdate() {
        const updateGridWindows = new Gio.SimpleAction({
            name: 'updateGridWindows',
            parameter_type: new GLib.VariantType('av'),
        });

        updateGridWindows.connect('activate', (action, parameter) => {
            this.updateGridWindows(parameter.recursiveUnpack());
        });

        this.mainApp.add_action(updateGridWindows);

        const busObjectPath = this.mainApp.get_dbus_object_path();
        const busName = this.mainApp.get_application_id();
        const connection = Gio.DBus.session;
        const signalName = 'upateGeometry';

        const signalXml = `
                <node>
                  <interface name="${busName}">
                    <signal name="${signalName}">
                      <arg name="type" type="s"/>
                      <arg name="value" type="b"/>
                    </signal>
                  </interface>
                </node>`;

        this._dbusGeometryIface =
                Gio.DBusExportedObject.wrapJSObject(signalXml, this);

        this._dbusGeometryIface.export(
            connection,
            busObjectPath
        );
    }

    requestGeometryUpdate() {
        const variant = new GLib.Variant('(sb)', ['updategeometry', true]);
        const busObjectPath = this.mainApp.get_dbus_object_path();
        const busName = this.mainApp.get_application_id();
        const connection = Gio.DBus.session;
        const signalName = 'updategeometry';

        connection.emit_signal(
            null,
            busObjectPath,
            busName,
            signalName,
            variant
        );
    }

    updateGridWindows(newdesktoplist) {
        this._priorDesktopList = this._desktopList;
        this._desktopList = newdesktoplist;

        this._priorPrimaryIndex = this._primaryIndex ?? null;

        let newPrimaryIndex;

        if ((newdesktoplist.length > 0) &&
            ('primaryMonitor' in newdesktoplist[0])
        )
            newPrimaryIndex = newdesktoplist[0].primaryMonitor ?? null;

        if (newPrimaryIndex !== this._priorPrimaryIndex)
            this._primaryIndex = newPrimaryIndex;

        this._priorPrimaryMonitorIndex = this._primaryMonitorIndex ?? 0;

        // Find the new primary monitor
        this._primaryScreen = this._desktopList[this._primaryIndex] ?? null;
        this._primaryMonitorIndex = this._primaryScreen.monitorIndex ?? null;

        const indexChanged = this._priorPrimaryMonitorIndex !==
            this._primaryMonitorIndex;

        // See if there are different zooms in the desktops
        this._differentZooms = this._desktopList.some((d, index) => {
            const nextd = this._desktopList[index + 1];

            if (nextd != null)
                return d.zoom !== nextd.zoom;

            return false;
        });

        // Allow initial startup if no desktops defined on initiation
        const firstDesktop =
            this._priorDesktopList.some(
                d => {
                    return typeof d !== 'object' || d == null;
                }
            ) ||
            this._priorDesktopList.length === 0;

        if (firstDesktop) {
            this._desktopManager._displayList.forEach(x => x.removeFromGrid());
            this.createGridWindows();

            // sanity checks and icons placment on grid will be done by
            // desktopManager in sync startup
            return;
        }

        // If any new monitors plugged in or removed
        // by creating new desktops
        if (this._priorDesktopList.length !== this._desktopList.length) {
            // monitor has been plugged in or removed.
            this._desktopManager._displayList.forEach(x => x.removeFromGrid());
            this.createGridWindows();
            this._desktopManager._performSanityChecks();

            // If valid fileList is available, no change in fileList
            // recompute postion of all icons for new geometry
            this._desktopManager.reFrameDesktop({
                redisplay: true,
                monitorschanged: true,
                gridschanged: true,
            });

            return;
        }

        // if no change in monitors, check if any change in monitor geometry
        // or if any change in grid geometry

        const monitorschangedList = [];
        const gridschangedList = [];

        this._desktopList.forEach((area, index) => {
            const area2 = this._priorDesktopList[index];
            if ((area.x !== area2.x) ||
                (area.y !== area2.y) ||
                (area.width !== area2.width) ||
                (area.height !== area2.height) ||
                (area.zoom !== area2.zoom) ||
                (area.monitorIndex !== area2.monitorIndex)
            ) {
                monitorschangedList.push(index);
                gridschangedList.push(index);

                return;
            }

            if ((area.marginTop !== area2.marginTop) ||
                (area.marginBottom !== area2.marginBottom) ||
                (area.marginLeft !== area2.marginLeft) ||
                (area.marginRight !== area2.marginRight)
            ) {
                if (!gridschangedList.includes(index))
                    gridschangedList.push(index);
            }
        });

        // indexchanged implies monitors have changed
        // monitors changed or index changed implies grids have changed
        // as there may be other actors on the new monitor edge
        const monitorschanged = !!monitorschangedList.length || indexChanged;

        // only the grids have changed, no monitor changes
        const gridschanged = gridschangedList.length
            ? gridschangedList.some(i => !monitorschangedList.includes(i))
            : false;

        // redisplay is needed for sorting and stacking. Icons
        // need to be redisplayed if anything changes - the actual fileList
        // has not changed
        const redisplay = monitorschanged || gridschanged;

        if (redisplay) {
            this._desktopManager._displayList.forEach(x => x.removeFromGrid());

            this._desktops.forEach((desktop, index) => {
                desktop.updateGridDescription(this._desktopList[index]);

                if (monitorschangedList.includes(index)) {
                    desktop.resizeWindow();
                    desktop.resizeGrid();
                } else if (gridschangedList.includes(index)) {
                    desktop.resizeGrid();
                }
            });

            // There is a subtle difference here, all information is needed
            //
            // gridschanged implies prior grid information is available.
            // Therefore write mode is 'PRESERVE' initially
            //
            // monitors changed implies that all coordintes are rewritten to the
            // new monitor relative coordinates with a write mode of 'OVERWRITE'
            //
            // redisplay re-arranges all the icons on the new desktop monitor,
            // essential for proper sorting/stacking of icons and arranging of
            // icons
            //
            // For keep arranged new coordinates are automatically written to
            // grid. However for stacked co-ordinates- we will neeed to redo the
            // old coordinates seperately in do stacks with nonitorschanged info
            this._desktopManager._performSanityChecks();

            this._desktopManager
            .reFrameDesktop({redisplay, monitorschanged, gridschanged});
        }
    }

    createGridWindows() {
        // Allow startup with no desktops from constructor
        // even if no desktops are defined when started by the extension
        // desktops can be defined later from updateGridWindows(), dbus
        // activation
        if (!this._desktopList.length ||
            this._desktopList.some(d => {
                return typeof d !== 'object' || d == null;
            }))
            return;

        this._desktops.forEach(desktop => desktop.destroy());
        this._desktops = [];

        this._desktopList.forEach((desktop, desktopIndex) => {
            const desktopName =
                this._asDesktop
                    ? `@!${desktop.x},${desktop.y};BDHF`
                    : `DING ${desktopIndex}`;

            this._desktops.push(
                new DesktopGrid.DesktopGrid(
                    this._desktopManager,
                    desktopName,
                    desktop,
                    this._asDesktop,
                    this._hidden
                )
            );
        });

        if (this._desktopManager.windowsPromiseResolve)
            this._desktopManager.windowsPromiseResolve(true);
    }

    hide() {
        this._desktops.forEach(desktop => desktop.hide());
        this._hidden = true;
    }

    show() {
        this._desktops.forEach(desktop => desktop.show());
        this._hidden = false;
    }

    toggleVisibility() {
        if (this._hidden)
            this.show();
        else
            this.hide();
    }

    _getPreferredDisplayDesktop() {
        if (!this._desktops.length)
            return null;

        if (this._desktops.length === 1)
            return this._desktops[0];

        if (!this._Prefs.showOnSecondaryMonitor &&
            this._primaryMonitorIndex !== null) {
            return this._desktops.filter(d => {
                return d.monitorIndex === this._primaryMonitorIndex;
            })[0];
        }

        const tempDesktops = this._desktops.filter((desktop, index) =>
            index !== this._primaryMonitorIndex
        );

        if (this._desktops.length > 1) {
            if (tempDesktops.length === 1)
                return tempDesktops[0];

            // Positional algorithms here depending on new geomertry
            // of the placed monitors, -FIX ME- currently rudimentary
            // only going by position in the index, not by placement geometry.

            if (tempDesktops.length <= this._primaryMonitorIndex)
                return tempDesktops[0];
            else
                return tempDesktops[tempDesktops.length - 1];
        }

        // Catch All if everything fails
        return this._desktops[0];
    }

    destroyDesktops() {
        this._desktops.forEach(desktop => desktop.destroy());
        this._desktops = [];
    }

    onMutterSettingsChanged() {
        for (let desktop of this._desktops)
            desktop._premultiplied = this._premultiplied;

        this.requestGeometryUpdate();
    }

    getClosestDesktop(itempositionX) {
        let closestDesktop = null;
        let closestDistance = 100000000000;

        for (let desktop of this._desktops) {
            if (!desktop.isAvailable())
                continue;

            const distance = desktop.getDistance(itempositionX);

            if (distance < closestDistance) {
                closestDesktop = desktop;
                closestDistance = distance;
            }
        }

        return closestDesktop;
    }

    get desktops() {
        return this._desktops;
    }

    get desktopList() {
        return this._desktopList;
    }

    get primaryMonitorIndex() {
        return this._primaryMonitorIndex;
    }

    get primaryMonitor() {
        return this._primaryScreen;
    }

    get primaryIndex() {
        return this._primaryIndex;
    }

    get priorDesktopList() {
        return this._priorDesktopList;
    }

    get priorPrimaryMonitorIndex() {
        return this._priorPrimaryMonitorIndex;
    }

    get differentZooms() {
        return this._differentZooms;
    }

    get preferredDisplayDesktop() {
        return this._getPreferredDisplayDesktop();
    }
};
