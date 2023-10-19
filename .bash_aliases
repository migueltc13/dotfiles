# ls aliases
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

# Programing Shortcuts
alias py='python2'
alias py3='python3'
alias python='python3'
alias venv='python -m venv venv'                            # Create a Python virtual environment
alias activate='source venv/bin/activate'                   # Activate a virtual environment
alias gcc='gcc -Wall -Wextra'                               # Use stricter warning flags with GCC
alias cpp='g++ -Wall -Wextra'                               # Use stricter warning flags with g++

# Git Shortcuts
alias g='git'
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias 'gc!'='git commit --amend'
alias gd='git diff'
alias gl='git log'
alias gp='git pull'
alias gpush='git push'
alias gundo='git reset --soft HEAD^'                        # undo the last commit (keep changes)

# Package Management
alias update='sudo apt update -y && sudo apt upgrade -y'
alias install='sudo apt install -y'
alias search='apt search'

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
alias bat='batcat'
alias view='pygmentize -O style=monokai -g'                 # View a file with syntax highlighting
alias v='view'

# Hacker news on the terminal
alias news='hnterm'

# Edit hosts file and change ssh host key for target
alias hosts='sudo nano /etc/hosts; ssh-keygen -f "/home/z0d1ac/.ssh/known_hosts" -R "t";'
