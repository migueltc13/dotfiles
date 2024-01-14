# set variable identifying the chroot you work in (used in the prompt below)
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

# set a fancy prompt (non-color, unless we know we "want" color)
case "$TERM" in
    xterm-color|*-256color) color_prompt=yes;;
esac

# uncomment for a colored prompt, if the terminal has the capability; turned
# off by default to not distract the user: the focus in a terminal window
# should be on the output of commands, not on the prompt
#force_color_prompt=yes
if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
	# We have color support; assume it's compliant with Ecma-48
	# (ISO/IEC-6429). (Lack of such support is extremely rare, and such
	# a case would tend to support setf rather than setaf.)
	color_prompt=yes
    else
	color_prompt=
    fi
fi

__stopped_jobs() {
    local stopped_jobs
    stopped_jobs=$(jobs -s | cut -c31- | cut -d ' ' -f1 | tac | tr '\n' ' ' | sed 's/.$//')
    if [ -z "$stopped_jobs" ]; then
        return 1
    fi
    printf "⚙ %s" "$stopped_jobs"
    return 0
}

if [ "$color_prompt" = yes ]; then

    _reset="\[\e[0m\]"

    # green theme
    _l="\[\e[0;32m\]"  # line
    _user="\[\e[1;33m\]"
    _time="\[\e[3;38;5;246m\]"
    _path="\[\e[0;33m\]"
    _jobs="\[\e[0;35m\]"

    # purple theme
    # _l="\[\e[0;35m\]"
    # _user="\[\e[1;35m\]"
    # _path="\[\e[38;5;227m\]"

    # commands
    _time_cmd="${_time}\$(date +\"%H:%M:%S\")"
    _git_cmd="\$(__git_ps1 \"\e[3;36m⎇  %s\")"
    _jobs_cmd="${_jobs}\$(__stopped_jobs)"

    # dynamic prompt: error color + git branch + background jobs stack
    set_prompt_color() {
        local status=$?
        case $status in
            0)   # success
                PC="\[\e[0;32m\]";;
            130) # SIGINT
                PC="\[\e[0;33m\]";;
            147 | 148) # SIGTSTP or SIGINT
                PC="\[\e[0;35m\]";;
            *)   # any other error
                PC="\[\e[0;31m\]";;
        esac
        if [ -z "$(__git_ps1)" ]; then
            _gitl=""
        else
            _gitl="${_l}├─┤${_git_cmd}"
        fi
        if [ -z "$(__stopped_jobs)" ]; then
            _jobsl=""
        else
            _jobsl="${_l}├─┤${_jobs_cmd}"
        fi
        PS1="${_l}╭──┤${_user}\u${_l}├─┤${_time_cmd}${_l}├─┤${_path}\w${_gitl}${_jobsl}${_l}│\n${_l}╰─${PC}▶\[\033[00m\] "
        PS1="\[\e]0;\u@\h: \w   \a\]$PS1" # set window title
    }
    export PROMPT_COMMAND="set_prompt_color;$PROMPT_COMMAND"

    # PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '  # default
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt
