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
  $diff -r $FILE2 $FILE1 1>/dev/null
  if (( $? != 0 )); then
    echo "cp -r $FILE1 $FILE2"

    # Change menu
    read -s -n 1 -p "Do you want to copy these changes? [y/N/(d)iff] " choice
    if [[ "$choice" =~ [yY] ]]; then
      echo -e "\nCopying changes..."
      sudo rm -rf $FILE2
      sudo cp -r $FILE1 $FILE2
    elif [[ "$choice" =~ [dD] ]]; then
      #GIT_PAGER="less -FRX" $diff -r --color=always $2 $1 | $less -x 4 -R
      $diff -r --color=always $2 $1 | $less -R -x 4
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
check "$HOME/.bash_prompt"                         ".bash_prompt"
check "$HOME/.bash_colors"                         ".bash_colors"
check "$HOME/.bash_aliases"                        ".bash_aliases"
check "$HOME/.bash_functions"                      ".bash_functions"
check "$HOME/.bash_keybindings"                    ".bash_keybindings"
check "$HOME/.bash_copilot_cli"                    ".bash_copilot_cli"
check "$HOME/.bash_fzf"                            ".bash_fzf"
check "$HOME/.profile"                             ".profile"
check "$HOME/.nanorc"                              ".nanorc"
check "$HOME/.Xresources"                          ".Xresources"
check "$HOME/.gitconfig"                           ".gitconfig"
check "$HOME/.config/nvim/"                        ".config/nvim/"
check "$HOME/.config/terminator/"                  ".config/terminator/"
check "$HOME/.config/bat/"                         ".config/bat/"
check "$HOME/.local/share/gnome-shell/extensions/" ".local/share/gnome-shell/extensions/"
check "$HOME/Animations/"                          "Animations/"
check "$HOME/Pictures/Wallpapers/"                 "Pictures/Wallpapers/"
# check "/usr/lib/command-not-found"                 "usr/lib/command-not-found"
check "/usr/local/bin"                             "usr/local/bin"

# apt-packages.txt
$apt list --installed 2>/dev/null | $grep '\[installed\]' | $cut -d'/' -f1 1> /tmp/apt-packages.txt
check "/tmp/apt-packages.txt" "apt-packages.txt"

# snap-packages.txt
$snap list | $tail -n +2 | $cut -d' ' -f1 1> /tmp/snap-packages.txt
check "/tmp/snap-packages.txt" "snap-packages.txt"

# TODO: /opt dir

# change owner to current user
user=$USER
sudo chown -R $user .

if (( $changes_count == 0 )); then
  echo "No changes detected"
fi

exit 0
