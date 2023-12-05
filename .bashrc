# Examples (package: bash-doc):
# /usr/share/doc/bash/examples/startup-files
# /usr/share/doc/bash-doc/examples

# history size (number of lines)
HISTSIZE=10000
HISTFILESIZE=10000
# don't put duplicate lines
HISTCONTROL=ignoredups
# history time format
#HISTTIMEFORMAT="%d-%m-%Y %T "
# append to the history file, don't overwrite it
shopt -s histappend
# immediately append to the history file
PROMPT_COMMAND="history -a; history -n; "

# add a empty line after a command
PROMPT_COMMAND+="echo; "

# update the values of LINES and COLUMNS. (window size)
shopt -s checkwinsize

# If set, the pattern "**" used in a pathname expansion context will
# match all files and zero or more directories and subdirectories.
# shopt -s globstar

# make less more friendly for non-text input files, see lesspipe(1)
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

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
    # PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
    # PS1='\[\e[0;35m\]╭──┤\[\e[1;35m\]\u\[\e[0;35m\]├─┤\[\e[0;90m\]$(date +"%H:%M:%S")\[\e[0;35m\]├─┤\[\e[1;34m\]\w\[\e[0;35m\]│\[\e[0m\]\n\[\e[0;35m\]╰─\[\e[1;35m\]\$\[\e[0m\] '
    PS1='\[\e[0;32m\]╭──┤\[\e[1;33m\]\u\[\e[0;32m\]├─┤\[\e[0;90m\]$(date +"%H:%M:%S")\[\e[0;32m\]├─┤\[\e\e[38;5;227m\w\[\e[0;32m\]│\[\e[0m\]\n\[\e[0;32m\]╰─\[\e[0;33m\]\$\[\e[0m\] '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt

# If this is an xterm set the title to user@host:dir
case "$TERM" in
xterm*|rxvt*)
    PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\u@\h: \w\a\]$PS1"
    ;;
*)
    ;;
esac

# Add an "alert" alias for long running commands. Use like so:
# sleep 10; alert
alias alert='notify-send --urgency=critical -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# Profile definitions
[ -f ~/.bash_profile ] && source ~/.bash_profile

# Alias definitions
[ -f ~/.bash_aliases ] && source ~/.bash_aliases

# Functions definitions
[ -f ~/.bash_functions ] && source ~/.bash_functions

# fzf definitions
[ -f ~/.fzf.bash ] && source ~/.fzf.bash

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

# Autojump
[[ -s /home/z0d1ac/.autojump/etc/profile.d/autojump.sh ]] && source /home/z0d1ac/.autojump/etc/profile.d/autojump.sh

# Nodejs
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Perl
PATH="/home/z0d1ac/perl5/bin${PATH:+:${PATH}}"; export PATH;
PERL5LIB="/home/z0d1ac/perl5/lib/perl5${PERL5LIB:+:${PERL5LIB}}"; export PERL5LIB;
PERL_LOCAL_LIB_ROOT="/home/z0d1ac/perl5${PERL_LOCAL_LIB_ROOT:+:${PERL_LOCAL_LIB_ROOT}}"; export PERL_LOCAL_LIB_ROOT;
PERL_MB_OPT="--install_base \"/home/z0d1ac/perl5\""; export PERL_MB_OPT;
PERL_MM_OPT="INSTALL_BASE=/home/z0d1ac/perl5"; export PERL_MM_OPT;

# PATH
export PATH="$PATH:/home/z0d1ac/.local/bin/"

# GitHub Copilot cli
#eval "$(github-copilot-cli alias -- "$0")"
  copilot_what-the-shell () {
    TMPFILE=$(mktemp);
    trap 'rm -f $TMPFILE' EXIT;
    if /usr/local/bin/github-copilot-cli what-the-shell "$@" --shellout $TMPFILE; then
      if [ -e "$TMPFILE" ]; then
        FIXED_CMD=$(cat $TMPFILE);
        history -s $(history 1 | cut -d' ' -f4-); history -s "$FIXED_CMD";
        eval "$FIXED_CMD"
      else
        echo "Apologies! Extracting command failed"
      fi
    else
      return 1
    fi
  };
alias '??'='copilot_what-the-shell';

  copilot_git-assist () {
    TMPFILE=$(mktemp);
    trap 'rm -f $TMPFILE' EXIT;
    if /usr/local/bin/github-copilot-cli git-assist "$@" --shellout $TMPFILE; then
      if [ -e "$TMPFILE" ]; then
        FIXED_CMD=$(cat $TMPFILE);
        history -s $(history 1 | cut -d' ' -f4-); history -s "$FIXED_CMD";
        eval "$FIXED_CMD"
      else
        echo "Apologies! Extracting command failed"
      fi
    else
      return 1
    fi
  };
alias 'git?'='copilot_git-assist';

  copilot_gh-assist () {
    TMPFILE=$(mktemp);
    trap 'rm -f $TMPFILE' EXIT;
    if /usr/local/bin/github-copilot-cli gh-assist "$@" --shellout $TMPFILE; then
      if [ -e "$TMPFILE" ]; then
        FIXED_CMD=$(cat $TMPFILE);
        history -s $(history 1 | cut -d' ' -f4-); history -s "$FIXED_CMD";
        eval "$FIXED_CMD"
      else
        echo "Apologies! Extracting command failed"
      fi
    else
      return 1
    fi
  };
alias 'gh?'='copilot_gh-assist';
alias 'wts'='copilot_what-the-shell';
