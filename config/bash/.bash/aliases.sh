# shellcheck disable=SC2154
# SC2154: Variable "line" is referenced but not assigned. At copylast

# shell aliases
alias :r='source ~/.bashrc'
alias :q='exit'

# ls aliases
alias ls='lsd'
alias ll='ls -alF'
alias l='ls -lF'
alias tree='lsd --tree'

# Shortcuts for Navigation
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias .....='cd ../../../..'
alias ......='cd ../../../../..'

# Tools
alias t='tmux a || tmux'                                    # Attach to tmux session or create a new one
alias lll='ranger'                                          # Ranger visual file manager
alias ncdu='ncdu -q --color=dark'                           # NCurses Disk Usage
alias xclip='xclip -i -selection clipboard'                 # Copy to clipboard with xclip
alias r2='radare2'                                          # Radare2
alias wfuzz='wfuzz -c'                                      # Specify color output for wfuzz
alias ghidra='/opt/ghidra/ghidraRun'                        # Ghidra
alias sqlmap='python3 /opt/sqlmap/sqlmap.py'                # Launch sqlmap
alias my-ip='curl ifconfig.me'                              # Get public IP address
alias ipinfo='curl ipinfo.io'                               # Get public IP address and location
alias john='/opt/john/run/john'                             # John the ripper
alias ssh2john='python3 /opt/john/run/ssh2john.py'          # Run ssh2john
alias stegsolve='java -jar /opt/stegsolve.jar'              # Analyze images in different planes by taking off bits
alias rustscan='sudo docker run -it --rm --name rustscan rustscan/rustscan:2.1.1'
alias openbullet2='sudo docker run --name openbullet2 --rm -p 8069:5000 -v ~/Git/OB2/UserData:/app/UserData/ -it openbullet/openbullet2:latest'

# OSINT tools
alias theHarvester='py /opt/theHarvester/theHarvester.py'   # Harvest info
alias sublist3r='py /opt/Sublist3r/sublist3r.py'            # Enumerate subdomains
alias sherlock='py /opt/sherlock/sherlock'                  # Find social media accounts by username
alias whatbreach='py /opt/WhatBreach/whatbreach.py'         # Find breached emails, databases, pastes, and relevant info

# Programing Shortcuts
alias py='python3'
alias python='python3'
alias venv='python -m venv venv'                            # Create a Python virtual environment
alias activate='source venv/bin/activate'                   # Activate a virtual environment
alias gcc='gcc -Wall -Wextra'                               # Use stricter warning flags with gcc
alias cpp='g++ -Wall -Wextra'                               # Use stricter warning flags with g++
alias grind='valgrind --leak-check=full --show-leak-kinds=all'  # Check for memory leaks with Valgrind

# Git Shortcuts
alias g='git'
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias 'gc!'='git commit --amend'
alias gd='git diff'
alias gdc='git diff --cached'
alias gds='git diff --staged'
alias gl='git log'
alias gp='git pull'
alias gpush='git push'
alias gundo='git reset --soft HEAD^'                        # undo the last commit (keep changes)
alias lg='lazygit'

# Package Management
alias update='sudo apt update -y && sudo apt upgrade -y && sudo apt autoremove -y'
alias install='sudo apt install -y'
alias remove='sudo apt remove -y'
alias search='apt search'
alias refresh='sudo snap refresh'

# Process Management
alias psa='ps aux'                                          # List all processes
alias psg='ps aux | grep -v "grep" | grep'                  # Search for a specific process
alias pscpu='ps aux --sort=-%cpu'                           # List processes by CPU usage (descending)
alias psmem='ps aux --sort=-%mem'                           # List processes by memory usage (descending)
alias pstop='ps aux --sort=-rss | head -10'                 # List top memory-consuming processes
alias ptree='pstree -p'                                     # View the process tree with PIDs
alias syslog='tail -f /var/log/syslog'                      # Monitor system log in real-time

# Quick References
alias examples='tldr'                                       # Get command examples with tldr
alias datetime="date '+%d-%m-%Y %H:%M:%S'"                  # Get clean date and time
alias alphabet="echo {1..9} {0..9} {0..6} && echo {a..z}"   # Get the alphabet with index numbers

# File Viewing
alias bat='batcat'                                          # View a file with syntax highlighting
alias view='bat'                                            # Shortcut for batcat
alias v='bat'                                               # Shortcut for batcat

# File Editing
alias edit='nvim'                                           # Edit a file with Neovim
alias e='nvim'                                              # Shortcut for Neovim

# Copy last command(s) to clipboard
alias copylast='history | fzf --height=50% --tac --ansi | awk '\''{sub(/^[[:space:]]*[0-9]+[[:space:]]*/, ""); sub(/[[:space:]]*$/, ""); print}'\'' | while IFS= read -r line; do echo "$line"; done | tee >(xclip -sel clipboard)'

# Hacker news on the terminal
alias news='hnterm'

# Edit hosts file (and change ssh host key for target machine)
alias hosts='sudo nano /etc/hosts; ssh-keygen -f "$HOME/.ssh/known_hosts" -R "t";'

# Alert for long running commands. Usage: $ sleep 10; alert
alias alert='notify-send --urgency=critical -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# :)
alias starwars='telnet towel.blinkenlights.nl'

# Project li4
alias li4='ssh-lemonade -t li4'
