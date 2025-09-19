import {_} from '../dependencies/gettext.js';

// app.actionName, Hint: Hint to display for action, Accel: Accelerator Key
// Editing this file will automatically set the hints and Accelerator when
// the program is started.
//
// Make sure file is not broken by edits!

export const DefaultShortcuts = {
    doNewFolder: {Hint: _('New Folder'), Accel: '<Control><Shift>N', Edit: true},
    doPaste: {Hint: _('Paste'), Accel: '<Control>V'},
    doUndo: {Hint: _('Undo'), Accel: '<Control>Z'},
    doRedo: {Hint: _('Redo'), Accel: '<Control><Shift>Z'},
    selectAll: {Hint: _('Select All'), Accel: '<Control>A'},
    showDesktopInFiles: {Hint: _('Show Desktop in Files'), Accel: '', Edit: true},
    openInTerminal: {Hint: _('Open in Terminal'), Accel: '', Edit: true},
    changeBackGround: {Hint: _('Change Background'), Accel: '', Edit: true},
    changeDisplaySettings: {Hint: _('Change Display Settings'), Accel: '', Edit: true},
    changeDesktopIconSettings: {Hint: _('Change Desktop Icon Settings'), Accel: '', Edit: true},
    cleanUpIcons: {Hint: _('Clean Up Icons'), Accel: '', Edit: true},
    'keep-arranged': {Hint: _('Keep Arranged'), Accel: '', Edit: true},
    'keep-stacked': {Hint: _('Keep Stacked'), Accel: '', Edit: true},
    sortSpecialFolders: {Hint: _('Sort Special Folders'), Accel: ''},
    arrangeByName: {Hint: _('Arrange Icons by Name'), Accel: '', Edit: true},
    arrangeByDescendingName: {Hint: _('Arrange Icons By Descending Name'), Accel: '', Edit: true},
    arrangeByModifiedTime: {Hint: _('Arrange Icons By Modified Time'), Accel: '', Edit: true},
    arrangeByKind: {Hint: _('Arrange Icons By Kind'), Accel: '', Edit: true},
    arrangeBySize: {Hint: _('Arrange Icons By Size'), Accel: '', Edit: true},
    findFiles: {Hint: _('Find Files'), Accel: '<Control>F', Edit: true},
    updateDesktop: {Hint: _('Update Desktop'), Accel: 'F5', Edit: true},
    showHideHiddenFiles: {Hint: _('Show Hidden Files'), Accel: '<Control>H'},
    unselectAll: {Hint: _('Unselect All'), Accel: 'Escape'},
    previewAction: {Hint: _('Preview'), Accel: 'space'},
    chooseIconLeft: {Hint: _('Choose Icon Left'), Accel: 'Left'},
    chooseIconRight: {Hint: _('Choose Icon Right'), Accel: 'Right'},
    chooseIconUp: {Hint: _('Choose Icon Up'), Accel: 'Up'},
    chooseIconDown: {Hint: _('Choose Icon Down'), Accel: 'Down'},
    menuKeyPressed: {Hint: _('Show Menu'), Accel: 'Menu,<Shift>F10'},
    displayShellBackgroundMenu: {Hint: _('Display Shell Background Menu'), Accel: ''},
    createDesktopShortcut: {Hint: _('Create Desktop Shortcut'), Accel: '', Edit: true},
    textEntryAccelsTurnOn: {Hint: _('Text Entry Accels Turn On'), Accel: ''},
    textEntryAccelsTurnOff: {Hint: _('Text Entry Accels Turn Off'), Accel: ''},
    newDocument: {Hint: _('New Document'), Accel: ''},
    showShortcutViewer: {Hint: _('Show Shortcut Viewer'), Accel: '', Edit: true},
    toggleVisibility: {Hint: _('Show Or Hide Desktop Icons'), Accel: '', Global: true},
    // FileItem Menu Actions
    openMultipleFileAction: {Hint: 'Open All', Accel: '<Control>Return', Edit: true},
    openOneFileAction: {Hint: 'Open Item', Accel: 'Return', Edit: true},
    stackunstack: {Hint: 'Stack/Unstack', Accel: ''},
    doopenwith: {Hint: 'Open With', Accel: '', Edit: true},
    graphicslaunch: {Hint: 'Launch using Integrated Graphics Card', Accel: ''},
    runasaprogram: {Hint: 'Run as a Program', Accel: ''},
    docut: {Hint: 'Cut Item', Accel: '<Control>X'},
    docopy: {Hint: 'Copy Item', Accel: '<Control>C'},
    dorename: {Hint: 'Rename Item', Accel: 'F2', Edit: true},
    movetotrash: {Hint: 'Move to Trash', Accel: 'Delete'},
    deletepermanantly: {Hint: 'Delete Permanently', Accel: '<Shift>Delete'},
    emptytrash: {Hint: 'Empty Trash', Accel: '', Edit: true},
    allowdisallowlaunching: {Hint: 'Allow/Disallow Launching', Accel: '', Edit: true},
    eject: {Hint: 'Eject', Accel: '', Edit: true},
    unmount: {Hint: 'Unmount', Accel: '', Edit: true},
    extractautoar: {Hint: 'Extract Here', Accel: ''},
    extracthere: {Hint: 'Extract Here', Accel: ''},
    extractto: {Hint: 'Extract To', Accel: ''},
    sendto: {Hint: 'Email to', Accel: '', Edit: true},
    compressfiles: {Hint: 'Compress Files', Accel: '', Edit: true},
    newfolderfromselection: {Hint: 'New Folder from Selection', Accel: '', Edit: true},
    properties: {Hint: 'Show Properties', Accel: '<Control>I', Edit: true},
    showinfiles: {Hint: 'Show in Files', Accel: '', Edit: true},
    openinterminal: {Hint: 'Open Terminal with Shell at this path', Accel: '', Edit: true},
    openDesktopInTerminal: {Hint: 'Open Terminal at Desktop path', Accel: '', Edit: true},
    makeLinks: {Hint: 'Create Link to Item', Accel: '<Shift><Control>M', Edit: true},
    bulkCopy: {Hint: 'Copy to', Accel: '', Edit: true},
    bulkMove: {Hint: 'Move to', Accel: '', Edit: true},
    onScriptClicked: {Hint: 'Run Script', Accel: ''},
};

// Following Global shortcuts will be added for editing and are editable
// However we need to add the key - the actioinName in lowercase to schemas
// for this to work, whithout the key added, it will not work.
// For example, for the one below, togglevisibility key added as {as} gvariant
// The program will automatically look for the lowercase key in schemas by
// converting the actionName.toLowerCase().

export const GlobalShortcuts = {
    toggleVisibility: DefaultShortcuts.toggleVisibility,
};
