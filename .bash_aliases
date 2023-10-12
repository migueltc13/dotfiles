# Colors
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

# exa colors
# User and group
export EXA_COLORS="40:uu=35;40;nnn:un=31;40;nnn:gu=35;40;nnn:gn=31;40;nnn"
# File types
export EXA_COLORS="$EXA_COLORS:*.mkv=36:*.mp3=36:*.mp4=36:*.aac=36:*.pdf=34:*.png=33:*.jpeg=33:*.jpg=33:*.o=10:*.c=36"
# Permissions
# TODO
# Date
export EXA_COLORS="$EXA_COLORS:da=37;40;nnn"

# ls
alias ls='exa --group-directories-first --icons'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Shortcuts for Navigation
alias up='cd ..'
alias up2='cd ../..'
alias up3='cd ../../..'
alias up4='cd ../../../..'
alias up5='cd ../../../../..'

# Tools
alias j='autojump'
alias lll='ranger'
alias xclip='xclip -i -selection clipboard'
alias r2='radare2'
alias wfuzz='wfuzz -c'						# Specify color output for wfuzz
alias ghidra='/opt/ghidra/ghidraRun'
alias ipinfo='curl ipinfo.io'					# Get your public IP address and location
alias rustscan='sudo docker run -it --rm --name rustscan rustscan/rustscan:2.1.1'
alias openbullet2='sudo docker run --name openbullet2 --rm -p 8069:5000 -v ~/Git/OB2/UserData:/app/UserData/ -it openbullet/openbullet2:latest'

# Programing Shortcuts
alias py='python2'
alias py3='python3'
alias python='python3'
alias venv='python -m venv venv'				# Create a Python virtual environment
alias activate='source venv/bin/activate'			# Activate a virtual environment
alias gcc='gcc -Wall -Wextra'					# Use stricter warning flags with GCC
alias cpp='g++ -Wall -Wextra'					# Use stricter warning flags with g++

# Git Shortcuts
alias g='git'
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias gd='git diff'
alias gp='git pull'
alias gpush='git push'

# Package Management
alias update='sudo apt update -y && sudo apt upgrade -y'
alias install='sudo apt install -y'
alias search='apt search'

# Process Management
alias psa='ps aux'						# List all processes
alias psg='ps aux | grep -v "grep" | grep'			# Search for a specific process
alias pscpu='ps aux --sort=-%cpu'				# List processes by CPU usage (descending)
alias psmem='ps aux --sort=-%mem'				# List processes by memory usage (descending)
alias pstop='ps aux --sort=-rss | head -10'			# List top memory-consuming processes
alias ptree='pstree -p'						# View the process tree with PIDs
alias syslog='tail -f /var/log/syslog'				# Monitor system log in real-time

# Quick References
alias datetime="date '+%Y-%m-%d %H:%M:%S'"
alias alphabet="echo {1..9} {0..9} {0..6} && echo {a..z}"

# File Viewing
alias view='pygmentize -O style=monokai -g'			# View a file with syntax highlighting
alias v='view'

##
# Others
##

# Hacker news on the terminal
alias news='hnterm'

# Edit hosts file and change ssh host key for target
alias hosts='sudo nano /etc/hosts && ssh-keygen -f "/home/z0d1ac/.ssh/known_hosts" -R "t" #'
