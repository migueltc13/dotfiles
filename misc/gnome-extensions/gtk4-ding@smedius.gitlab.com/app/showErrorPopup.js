/* DING: Desktop Icons New Generation for GNOME Shell
 *
 * Copyright (C) 2022, 2025 Sundeep Mediratta (smedius@gmail.com) gtk4 port
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
import {Adw, Gdk, Gio} from '../dependencies/gi.js';
import {_} from '../dependencies/gettext.js';

export {ShowErrorPopup};

const ShowErrorPopup = class {
    constructor(text, secondaryText, waitDelayMs, helpURL = null) {
        this._waitDelayMs = waitDelayMs; // async function
        this._applicationId = Gio.Application.get_default();
        this._window = this._applicationId.get_active_window();
        this._dialog = new Adw.AlertDialog();
        this._dialog.set_body_use_markup(true);
        this._dialog.set_heading_use_markup(true);

        if (text)
            this._dialog.set_heading(text);

        if (secondaryText)
            this._dialog.set_body(secondaryText);

        if (helpURL) {
            this._helpURL = helpURL;
            this._dialog.add_response('0', _('Cancel'));
            this._dialog.add_response('1', _('More Information'));
            this._dialog.set_close_response('0');
            this._dialog.set_default_response('1');

            this._dialog.set_response_appearance(
                '1',
                Adw.ResponseAppearance.SUGGESTED
            );

            this._dialog.set_response_appearance(
                '0',
                Adw.ResponseAppearance.DEFAULT
            );

            this._dialog.set_prefer_wide_layout(true);
        } else {
            this._dialog.add_response('0', _('Cancel'));
            this._dialog.set_close_response('0');
            this._dialog.set_default_response('0');

            this._dialog.set_response_appearance(
                '0',
                Adw.ResponseAppearance.DEFAULT
            );
        }
        this._dialog.connect('response', this._callback.bind(this));
    }

    show() {
        this._dialog.present(this._window);
    }

    _callback(actor, response) {
        if (response === '1' && this._helpURL)
            this._launchUri(this._helpURL);
    }

    run() {
        return new Promise(resolve => {
            this._dialog.choose(this._window, null, (actor, asyncResult) => {
                const response = actor.choose_finish(asyncResult);
                resolve(response);
            });
        });
    }

    async runAutoClose(time) {
        this.show();
        await this._timeoutClose(time);
    }

    close() {
        this._dialog.close();
    }

    async _timeoutClose(time) {
        await this._waitDelayMs(time);
        this._dialog.set_response_enabled('0', false);
        this.close();
    }

    _launchUri(uri) {
        const context = Gdk.Display.get_default().get_app_launch_context();
        context.set_timestamp(Gdk.CURRENT_TIME);
        Gio.AppInfo.launch_default_for_uri(uri, context);
    }
};
