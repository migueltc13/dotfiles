#!/bin/bash

# Colors
R='\033[1;31m'  # Red
G='\033[1;32m'  # Green
Y='\033[1;33m'  # Yellow
C='\033[1;36m'  # Cyan
N='\033[0m'  # No Color

# Functions
function check_success() {
    local status=$?
    if [ ! $status -eq 0 ]; then
        echo -e "${R}Last command failed: exit code $status${N}"
        exit $status
    fi
}

# Flags
root=false
for arg in "$@"; do
    case $arg in
        --root)
            root=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTION]"
            echo "Install all the packages and config files"
            echo ""
            echo "  --root  force installation as root user"
            echo "  -h      show this help message"
            exit 0
            ;;
        *)
            echo "$0: invalid option -- '$arg'"
            echo "Try '$0 --help' for more information."
            exit 1
            ;;
    esac
done

# Check if user is root
if [ "$(id -u)" -eq 0 ] && [ "$root" == "false" ]; then
    echo "$0: Do not run as root or use --root option. Exiting..."
    exit 1
fi

# Check current directory
if [ "$(basename "$(pwd)")" != "dotfiles" ]; then
    echo "$0: Run in \"dotfiles\" directory. Exiting..."
    exit 2
fi

# Check connection to internet
if ! ping -c 1 google.com &>/dev/null; then
    echo -e "${R}No internet connection. Exiting...${N}"
    exit 3
fi

# Update and upgrade system
echo -e "${G}Updating and upgrading system using apt...${N}"
sudo apt update -y &>/dev/null && sudo apt upgrade -y &>/dev/null
check_success

# Requirements: git, curl, wget
echo -e "${G}Installing git, curl and wget...${N}"
sudo apt install -y git curl wget &>/dev/null
check_success

# create .config directory
if [ ! -d "$HOME"/.config ]; then
    mkdir -p "$HOME"/.config
fi

# Install apt packages
read -r -s -n 1 -p "Do you want to install apt packages? [y/(l)ite/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    echo -e "\n${G}Installing apt packages...${N}"
    sudo apt install -y $(cat packages/apt.txt) &>/dev/null
    check_success
elif [[ "$choice" =~ [lL] ]]; then
    echo -e "\n${G}Installing apt packages (lite)...${N}"
    sudo apt install -y $(cat packages/apt-lite.txt) &>/dev/null
    check_success
else
    echo -e "\n${R}Apt packages were not installed.${N}"
fi

# Install snap packages
read -r -s -n 1 -p "Do you want to install snap packages? [y/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    if ! command -v snap &> /dev/null; then
        echo -e "\n${G}Couldn't find snap. Installing it...${N}"
        sudo apt install -y snap snapd &>/dev/null
        check_success
    fi
    echo -e "\n${G}Installing snap packages...${N}"
    while IFS= read -r pkg; do
        if ! sudo snap install "$pkg"; then
            sudo snap install --classic "$pkg"
        fi
    done < packages/snap.txt &>/dev/null
    check_success
else
    echo -e "\n${R}Snap packages were not installed.${N}"
fi

# Install pip packages
read -r -s -n 1 -p "Do you want to install pip packages? [y/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    if ! command -v pip &> /dev/null; then
        echo -e "\n${G}Couldn't find pip. Installing it...${N}"
        sudo apt install -y python3-pip &>/dev/null
        check_success
    fi
    echo -e "\n${G}Installing pip packages...${N}"
    pip install -r packages/pip.txt &>/dev/null
    check_success
else
    echo -e "\n${R}Pip packages were not installed.${N}"
fi

# Copy bash config files
echo -e "${Y}WARNING${N}: This will overwrite your current bash config files."
echo -e "${C}INFO${N}: Make sure you make a backup now"
read -r -s -n 1 -p "Do you want to copy bash config files? [y/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    echo -e "\n${G}Copying bash config files...${N}"
    cp .bashrc "$HOME"
    # ask if user wants to copy .bash_prompt
    read -r -s -n 1 -p "Do you want to copy .bash_prompt? [y/N] " choice
    if [[ "$choice" =~ [yY] ]]; then
        echo -e "\n${G}Copying .bash_prompt...${N}"
        cp .bash_prompt "$HOME"
    else
        echo -e "\n${R}.bash_prompt was not copied.${N}"
    fi
    cp .bash_colors "$HOME"
    cp .bash_aliases "$HOME"
    cp .bash_functions "$HOME"
    # ask if user wants to copy .bash_keybindings
    read -r -s -n 1 -p "Do you want to copy .bash_keybindings? [y/N] " choice
    if [[ "$choice" =~ [yY] ]]; then
        echo -e "\n${G}Copying .bash_keybindings...${N}"
        cp .bash_keybindings "$HOME"
    else
        echo -e "\n${R}.bash_keybindings was not copied.${N}"
    fi
    # ask if user wants to copy .bash_copilot_cli
    read -r -s -n 1 -p "Do you want to copy .bash_copilot_cli? [y/N] " choice
    if [[ "$choice" =~ [yY] ]]; then
        echo -e "\n${G}Copying .bash_copilot_cli...${N}"
        cp .bash_copilot_cli "$HOME"
        read -r -s -n 1 -p "Do you want to install copilot cli? [y/N] " choice
        if [[ "$choice" =~ [yY] ]]; then
            if ! command -v npm &> /dev/null; then
                echo -e "\n${G}Couldn't find npm. Installing it...${N}"
                sudo apt install -y npm &>/dev/null
                check_success
            fi
            echo -e "\n${G}Installing copilot cli...${N}"
            npm install -g @githubnext/github-copilot-cli &>/dev/null
            check_success
        else
            echo -e "\n${R}copilot cli was not installed${N}"
        fi
    else
        echo -e "\n${R}.bash_copilot_cli was not copied.${N}"
    fi
    # ask if user wants to install fzf and copy .bash_fzf
    read -r -s -n 1 -p "Do you want to install fzf? [y/N] " choice
    if [[ "$choice" =~ [yY] ]]; then
        echo -e "\n${G}Installing fzf...${N}"
        git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf &&
            ~/.fzf/install
        echo -e "\n${G}Copying .bash_fzf...${N}"
        cp .bash_fzf "$HOME"
        echo -e "\n${G}Removing .fzf.bash...${N}"
        rm "$HOME"/.fzf.bash
        # Remove the last line of .bashrc if it is the fzf source line recently added
        if [[ "$(tail -n 1 "$HOME"/.bashrc)" == *".fzf.bash"* ]]; then
            echo -e "\n${G}Removing fzf source line from .bashrc...${N}"
            sed -i '$ d' "$HOME"/.bashrc
        fi
    else
        echo -e "\n${R}fzf was not installed${N}"
    fi
    # ask if user wants to install autojump
    read -r -s -n 1 -p "Do you want to install autojump? [y/N] " choice
    if [[ "$choice" =~ [yY] ]]; then
        echo -e "\n${G}Installing autojump requirements...${N}"
        if ! command -v python3 &> /dev/null; then
            echo -e "\n${G}Couldn't find python3. Installing it...${N}"
            sudo apt install -y python3 &>/dev/null
            check_success
        fi
        echo -e "\n${G}Installing autojump...${N}"
        git clone https://github.com/wting/autojump.git ~/autojump_tmp &&
            ~/autojump_tmp/install.py
        rm -rf ~/autojump_tmp
    else
        echo -e "\n${R}autojump was not installed${N}"
    fi
    # ask if user wants to copy .profile
    read -r -s -n 1 -p "Do you want to copy .profile? [y/N] " choice
    if [[ "$choice" =~ [yY] ]]; then
        echo -e "\n${G}Copying .profile...${N}"
        cp .profile "$HOME"
    else
        echo -e "\n${R}.profile was not copied.${N}"
    fi
else
    echo -e "\n${R}Bash config files were not copied.${N}"
fi

# Other config files
echo -e "${Y}WARNING${N}: This will overwrite existing config files."
echo -e "${C}INFO${N}: Make sure you make a backup as you go from now on"
# Git config
read -r -s -n 1 -p "Do you want to copy .gitconfig? [y/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    echo -e "\n${G}Copying .gitconfig...${N}"
    cp .gitconfig "$HOME"
    echo -e "\n${C}INFO${N}: This contains my personal information. Make sure to change it.${N}"
    echo -e "${Y}WARNING${N}: This is using credential helper which stores your github token in plain text."
else
    echo -e "\n${R}.gitconfig was not copied.${N}"
fi

# .nanorc
read -r -s -n 1 -p "Do you want to copy .nanorc? [y/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    echo -e "\n${G}Copying .nanorc...${N}"
    cp .nanorc "$HOME"
else
    echo -e "\n${R}.nanorc was not copied.${N}"
fi

# .Xresources
read -r -s -n 1 -p "Do you want to copy .Xresources? [y/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    echo -e "\n${G}Copying .Xresources...${N}"
    cp .Xresources "$HOME"
else
    echo -e "\n${R}.Xresources was not copied.${N}"
fi

# .tmux.conf
read -r -s -n 1 -p "Do you want to install tmux and configure? [y/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    echo -e "\n${G}Copying .tmux.conf...${N}"
    cp .tmux.conf "$HOME"
    echo -e "\n${G}Installing tmux and plugins...${N}"
    sudo apt install -y tmux &>/dev/null
    check_success
    git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm &&
        ~/.tmux/plugins/tpm/bin/install_plugins
    read -r -s -n 1 -p "Do you want to install gitmux? [y/N] " choice
    if [[ "$choice" =~ [yY] ]]; then
        echo -e "\n${G}Installing gitmux...${N}"
        sudo apt install -y golang-go &>/dev/null
        check_success
        go install github.com/arl/gitmux@latest
        check_success
        cp .config/.gitmux.conf "$HOME"/.config/
    fi
else
    echo -e "\n${R}.tmux.conf was not copied.${N}"
fi

# .config/terminator/config
read -r -s -n 1 -p "Do you want to copy .config/terminator/config? [y/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    echo -e "\n${G}Copying .config/terminator/config...${N}"
    mkdir -p "$HOME"/.config/terminator
    cp .config/terminator/config "$HOME"/.config/terminator
else
    echo -e "\n${R}.config/terminator/config was not copied.${N}"
fi

# .config/bat/
read -r -s -n 1 -p "Do you want to copy .config/bat/? [y/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    echo -e "\n${G}Copying .config/bat/...${N}"
    mkdir -p "$HOME"/.config/bat
    cp -r .config/bat/* "$HOME"/.config/bat
    # build bat cache (require to load custom themes)
    bat cache --build &>/dev/null || batcat cache --build &>/dev/null
    check_success
else
    echo -e "\n${R}.config/bat/ was not copied.${N}"
fi

# .config/btop/
read -r -s -n 1 -p "Do you want to copy .config/btop/? [y/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    echo -e "\n${G}Copying .config/btop/...${N}"
    mkdir -p "$HOME"/.config/btop
    cp -r .config/btop/* "$HOME"/.config/btop
else
    echo -e "\n${R}.config/btop/ was not copied.${N}"
fi

# Neovim appimage
read -r -s -n 1 -p "Do you want to install neovim appimage? [y/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    echo -e "\n${G}Installing neovim appimage dependencies (fuse)...${N}"
    sudo apt install -y fuse &>/dev/null
    check_success
    echo "Versions available:"
    echo " 1) latest stable (recommended)"
    echo " 2) latest nightly"
    echo " 3) v0.9.4"
    read -r -s -n 1 -p "Choose version: " choice
    case $choice in
        1)
            echo -e "\n${G}Installing latest stable neovim appimage...${N}"
            wget -O nvim https://github.com/neovim/neovim/releases/download/stable/nvim.appimage &&
                chmod u+x nvim && sudo mv nvim /usr/local/bin
            ;;
        2)
            echo -e "\n${G}Installing latest nightly neovim appimage...${N}"
            wget -O nvim https://github.com/neovim/neovim/releases/download/nightly/nvim.appimage &&
                chmod u+x nvim && sudo mv nvim /usr/local/bin
            ;;
        3)
            echo -e "\n${G}Installing v0.9.4 neovim appimage...${N}"
            wget -O nvim https://github.com/neovim/neovim/releases/download/v0.9.4/nvim.appimage &&
                chmod u+x nvim && sudo mv nvim /usr/local/bin
            ;;
        *)
            echo -e "\n${C}Invalid option. Skipping neovim appimage installation.${N}"
            ;;
    esac
else
    echo -e "\n${R}Neovim appimage was not installed.${N}"
fi

# .config/nvim/
read -r -s -n 1 -p "Do you want to copy .config/nvim/? [y/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    echo -e "\n${G}Installing fd-find, ripgrep and shellcheck...${N}"
    sudo apt install -y fd-find ripgrep shellcheck &>/dev/null
    check_success
    echo -e "\n${G}Copying .config/nvim/...${N}"
    rm -rf "$HOME"/.config/nvim
    cp -r .config/nvim/ "$HOME"/.config/
    echo -e "${C}INFO${N}: make sure to run :checkhealth in nvim to check for errors"
else
    echo -e "\n${R}.config/nvim/ was not copied.${N}"
fi

# Install nvm for nodejs
read -r -s -n 1 -p "Do you want to install nvm? [y/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    echo -e "\n${G}Installing nvm...${N}"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    echo "After resourcing .bashrc. Install lastest nodejs LTS version with:"
    echo "nvm install --lts && nvm use --lts"
else
    echo -e "\n${R}nvm was not installed.${N}"
    echo -e "${C}INFO${N}: You may want to remove nvm exports from .bashrc"
fi

# Gnome shell extensions
read -r -s -n 1 -p "Do you want to copy .local/share/gnome-shell/extensions/? [y/N] " choice
if [[ "$choice" =~ [yY] ]]; then
    echo -e "\n${G}Copying .local/share/gnome-shell/extensions/...${N}"
    mkdir -p "$HOME"/.local/share/gnome-shell/extensions
    cp -r .local/share/gnome-shell/extensions/* "$HOME"/.local/share/gnome-shell/extensions
else
    echo -e "\n${R}.local/share/gnome-shell/extensions/ was not copied.${N}"
fi
echo -e "${C}INFO${N}: manually enable extensions in gnome-shell-extensions${N}"
# TODO save my current extensions settings into a file

# Fonts
echo -e "${C}INFO${N}: manually install fonts into your system (fonts/)"

# Wallpapers
echo -e "${C}INFO${N}: manually copy wallpapers into your system (Pictures/Wallpapers/)"

# Animations
echo -e "${C}INFO${N}: manually copy script animations into your system (Animations/)"

# usr/local/bin
echo -e "${C}INFO${N}: manually copy scripts into your system (usr/local/bin/)"

# usr/share/applications and icons
echo -e "${C}INFO${N}: manually copy .desktop files into your system (usr/share/applications/)"
echo -e "${C}INFO${N}: manually copy icons into your system (usr/share/icons/)"
echo -e "${C}INFO${N}: manually run: ${G}\$ sudo update-desktop-database${N}"

# usr/lib/command-not-found
echo -e "${C}INFO${N}: manually copy usr/lib/command-not-found to enable it"
