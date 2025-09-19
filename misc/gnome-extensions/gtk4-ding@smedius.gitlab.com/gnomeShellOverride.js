/* eslint-disable no-invalid-this */
/* eslint-disable no-undef */
/* The above is for use of global in this file as Shell.global */
/* Gnome Shell Override
 *
 * Copyright (C) 2023 Sundeep Mediratta (smedius@gmail.com)
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

/* exported GnomeShellOverride */

const {Meta, Clutter, GObject} = imports.gi;

// Show desktop windows on workspace thumbnails
const SHOW_ON_WORKSPACE_THUMBNAILS = true;
const SHOW_ICONS_ON_OVERVIEW = false;
const ANIMATION_MULTIPLE = 1;

import {WorkspaceBackground} from 'resource:///org/gnome/shell/ui/workspace.js';

import {InjectionManager} from
    'resource:///org/gnome/shell/extensions/extension.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Util from 'resource:///org/gnome/shell/misc/util.js';

export {GnomeShellOverride};

var GnomeShellOverride = class {
    constructor() {
        this._injectionManager = new InjectionManager();
    }

    enable() {
        const Background = WorkspaceBackground;
        this._injectionManager.overrideMethod(Background.prototype, '_init',
            this._newBackgroundInit.bind(this));
    }

    disable() {
        this._injectionManager.clear();
    }

    _newBackgroundInit(origninalMethod) {
        return function (...args) {
            origninalMethod.call(this, ...args);

            /** @enum {number} */
            const ControlsState = {
                HIDDEN: 0,
                WINDOW_PICKER: 1,
                APP_GRID: 2,
            };

            const opaque = 255;
            const transparent = 0;

            const adjustment =
                Main.overview._overview._controls._stateAdjustment

            function _windowIsOnThisMonitor(metawindow, monitorIndex) {
                const geometry =
                    global.display.get_monitor_geometry(monitorIndex);

                const [intersects] =
                    metawindow.get_frame_rect().intersect(geometry);
                
                return intersects;
            }

            function _modifyTransparency(value) {
                const {initialState, finalState, } =
                    adjustment.getStateTransitionParams();

                if ((initialState == ControlsState.HIDDEN ||
                    finalState == ControlsState.HIDDEN) &&
                    (Math.abs(initialState - finalState) == 1))
                    return _setTransparency(value);

                return transparent;
            }

            function _setTransparency(value) {
                if (SHOW_ICONS_ON_OVERVIEW)
                    return opaque;
                return Util.lerp(opaque, transparent,
                    Math.min(ANIMATION_MULTIPLE * value, 1.0));
            }

            const desktopWindows = global.get_window_actors().filter(a =>
                a.meta_window.get_window_type() === Meta.WindowType.DESKTOP &&
                _windowIsOnThisMonitor(a.meta_window, this._monitorIndex));

            if (desktopWindows.length) {
                const desktopLayer = new Clutter.Actor({
                    layout_manager: new DesktopLayout(),
                    clip_to_allocation: true,
                });

                for (let windowActor of desktopWindows) {
                    const clone = new Clutter.Clone({
                        source: windowActor,
                    });

                    desktopLayer.add_child(clone);

                    windowActor.connectObject('destroy', () => {
                        clone.destroy();
                    }, this);
                }

                const offset = 0;

                const syncAll = Clutter.BindConstraint.new(
                    this._bgManager.backgroundActor,
                    Clutter.BindCoordinate.ALL,
                    offset);

                desktopLayer.add_constraint(syncAll);
                desktopLayer.opacity = _setTransparency(opaque);
    
                this._stateAdjustment.connectObject('notify::value',
                    (stAdjustment) => {
                        if (SHOW_ON_WORKSPACE_THUMBNAILS)
                            desktopLayer.opacity =
                                _setTransparency(this._stateAdjustment.value);
                        else
                            desktopLayer.opacity =
                                _modifyTransparency(stAdjustment.value);
                    },
                    this
                );

                this._backgroundGroup.insert_child_above(
                    desktopLayer,
                    this._bgManager.backgroundActor
                );
            }
        };
    }
};

class DesktopLayout extends Clutter.LayoutManager {
    static {
        GObject.registerClass(this);
    }

    vfunc_get_preferred_width() {
        return [0, 0];
    }

    vfunc_get_preferred_height() {
        return [0, 0];
    }

    vfunc_allocate(container, box) {
        const monitorIndex = Main.layoutManager.findIndexForActor(container);
        const monitor = Main.layoutManager.monitors[monitorIndex];
        const hscale = box.get_width() / monitor.width;
        const vscale = box.get_height() / monitor.height;

        for (const child of container) {
            const childBox = new Clutter.ActorBox();
            const frameRect = child.get_source()?.metaWindow.get_frame_rect();

            childBox.set_size(
                Math.round(Math.min(frameRect.width, monitor.width) * hscale),
                Math.round(Math.min(frameRect.height, monitor.height) * vscale)
            );

            childBox.set_origin(
                Math.round((frameRect.x - monitor.x) * hscale),
                Math.round((frameRect.y - monitor.y) * vscale)
            );

            child.allocate(childBox);
        }
    }
}
