#!/bin/bash

# Description: Check if any of the system files had changed,
# if so prompt the user to copy changes to dotfiles directory.

# Check if user is not root
if (( $(id -u) == 0 )); then
    echo "$0: Do not run as root. Exiting..."
    exit 1
fi

# Check current directory
if [ "$(basename "$(pwd)")" != "dotfiles" ]; then
    echo "$0: Run in \"dotfiles\" directory. Exiting..."
    exit 2
fi

check () {
    FILE1=$1
    FILE2=$2
    if [ ! -e "$FILE1" ]; then
        echo "$FILE1 does not exist"
        return
    fi
    if [ ! -e "$FILE2" ]; then
        echo "$FILE2 does not exist"
        return
    fi
    if ! diff -r "$FILE2" "$FILE1" 1>/dev/null; then
        echo "cp -r $FILE1 $FILE2"

    # Change menu
    read -r -s -n 1 -p "Do you want to copy these changes? [y/N/(d)iff] " choice
    if [[ "$choice" =~ [yY] ]]; then
        echo -e "\nCopying changes..."
        sudo rm -rf "$FILE2"
        sudo cp -r "$FILE1" "$FILE2"
    elif [[ "$choice" =~ [dD] ]]; then
        diff -r --color=always "$2" "$1" | less -R -x 4 --mouse
        # Clear previous output lines
        tput el; echo -ne "\r"; tput cuu1; tput el; echo -ne "\r"
        check "$1" "$2"
    else
        echo -e "\nChanges were not copied."
    fi

    ((changes_count++))
    fi
}

# File changes counter
changes_count=0

### Packages

# apt sources list
# check "/etc/apt/sources.list"    "packages/apt-sources/sources.list"
check "/etc/apt/sources.list.d/" "packages/apt-sources/sources.list.d/"

# apt
apt list --installed 2>/dev/null | grep '\[installed\]' | cut -d'/' -f1 1> /tmp/apt.txt
check "/tmp/apt.txt" "packages/apt.txt"

# snap
snap list | tail -n +2 | cut -d' ' -f1 1> /tmp/snap.txt
check "/tmp/snap.txt" "packages/snap.txt"

# pip
pip list --format=freeze | cut -d'=' -f1 1> /tmp/pip.txt
check "/tmp/pip.txt" "packages/pip.txt"

# cargo
cargo install --list | grep -Ev '^ ' | cut -d':' -f1 | sed 's/ v/@/g' 1> /tmp/cargo.txt
check "/tmp/cargo.txt" "packages/cargo.txt"

# npm
npm ls -g --json | jq -r '.. | select(.dependencies? // .) | .dependencies? | objects | keys_unsorted[] // .name?' 1> /tmp/npm.txt
check "/tmp/npm.txt" "packages/npm.txt"

### Config

# bash
check "$HOME/.profile"               "config/bash/.profile"
check "$HOME/.bashrc"                "config/bash/.bashrc"
check "$HOME/.bash/"                 "config/bash/.bash/"

# git
check "$HOME/.gitconfig"             "config/git/.gitconfig"

# delta
check "$HOME/.config/delta/"         "config/delta/"

# nano
check "$HOME/.nanorc"                "config/nano/.nanorc"

# xterm
check "$HOME/.Xresources"            "config/xterm/.Xresources"

# tmux
# check "$HOME/.tmux.conf"             "config/tmux/.tmux.conf"
check "/etc/tmux.conf"               "config/tmux/tmux.conf"
check "$HOME/.config/.gitmux.conf"   "config/tmux/gitmux.conf"

# terminator
check "$HOME/.config/terminator/"    "config/terminator/"

# bat
check "$HOME/.config/bat/"           "config/bat/"

# btop
check "$HOME/.config/btop/"          "config/btop/"

# nvim
check "$HOME/.config/nvim/"          "config/nvim/"

# lsd
check "$HOME/.config/lsd/"           "config/lsd/"

# vivid
check "$HOME/.config/vivid/"         "config/vivid/"

# kanata
check "$HOME/.config/kanata/kanata.kbd"    "config/kanata/kanata.kbd"
check "/etc/systemd/system/kanata.service" "config/kanata/kanata.service"

# BetterDiscord
check "$HOME/.config/BetterDiscord/" "config/BetterDiscord/"

# gnome extensions settings
dconf dump /org/gnome/shell/extensions/ 1> /tmp/gnome-extensions-settings.conf
check "/tmp/gnome-extensions-settings.conf" "config/gnome/extensions/settings.conf"

# gnome extensions enabled list
dconf dump /org/gnome/shell/ | grep -Eo "enabled-extensions=\[.*\]" 1> /tmp/gnome-extensions-enabled.conf
check "/tmp/gnome-extensions-enabled.conf" "config/gnome/extensions/enabled.conf"

# gnome extensions disabled list
dconf dump /org/gnome/shell/ | grep -Eo "disabled-extensions=\[.*\]" 1> /tmp/gnome-extensions-disabled.conf
check "/tmp/gnome-extensions-disabled.conf" "config/gnome/extensions/disabled.conf"

# gnome settings
dconf dump / 1> /tmp/gnome-settings.conf
check "/tmp/gnome-settings.conf" "config/gnome/settings.conf"

### Miscellaneous

check "$HOME/.local/share/gnome-shell/extensions/" "misc/gnome-extensions/"
check "$HOME/Animations/"                          "misc/animations/"
check "$HOME/Pictures/Wallpapers/"                 "misc/wallpapers/"
check "$HOME/.mozilla/firefox/release/chrome"      "misc/firefox/chrome/"
# check "/usr/local/bin/"                            "misc/bin/"
# check "/usr/lib/command-not-found"                 "misc/command-not-found/command-not-found"
# TODO: /opt dir

if (( changes_count == 0 )); then
    echo "No changes detected"
else
    # change owner and group to current user
    sudo chown -R "$USER":"$USER" .
fi

exit 0
