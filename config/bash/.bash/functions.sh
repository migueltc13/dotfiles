# Create directory and navigate into it
function mcd() {
  if [[ -z "$1" ]]; then
    echo "Usage: $0 <dir>"
    return 1
  fi
  mkdir -p "$1" && cd "$1" || return $?
}

# Perform basic calculations
function calc() {
  echo "$@" | bc -l
}

# # fzf: find files
function f() {
  find . -type f | fzf --preview="batcat --color=always --style=rule {}"
}

# fzf: find directories
function d() {
  find . -type d | fzf
}

# fzf: find files and open them with batcat
function b() {
  # shellcheck disable=SC2155
  local result=$(f)
  if [ -z "$result" ]; then
    return 130
  fi
  # shellcheck disable=SC2086
  batcat --style=rule $result
}

# fzf: find files/directories and open them with xdg-open
function o() {
  # shellcheck disable=SC2155
  local result=$(find . | fzf --no-multi)
  if [ -z "$result" ]; then
    return 130
  fi
  xdg-open "$result"
}

# fzf: find files/directories and open them with nvim
function n() {
  # shellcheck disable=SC2155
  local result=$(find . | fzf --preview="if [ -f {} ]; then batcat --color=always --style=rule {}; else exa -aG1 --icons {}; fi")
  if [ -z "$result" ]; then
    return 130
  fi
  # shellcheck disable=SC2086
  nvim $result
}

# git: Add file(s) and commit them: "Create <file(s)>"
function gac() {
  git add "$@" && git commit -m "Create $*"
}

# git: Add file(s) and commit them: "Update <file(s)>"
function guc() {
  git add "$@" && git commit -m "Update $*"
}

# git: Rename file and commit it: "Rename <file_to_rm> to <file_to_add>"
function grc() {
  if [ $# -ne 2 ]; then
    echo "Usage: grc <file_to_rm> <file_to_add>"
    return 1
  fi
  git rm "$1" && git add "$2" && git commit -m "Rename $1 to $2" || return $?
}

# Get a raw link from a github link
function graw() {
  main_link=$(xclip -out -selection clipboard)
  user=$(echo "$main_link" | cut -d '/' -f 4)
  repo=$(echo "$main_link" | cut -d '/' -f 5)
  branch=$(echo "$main_link" | cut -d '/' -f 7)
  path_to_file=$(echo "$main_link" | cut -d '/' -f 8-)
  raw_link="https://raw.githubusercontent.com/$user/$repo/$branch/$path_to_file"
  curl "$raw_link" -s > "$(echo "$path_to_file" | rev | cut -d '/' -f 1 | rev)"
}

# Extract any type of archive
function extract() {
  if [ -z "$1" ]; then
    echo "Usage: $0 <file>"
    return 1
  fi

  if [ ! -e "$1" ]; then
    echo "Archive $1 does not exist."
    return 2
  fi

  case "$1" in
    *.tar.bz2 | *.tbz2) tar xjvf "$1"  ;;
    *.tar.gz | *.tgz)   tar xzvf "$1"  ;;
    *.tar)              tar xvf "$1"   ;;
    *.bz2)              bunzip2 -v "$1";;
    *.rar)              unrar x "$1"   ;;
    *.gz)               gunzip "$1"    ;;
    *.zip)              unzip "$1"     ;;
    *.Z)                uncompress "$1";;
    *.7z)               7z x "$1"      ;;
    *.xz)               xz -d "$1"     ;;
    *)                  echo "$0: cannot extract $1: unknown archive format"; return 3;;
  esac
}

# Send 1 free sms per day with Text Belt
function send-sms() {
  curl -X POST https://textbelt.com/text \
    --data-urlencode phone="$1" \
    --data-urlencode message="$2" \
    -d key=textbelt
}

# Fix previous command
function fuck() {
  TF_PYTHONIOENCODING=$PYTHONIOENCODING;
  export TF_SHELL=bash;
  export TF_ALIAS=fuck;
  # shellcheck disable=SC2155
  export TF_SHELL_ALIASES=$(alias);
  # shellcheck disable=SC2155
  export TF_HISTORY=$(fc -ln -10);
  export PYTHONIOENCODING=utf-8;
  TF_CMD=$(
    thefuck THEFUCK_ARGUMENT_PLACEHOLDER "$@"
  ) && eval "$TF_CMD";
  unset TF_HISTORY;
  export PYTHONIOENCODING=$TF_PYTHONIOENCODING;
  # shellcheck disable=SC2086
  history -s $TF_CMD;
}
