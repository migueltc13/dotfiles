# override which to handle aliases and functions
function which() {
    local w
    w="$(command -V "$1")"
    case "$w" in
        *'is a function'*)
            echo "${w#*$'\n'}"
            ;;
        *'is aliased to'*)
            w="${w#*\`}"
            echo "${w%\'*}"
            ;;
        *'is hashed'*)
            w=${w::-1}
            echo "${w##* (}"
            ;;
        *)
            echo "${w##* }"
            ;;
    esac
}

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

# Explode directory
function explode() {
    if [ -z "$1" ]; then
        echo "Usage: $0 <dir>"
        return 1
    fi
    mv "$1"/* .
    rmdir "$1"
}

# # fzf: find files
function f() {
    find . -type f 2>/dev/null | fzf --preview="bat --color=always --style=rule {}"
}

# fzf: find directories
function d() {
    find . -type d  2>/dev/null | fzf
}

# fzf: find files and open them with bat
function b() {
    local result
    result=$(f)
    if [ -z "$result" ]; then
        return 130
    fi
    # shellcheck disable=SC2086
    bat --style=rule $result
}

# fzf: find files/directories and open them with xdg-open
function o() {
    local result
    result=$(find .  2>/dev/null | fzf --no-multi)
    if [ -z "$result" ]; then
        return 130
    fi
    xdg-open "$result"
}

# fzf: find files/directories and open them with nvim
function n() {
    local result
    result=$(find .  2>/dev/null | \
        fzf --preview="\
        if [ -f {} ]; then\
            bat --color=always --style=rule {};\
        else\
            lsd --icon=always --color=always -A {};\
        fi")
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
    git rm -r "$1" && git add "$2" && git commit -m "Rename $1 to $2" || return $?
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

# Open or more github repositories in browser
function gho() {
    list_orgs=false
    case "$1" in
        -h | --help)
            echo "Usage: gho [-o] [search query]"
            return 0
            ;;
        -o | --orgs | --org)
            args=("${@:2}")
            list_orgs=true
            ;;
        *)
            args=("$@")
            ;;
    esac

    # flags
    MAX_REPOS=100
    FZF_FLAGS=""
    [ ${#args[@]} -ne 0 ] && FZF_FLAGS="-q \"${args[*]}\""
    [ "$(tput cols)" -gt 75 ] && FZF_FLAGS+=" --preview='gh repo view {}'"

    # list user repos
    repos=$(gh repo list --limit $MAX_REPOS)

    # list org repos
    if [ "$list_orgs" = true ]; then
        orgs=$(gh api user/orgs --jq '.[] | .login')
        repos+=$(for org in $orgs; do gh repo list "$org" --limit $MAX_REPOS; done)
    fi

    echo "$repos" | cut -f1 | eval fzf "$FZF_FLAGS" | xargs -I {} gh repo view --web {}
}

# Open current github repository in browser
function ghoc() {
    gh repo view --web &>/dev/null
}

# Extract any type of archive
function extract() {
    if [ -z "$1" ]; then
        echo "Usage: $0 <file>"
        return 1
    fi

    for f in "$@"; do
        if [ ! -f "$f" ]; then
            echo "$f is not a valid file"
            return 2
        fi
    done

    for f in "$@"; do
        case "$f" in
            *.tar.bz2 | *.tbz2) tar xjvf "$f"  ;;
            *.tar.gz | *.tgz)   tar xzvf "$f"  ;;
            *.tar)              tar xvf "$f"   ;;
            *.bz2)              bunzip2 -v "$f";;
            *.rar)              unrar x "$f"   ;;
            *.gz)               gunzip "$f"    ;;
            *.zip)              unzip "$f"     ;;
            *.Z)                uncompress "$f";;
            *.7z)               7z x "$f"      ;;
            *.xz)               xz -d "$f"     ;;
            *)                  echo "$0: can't extract $f: unknown archive format" && return 3;;
        esac
    done
}

# Send 1 free sms per day with Text Belt
function send-sms() {
    if [ $# -ne 2 ]; then
        echo "Usage: $0 <phone_number> <message>"
        return 1
    fi

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
