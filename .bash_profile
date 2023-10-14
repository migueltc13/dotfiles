##
# Colors
##
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    #alias dir='dir --color=auto'
    #alias vdir='vdir --color=auto'

    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'

    alias diff='diff --color=auto'
fi

# gcc colors
#export GCC_COLORS='error=01;31:warning=01;35:note=01;36:caret=01;32:locus=01:quote=01'

##
# exa settings
##

# user and group
export EXA_COLORS="uu=35:un=31:gu=35:gn=31"
# file types
#export EXA_COLORS="$EXA_COLORS:*.mkv=36:*.mp3=36:*.mp4=36:*.aac=36:*.pdf=34:*.png=33:*.jpeg=33:*.jpg=33>"
# ToDo Permissions
# date
export EXA_COLORS="$EXA_COLORS:da=2;38;5;246"

# icons spacing
export EXA_ICON_SPACING=2
