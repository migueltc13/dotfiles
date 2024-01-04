# Create directory and navigate into it
mcd() {
  if [[ -z "$1" ]]; then
    echo "Usage: $0 <dir>"
    return 1
  fi
  mkdir -p "$1" && cd "$1" || return $?
}

# Perform basic calculations
calc() {
  echo "$@" | bc -l
}

# Add file(s) and commit them
gac() {
  git add "$@" && git commit -m "Add $*"
}

guc() {
  git add "$@" && git commit -m "Update $*"
}

grc() {
  if [ $# -ne 2 ]; then
    echo "Usage: grc <file_to_rm> <file_to_add>"
    return 1
  fi
  git rm "$1" && git add "$2" && git commit -m "Rename $1 to $2" || return $?
}

# Get a raw link from a github link
graw () {
  main_link=$(xclip -out -selection clipboard)
  user=$(echo "$main_link" | cut -d '/' -f 4)
  repo=$(echo "$main_link" | cut -d '/' -f 5)
  branch=$(echo "$main_link" | cut -d '/' -f 7)
  path_to_file=$(echo "$main_link" | cut -d '/' -f 8-)
  raw_link="https://raw.githubusercontent.com/$user/$repo/$branch/$path_to_file"
  curl "$raw_link" -s > "$(echo "$path_to_file" | rev | cut -d '/' -f 1 | rev)"
}

# Extract any type of archive
extract() {
  local file="$1"

  if [ -z "$file" ]; then
    echo "Usage: extract <file>"
    return 1
  fi

  if [ ! -e "$file" ]; then
    echo "$file does not exist."
    return 2
  fi

  local extension="${file##*.}"

  case "$extension" in
    tar.bz2 | tbz2)  tar xjvf "$file"   ;;
    tar.gz | tgz)    tar xzvf "$file"   ;;
    tar)             tar xvf "$file"    ;;
    bz2)             bunzip2 -v "$file" ;;
    rar)             unrar x "$file"    ;;
    gz)              gunzip "$file"     ;;
    zip)             unzip "$file"      ;;
    Z)               uncompress "$file" ;;
    7z)              7z x "$file"       ;;
    xz)              xz -d "$file"      ;;
    *)               echo "$0: cannot extract $file: unknown archive format"; return 3 ;;
  esac
}

# Send 1 free sms per day with Text Belt
send-sms() {
  curl -X POST https://textbelt.com/text \
    --data-urlencode phone="$1" \
    --data-urlencode message="$2" \
    -d key=textbelt
}

# Fix previous command
function fuck () {
  TF_PYTHONIOENCODING=$PYTHONIOENCODING;
  export TF_SHELL=bash;
  export TF_ALIAS=fuck;
  export TF_SHELL_ALIASES=$(alias);
  export TF_HISTORY=$(fc -ln -10);
  export PYTHONIOENCODING=utf-8;
  TF_CMD=$(
    thefuck THEFUCK_ARGUMENT_PLACEHOLDER "$@"
  ) && eval "$TF_CMD";
  unset TF_HISTORY;
  export PYTHONIOENCODING=$TF_PYTHONIOENCODING;
  history -s $TF_CMD;
}
