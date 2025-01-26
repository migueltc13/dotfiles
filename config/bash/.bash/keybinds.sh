# Alt+h: show keybinds
bind '"\eh": "\C-k\C-ushow_keybinds\n"' &>/dev/null

# Ctrl+backspace: delete word backward
bind '"\C-h": backward-kill-word' &>/dev/null

# Ctrl+s: switch last two characters
# NOTE flow control is disabled at .bashrc with stty -ixon
bind '"\C-s": transpose-chars' &>/dev/null

# Ctrl+p: copy current line to clipboard (xclip)
bind '"\C-p": "\C-e\C-uxclip -selection clipboard <<EOTFF\n\C-y\nEOTFF\n"' &>/dev/null

# Alt+l: clear screen
bind '"\el": "\C-k\C-uclear\n"' &>/dev/null

# Alt+s: run ssh-menu
bind '"\es": "\C-k\C-ussh-menu\n"' &>/dev/null

# Alt+m: run cht
bind '"\em": "\C-k\C-ucht\n"' &>/dev/null

### Arguments keybinds
# Alt+0-9: insert nth argument at cursor
for i in {0..9}; do
    bind "\"\e$i\":\"!:${i}\e\C-e \"" &>/dev/null
done
# Alt+*: insert all arguments at cursor
bind '"\e*": "!:*\e\C-e"' &>/dev/null
# Alt+^: insert first argument at cursor # No carets for pt keyboards .-.
bind '"\e^": "!^\e\C-e"' &>/dev/null
# Alt+$: insert last argument at cursor
bind '"\e$": "!$\e\C-e"' &>/dev/null

# vim movement keys for history search
bind '"\ek": history-search-backward' &>/dev/null
bind '"\ej": history-search-forward' &>/dev/null

# Ctrl+g Ctrl+o: open current github repository in browser
bind '"\C-g\C-o": "\C-k\C-ughoc\n"' &>/dev/null
bind '"\C-go": "\C-k\C-ughoc\n"' &>/dev/null

# Show all keybinds
function show_keybinds() {
bat <<EOF
Custom Keybinds:
    Alt+H       show this help message
    Ctrl+H      delete word backward (Ctrl+backspace)
    Ctrl+S      switch last two characters
    Ctrl+P      copy current line to clipboard (xclip)
    Alt+L       clear screen
    Alt+S       run ssh-menu
    Alt+M       run cht, a cheat sheet tool

Vim Movement Keybinds:
    Alt+K       search history backward
    Alt+J       search history forward

Arguments Keybinds:
    Alt+0..9    insert nth argument at cursor
    Alt+*       insert all arguments at cursor
    Alt+$       insert last argument at cursor
    Alt+^       insert first argument at cursor

GitHub Keybinds:
    Ctrl+G O    open current GitHub repo in browser
    Ctrl+G F    files
    Ctrl+G B    branches
    Ctrl+G T    tags
    Ctrl+G R    remotes
    Ctrl+G H    commit hashes
    Ctrl+G S    stashes
    Ctrl+G L    reflogs
    Ctrl+G W    worktrees
    Ctrl+G E    git for-each-ref

Fuzzy Finder Keybinds:
    Ctrl+T      fuzzy find files
    Ctrl+R      fuzzy history search
    Alt+C       fuzzy cd

System Keybinds:
    Super+B     toggle bluetooth
    Super+N     open notes
    Super+K     launch screenkey (deprecated)
    Super+T     launch terminal
    Super+C     focus the active notification
EOF
}
