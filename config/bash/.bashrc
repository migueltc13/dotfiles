# Examples (package: bash-doc):
# /usr/share/doc/bash/examples/startup-files
# /usr/share/doc/bash-doc/examples

# history size (number of lines)
HISTSIZE=10000
HISTFILESIZE=10000
# don't put duplicate lines
HISTCONTROL=ignoredups
# append to the history file, don't overwrite it
shopt -s histappend
# immediately append to the history file
PROMPT_COMMAND="history -a;history -n;"

# add a empty line after a command
PROMPT_COMMAND+="echo;"

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

# make less more friendly for non-text input files, see lesspipe(1)
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# prompt definitions
[ -f ~/.bash/prompt.sh ] && source ~/.bash/prompt.sh

# colors definitions
[ -f ~/.bash/colors.sh ] && source ~/.bash/colors.sh

# aliases definitions
[ -f ~/.bash/aliases.sh ] && source ~/.bash/aliases.sh

# functions definitions
[ -f ~/.bash/functions.sh ] && source ~/.bash/functions.sh

# keybinds definitions
[ -f ~/.bash/keybindings.sh ] && source ~/.bash/keybindings.sh

# custom definitions
[ -f ~/.bash/custom.sh ] && source ~/.bash/custom.sh

# copilot cli definitions
[ -f ~/.bash/copilot_cli.sh ] && source ~/.bash/copilot_cli.sh

# fzf definitions
[ -f ~/.bash/fzf.sh ] && source ~/.bash/fzf.sh

# autojump definitions
[[ -s $HOME/.autojump/etc/profile.d/autojump.sh ]] && source $HOME/.autojump/etc/profile.d/autojump.sh

# nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && source "$NVM_DIR/bash_completion"

# perl
export PATH="$HOME/perl5/bin${PATH:+:${PATH}}"
export PERL5LIB="$HOME/perl5/lib/perl5${PERL5LIB:+:${PERL5LIB}}"
export PERL_LOCAL_LIB_ROOT="$HOME/perl5${PERL_LOCAL_LIB_ROOT:+:${PERL_LOCAL_LIB_ROOT}}"
export PERL_MB_OPT="--install_base \"$HOME/perl5\""
export PERL_MM_OPT="INSTALL_BASE=$HOME/perl5"

# PATH for local binaries
export PATH="$HOME/.local/bin:$PATH"

# PATH for go binaries
export PATH="$HOME/go/bin:$PATH"

# PATH for custom scripts
export PATH="$HOME/scripts:$PATH"

# Clean duplicate entries in $PATH
export PATH=$(echo -n "$PATH" | tr ':' '\n' | awk '{gsub(/\/$/, "", $0)} !a[$0]++' | paste -sd ':' -)
