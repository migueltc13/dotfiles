#shellcheck disable=SC2155  # Declare and assign separately to avoid masking return values.

# Switch color themes based on user privileges (root: purple, others: green)
if [ "$EUID" -eq 0 ]; then
    _l="\[\e[0;35m\]"
    _user="\[\e[1;35m\]"
    _time="\[\e[0;38;5;246m\]"
    _path="\[\e[0;34m\]"
    _jobs="\[\e[0;36m\]"
    _host_color="\[\e[0;34m\]"
    _host_separator_color=${_time}
    _git_color="\e[3;92m"
else
    _l="\[\e[0;32m\]"
    _user="\[\e[1;33m\]"
    _time="\[\e[0;38;5;246m\]"
    _path="\[\e[0;33m\]"
    _jobs="\[\e[0;35m\]"
    _host_color="\[\e[0;35m\]"
    _host_separator_color=${_time}
    _git_color="\e[3;36m"
fi

# Colors independent of user privileges
_success=${_l}
_stopped=${_jobs}
_interrupt="\[\e[0;33m\]"
_error="\[\e[0;31m\]"
_reset="\[\e[0m\]"

# Display host "user[@host]"
_show_host=false
_host=""
if [ $_show_host = true ]; then
    _host="${_host_separator_color}@${_host_color}\h"
fi

# Cached values
_prompt_color=""
_prompt_time=""
_cached_git=""
_cached_jobs=""

_build_prompt() {
    # Prompt symbol color
    local status=$?
    case $status in
        0)         _prompt_color=${_success};;   # Success
        130)       _prompt_color=${_interrupt};; # SIGINT
        147 | 148) _prompt_color=${_stopped};;   # SIGTSTP or SIGTTIN
        *)         _prompt_color=${_error};;     # Error
    esac

    # Prompt time
    _prompt_time=$(date +%H:%M:%S)

    # Git branch. Symbols:       ⎇
    local git_part=""
    local branch=$(git symbolic-ref --quiet --short HEAD 2>/dev/null)
    if [ -n "$branch" ]; then
        git_part="${_l}├─┤\[\e[0m\]\[\e[3;36m\] ${branch}"
    fi

    # Python virtual environment. Symbols: 󰌠      
    local venv_part=""
    if [ -n "$VIRTUAL_ENV" ]; then
        venv_part="${_l}├─┤\[\e[0m\]\[\e[3;34m\]󰌠 $(basename "$VIRTUAL_ENV")"
    fi

    # Stopped jobs stack. Symbols:   ⚙    
    local job_part=""
    local jobs=$(jobs -s)
    if [ -n "$jobs" ]; then
        job_part="\[\e[0;35m\]"
        while read -r _ _ jobname _; do
            job_part+=" $jobname"
        done <<< "$jobs"
        job_part="${_l}├─┤${job_part}"
    fi

    PS1="\[\e]0;\u@\h: \w\a\]${_l}╭──┤${_user}\u${_host}${_l}├─┤${_time}${_prompt_time}${_l}├─┤${_path}\w${git_part}${venv_part}${job_part}${_l}│\n${_l}╰─${_prompt_color}▶${_reset} "

    # PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '  # default prompt
}

# NOTE To properly capture the status code of the last command, the
# `the_build_prompt` function must be the first in `PROMPT_COMMAND`.
export PROMPT_COMMAND="_build_prompt;$PROMPT_COMMAND"
