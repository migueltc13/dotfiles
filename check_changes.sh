#!/bin/bash

# Check if any of the system files had changed

if (( $(id -u) == 0 )); then
  echo "$0: Do not run as root. Exiting..."
  exit 1
fi

notify () {
  diff_status=$?
  if (( $diff_status != 0 )); then
    echo "Changes in $2"
    ((count++))
  fi
}

check () {
  PATH="$1"
  FILE="$2"
  $diff $PATH$FILE $FILE 1>/dev/null
  notify $PATH$FILE $FILE
}

count=0

diff=$(which diff)
grep=$(which grep)
cut=$(which cut)
apt=$(which apt)
snap=$(which snap)
tail=$(which tail)

check "$HOME/" ".bash_aliases"
check "/" "usr/lib/command-not-found"
check "/" "usr/local/bin"
check "$HOME/" ".local/share/gnome-shell/extensions/"

# apt-packages.txt
$apt list --installed 2>/dev/null | $grep '\[installed\]' | $cut -d'/' -f1 1> /tmp/apt-packages.txt
check "/tmp/" "apt-packages.txt"

# snap-packages.txt
$snap list | $tail -n +2 | $cut -d' ' -f1 1> /tmp/snap-packages.txt
check "/tmp/" "snap-packages.txt"

# TODO: /opt dir
# TODO: ~/Git dir
# TODO: animations
# TODO: More config files: like .Xresources, .nano, ...

echo "$count changes detected"

exit 0
