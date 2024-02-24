# Ctrl+backspace: delete word backward (same as Ctrl+w and Alt+Backspace)
bind '"\C-h": backward-kill-word' &>/dev/null

# Ctrl+p: copy current line to clipboard (xclip)
bind '"\C-p": "\C-e\C-uxclip -selection clipboard <<EOTFF\n\C-y\nEOTFF\n"' &>/dev/null

# Alt+l: clear screen
bind '"\el": "\C-k\C-uclear\n"' &>/dev/null

# Alt+s: run ssh-menu
bind '"\es": "\C-k\C-ussh-menu\n"' &>/dev/null

# Alt+h: run cht
bind '"\eh": "\C-k\C-ucht\n"' &>/dev/null

# vim movement keys
bind '"\ek": history-search-backward' &>/dev/null
bind '"\ej": history-search-forward' &>/dev/null
