#!/bin/bash

# Description: Check if any of the system files had changed,
# if so prompt the user to copy changes to dotfiles directory.


# Check if user is not root
if (( $(id -u) == 0 )); then
  echo "$0: Do not run as root. Exiting..."
  exit 1
fi

# Check current directory
if [ "$(basename $(pwd))" != "dotfiles" ]; then
  echo "$0: Run in \"dotfiles\" directory. Exiting..."
  exit 2
fi

notify () {
  diff_status=$3
  if (( $diff_status != 0 )); then
    FILE1=$1
    FILE2=$2

    # Check if changed file is a directory
    if [ -d "$FILE2" ]; then
        FILE2=$(dirname "$FILE2")
    fi

    # Change menu
    echo "cp -r $FILE1 $FILE2"
    read -p "Do you want to copy these changes? [y/N/(d)iff] " choice
    if [[ "$choice" =~ [yY] ]]; then
      echo "Copying changes..."
      sudo cp -r $FILE1 $FILE2
    elif [[ "$choice" =~ [dD] ]]; then
      GIT_PAGER="less -FRX" $diff --color=always $2 $1 | $less -R
      # Clear output lines
      tput el; tput cuu1; tput el; tput cuu1
      notify $1 $2 $3
    else
      echo "Changes were not copied."
    fi

    ((changes_count++))
  fi
}

check () {
  FILE1="$1"
  FILE2="$2"
  $diff $FILE2 $FILE1 1>/dev/null
  notify $FILE1 $FILE2 $?
}

# File changes counter
changes_count=0

# Full path commands
diff=$(which diff)
grep=$(which grep)
cut=$(which cut)
apt=$(which apt)
snap=$(which snap)
tail=$(which tail)
less=$(which less)

check "$HOME/.bashrc"                              ".bashrc"
check "$HOME/.bash_aliases"                        ".bash_aliases"
check "$HOME/.bash_functions"                      ".bash_functions"
check "$HOME/.bash_profile"                        ".bash_profile"
check "/usr/lib/command-not-found"                 "usr/lib/command-not-found"
check "/usr/local/bin"                             "usr/local/bin"
check "$HOME/.local/share/gnome-shell/extensions/" ".local/share/gnome-shell/extensions/"

# apt-packages.txt
$apt list --installed 2>/dev/null | $grep '\[installed\]' | $cut -d'/' -f1 1> /tmp/apt-packages.txt
check "/tmp/apt-packages.txt" "apt-packages.txt"

# snap-packages.txt
$snap list | $tail -n +2 | $cut -d' ' -f1 1> /tmp/snap-packages.txt
check "/tmp/snap-packages.txt" "snap-packages.txt"

# TODO: /opt dir
# TODO: ~/Git dir
# TODO: animations
# TODO: More config files: like .Xresources, .nanorc, ...
# TODO: apps

if (( $changes_count == 0 )); then
  echo "No changes detected"
fi

exit 0
