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

check () {
  FILE1=$1
  FILE2=$2
  $diff $FILE2 $FILE1 1>/dev/null
  if (( $? != 0 )); then

    # Check if copy target file is a directory
    if [ -d "$FILE2" ]; then
        FILE2=$(dirname "$FILE2")
    fi

    echo "cp -r $FILE1 $FILE2"

    # Change menu
    read -s -n 1 -p "Do you want to copy these changes? [y/N/(d)iff] " choice
    if [[ "$choice" =~ [yY] ]]; then
      echo -e "\nCopying changes..."
      sudo cp -r $FILE1 $FILE2
    elif [[ "$choice" =~ [dD] ]]; then
      #GIT_PAGER="less -FRX" $diff --color=always $2 $1 | $less -x 4 -R
      $diff --color=always $2 $1 | $less -R -x 4
      # Clear previous output lines
      tput el; echo -ne "\r"; tput cuu1; tput el; echo -ne "\r"
      check $1 $2
    else
      echo -e "\nChanges were not copied."
    fi

    ((changes_count++))
  fi
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
check "$HOME/.nanorc"                              ".nanorc"
check "$HOME/.config/nvim/"                        ".config/nvim/"
check "$HOME/.local/share/gnome-shell/extensions/" ".local/share/gnome-shell/extensions/"
check "/usr/lib/command-not-found"                 "usr/lib/command-not-found"
check "/usr/local/bin"                             "usr/local/bin"

# check "$HOME/.config/"                             ".config/"

# apt-packages.txt
$apt list --installed 2>/dev/null | $grep '\[installed\]' | $cut -d'/' -f1 1> /tmp/apt-packages.txt
check "/tmp/apt-packages.txt" "apt-packages.txt"

# snap-packages.txt
$snap list | $tail -n +2 | $cut -d' ' -f1 1> /tmp/snap-packages.txt
check "/tmp/snap-packages.txt" "snap-packages.txt"

# TODO: /opt dir
# TODO: ~/Git dir
# TODO: animations
# TODO: .config dir
# TODO: More config files: like .Xresources, .nanorc, ...
# TODO: apps

if (( $changes_count == 0 )); then
  echo "No changes detected"
fi

exit 0
