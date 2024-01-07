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

if [ "$color_prompt" = yes ]; then

    _reset="\[\e[0m\]"

    # green theme
    _l="\[\e[0;32m\]"  # line
    _user="\[\e[1;33m\]"
    _time="\[\e[3;38;5;246m\]"
    _path="\[\e[38;5;227m\]"

    # purple theme
    # _l="\[\e[0;35m\]"
    # _user="\[\e[1;35m\]"

    # commands
    _time_cmd="${_time}\$(date +\"%H:%M:%S\")"
    _git_cmd="\$(__git_ps1 \"\e[3;36m⎇  %s\")"

    # dynamic prompt: error color + git branch
    set_prompt_color() {
        local status=$?
        if [ $status -eq 0 ]; then
            PC="\[\e[0;32m\]";
        else
            if [ $status -eq 130 ]; then
                PC="\[\e[0;33m\]";
            else
                PC="\[\e[0;31m\]";
            fi
        fi
        if [ -z "$(__git_ps1)" ]; then
            _gitl="${_l}│"
        else
            _gitl="${_l}├─┤${_git_cmd}${_l}│"
        fi
        PS1="${_l}╭──┤${_user}\u${_l}├─┤${_time_cmd}${_l}├─┤${_path}\w${_gitl}\n${_l}╰─${PC}▶\[\033[00m\] "
        PS1="\[\e]0;\u@\h: \w   \a\]$PS1" # set window title
    }
    export PROMPT_COMMAND="set_prompt_color;$PROMPT_COMMAND"

    # PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '  # default
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt
