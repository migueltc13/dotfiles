#!/bin/bash

# Check if any of the system files had changed

if (( $(id -u) == 0 )); then
  echo "$0: Do not run as root. Exiting..."
  exit 1
fi

notify () {
  diff_status=$?
  if (( $diff_status != 0 )); then

    FILE1="$1"
    FILE2="$2"

    # TODO: add header to less command
    GIT_PAGER="less -FRX" $diff --color=always $FILE2 $FILE1 | $less -R

    # Check if changed file is a directory
    if [ -d "$FILE2" ]; then
        FILE2=$(dirname "$FILE2")
    fi

    echo "cp -r $FILE1 $FILE2"
    read -p "Do you want to copy these changes? [y/N] " choice
    if [[ "$choice" =~ [yY] ]]; then
      echo "Copying changes..."
      sudo cp -r $FILE1 $FILE2
    else
      echo "Changes were not copied."
    fi

    ((count++))
  fi
}

check () {
  FILE1="$1"
  FILE2="$2"
  $diff $FILE2 $FILE1 1>/dev/null
  notify $FILE1 $FILE2
}

count=0

diff=$(which diff)
grep=$(which grep)
cut=$(which cut)
apt=$(which apt)
snap=$(which snap)
tail=$(which tail)
less=$(which less)

check "$HOME/.bashrc" ".bashrc"
check "$HOME/.bash_aliases" ".bash_aliases"
check "$HOME/.bash_functions" ".bash_functions"
check "/usr/lib/command-not-found" "usr/lib/command-not-found"
check "/usr/local/bin" "usr/local/bin"
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
# TODO: More config files: like .Xresources, .nano, ...

echo "$count changes detected"

exit 0
