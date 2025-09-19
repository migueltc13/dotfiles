# shellcheck disable=SC1090,SC1091

# Examples (package: bash-doc):
# /usr/share/doc/bash/examples/startup-files
# /usr/share/doc/bash-doc/examples

# History environment variables
HISTSIZE=8192  # lines
HISTFILESIZE=1048576  # bytes
HISTTIMEFORMAT="%F %T "  # Display timestamps as "YYYY-MM-DD HH:MM:SS"
HISTCONTROL="ignoredups:ignorespace"  # ignore dups and space-prefixed commands
HISTIGNORE="clear:cd:cd -:pwd:exit:logout"  # remove these commands from history

# append to the history file instead of overwriting it
shopt -s histappend

# remove ls commands that don't have any paths from the history
__filter_ls_history() {
    # Save previous HISTTIMEFORMAT
    local prev_hist_time_format="$HISTTIMEFORMAT"

    # Temporarily disable HISTTIMEFORMAT to avoid timestamp
    HISTTIMEFORMAT=""

    # Capture the last command
    local cmd
    cmd="$(history 1 | sed 's/^[ ]*[0-9]\+[ ]*//')"  # Remode line number and leading spaces

    # echo "DEBUG: __filter_ls_history: cmd='$cmd'"

    # Restore previous HISTTIMEFORMAT
    HISTTIMEFORMAT="$prev_hist_time_format"

    # Strip leading/trailing whitespace
    cmd="${cmd#"${cmd%%[![:space:]]*}"}"
    cmd="${cmd%"${cmd##*[![:space:]]}"}"

    # Match: only 'ls', 'll', or 'l' with optional flags (e.g., -l -a -lh), no paths
    if [[ "$cmd" =~ ^(ls|ll|l)([[:space:]]+-[-a-zA-Z]+)*[[:space:]]*$ ]]; then
        # echo "DEBUG: __filter_ls_history: Removing command from history: '$cmd'"

        # Remove it from history (BASH_COMMAND is run *before* it's saved)
        history -d $((HISTCMD-1)) 2>/dev/null
    fi
}

PROMPT_COMMAND="__filter_ls_history;"

# immediately append to the history file (multi session support)
PROMPT_COMMAND+="history -a;history -n;"

# add a empty line after a command
PROMPT_COMMAND+="echo;"

# save OLDPWD to file to restore it when opening a new terminal
PROMPT_COMMAND+="pwd>~/.bash/OLDPWD;"

# load OLDPWD from file
[ -f ~/.bash/OLDPWD ] && OLDPWD=$(cat ~/.bash/OLDPWD)

# disables XON/XOFF flow control as Ctrl-S is being used in bash/keybinds.sh
# https://unix.stackexchange.com/questions/137842/what-is-the-point-of-ctrl-s
# Alternatively rebind the flow control keys with `stty start ^Q` and `stty stop ^S`
stty -ixon

# update the values of LINES and COLUMNS. (window size)
shopt -s checkwinsize

# If set, the pattern "**" used in a pathname expansion context will
# match all files and zero or more directories and subdirectories.
shopt -s globstar

# enable programmable completion features (you don't need to enable
# this, if it's already enabled in /etc/bash.bashrc and /etc/profile
# sources /etc/bash.bashrc).
if ! shopt -oq posix; then
    if [ -f /usr/share/bash-completion/bash_completion ]; then
        . /usr/share/bash-completion/bash_completion
    elif [ -f /etc/bash_completion ]; then
        . /etc/bash_completion
    fi
fi

# Set DBUS session address. Solves issues with some GUI apps when started
# from terminal (e.g., gnome-calculator, nautilus, etc.)
# export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/$UID/bus"

# default editor
export EDITOR=nvim

# less pager
export LESS='-R --mouse'

# Set PATH to a clean state and append standard directories
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Append custom directories to PATH
export PATH+=":$HOME/.local/bin"
export PATH+=":$HOME/scripts"
export PATH+=":$HOME/.bash/bin"
export PATH+=":$HOME/.cargo/bin"
export PATH+=":$HOME/.ghcup/bin"
export PATH+=":$HOME/go/bin"
export PATH+=":/usr/games"
export PATH+=":/snap/bin"

# Prepend nvm Node.js directory to PATH
export NVM_DIR="$HOME/.nvm"
if [ -d "$NVM_DIR/versions/node" ]; then
    latest_node=$(printf "%s\n" "$NVM_DIR"/versions/node/v*/ | xargs -n1 basename | sort -V | tail -n1)
    if [ -n "$latest_node" ]; then
        export PATH="$NVM_DIR/versions/node/$latest_node/bin:$PATH"
    fi
fi

# Lazy load nvm
export IS_NVM_LOADED=false
nvm() {
    if [ "$IS_NVM_LOADED" = false ] && [ -s "$NVM_DIR/nvm.sh" ]; then
        source "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && source "$NVM_DIR/bash_completion"
        export IS_NVM_LOADED=true
        nvm "$@"
    else
        echo "nvm is not installed or not found in $NVM_DIR"
        return 1
    fi
}

# Skip perl5 setup
# if command -v perl &> /dev/null && [ -d "$HOME/perl5" ]; then
#     export PATH="$HOME/perl5/bin${PATH:+:${PATH}}"
#     export PERL5LIB="$HOME/perl5/lib/perl5${PERL5LIB:+:${PERL5LIB}}"
#     export PERL_LOCAL_LIB_ROOT="$HOME/perl5${PERL_LOCAL_LIB_ROOT:+:${PERL_LOCAL_LIB_ROOT}}"
#     export PERL_MB_OPT="--install_base \"$HOME/perl5\""
#     export PERL_MM_OPT="INSTALL_BASE=$HOME/perl5"
# fi

# make less more friendly for non-text input files, see lesspipe(1)
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# source files
[ -f ~/.bash/prompt.sh ]                     && source ~/.bash/prompt.sh
[ -f ~/.bash/colors.sh ]                     && source ~/.bash/colors.sh
[ -f ~/.bash/aliases.sh ]                    && source ~/.bash/aliases.sh
[ -f ~/.bash/functions.sh ]                  && source ~/.bash/functions.sh
[ -f ~/.bash/keybinds.sh ]                   && source ~/.bash/keybinds.sh
[ -f ~/.bash/custom.sh ]                     && source ~/.bash/custom.sh
[ -f ~/.bash/copilot_cli.sh ]                && source ~/.bash/copilot_cli.sh
[ -f ~/.bash/fzf.sh ]                        && source ~/.bash/fzf.sh
[ -f ~/.bash/fzf-git.sh ]                    && source ~/.bash/fzf-git.sh
[ -f ~/.bash/secrets.sh ]                    && source ~/.bash/secrets.sh
[ -f ~/.autojump/etc/profile.d/autojump.sh ] && source ~/.autojump/etc/profile.d/autojump.sh
