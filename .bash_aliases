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
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias gp='git pull'
alias gd='git diff'
alias gpush='git push'
gac() {
    git add $@ && git commit -m "Add $@"
}

# Package Management
alias update='sudo apt update -y && sudo apt upgrade -y'
alias install='sudo apt install -y'
alias search='apt search'

# Directory Operations
alias ls='ls --color=auto --group-directories-first -v'
mcd() {
    mkdir "$1" && cd "$1"
}

# Compression and Decompression
alias untar='tar -xvf'						# Extract .tar.* files

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

# Basic Calculator
calc() {
    echo "$@" | bc -l
}

# Others
alias news='hnterm'						# Hacker news on the terminal
alias hosts='sudo nano /etc/hosts'				# Edit hosts file
