# Create directory and navigate into it
mcd() {
  if [[ -z "$1" ]]; then
    echo "Usage: $0 <dir>"
    return 1
  fi
  mkdir -p "$1" && cd "$1"
}

# Perform basic calculations
calc() {
  echo "$@" | bc -l
}

# Add file(s) and commit them
gac() {
  git add $@ && git commit -m "Add $*"
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
  if [ -f "$1" ] ; then
    case "$1" in
      *.tar.bz2)   tar xjf "$1"    ;;
      *.tar.gz)    tar xzf "$1"    ;;
      *.bz2)       bunzip2 -v "$1" ;;
      *.rar)       unrar x "$1"    ;;
      *.gz)        gunzip "$1"     ;;
      *.tar)       tar xvf "$1"    ;;
      *.tbz2)      tar xjcf "$1"   ;;
      *.tgz)       tar xzcf "$1"   ;;
      *.zip)       unzip "$1"      ;;
      *.Z)         uncompress "$1" ;;
      *.7z)        7z x "$1"       ;;
      *.xz)        xz -d "$1"      ;;
      *)           echo "$0: cannot extract $1";;
    esac
  else
    echo "$1 is not a valid file"
  fi
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
