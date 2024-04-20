# shellcheck disable=SC2155 # Declare and assign separately to avoid masking return values in LS_COLORS

if [ -x /usr/bin/dircolors ]; then
    # test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    # alias ls='ls --color=auto'
    # alias dir='dir --color=auto'
    # alias vdir='vdir --color=auto'

    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
    alias rg='rg --color=auto'

    alias diff='diff --color=auto'
fi

# gcc colors
#export GCC_COLORS='error=01;31:warning=01;35:note=01;36:caret=01;32:locus=01:quote=01'

# ls colors
export LS_COLORS=$(vivid -d "$HOME"/.config/vivid/filetypes.yml  generate "$HOME"/.config/vivid/catppuccin.yml)

# bat theme
export BAT_THEME="Catppuccin-mocha"
