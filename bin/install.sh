#!/bin/bash

# Colors
R='\033[1;31m'  # Red
G='\033[1;32m'  # Green
Y='\033[1;33m'  # Yellow
C='\033[1;36m'  # Cyan
N='\033[0m'  # No Color

# Functions
function ask() {
    # Usage: ask <question>
    # Note: default answer is no
    read -r -n 1 -p "$1 [y/N] " choice; echo
    if [[ "$choice" =~ [yY] ]]; then
        return 0
    else
        return 1
    fi
}

function check_success() {
    # Usage: command to check; check_success
    local status=$?
    if [ ! $status -eq 0 ]; then
        echo -e "${R}Last command failed: exit code $status${N}"
        exit $status
    fi
}

function check_command() {
    # Usage: check_command <command> [package(s)]
    # Note: if [package(s)] argument is not provided, defaults to <command>
    if [ -z "$2" ]; then
        local pkg=$1
    else
        local pkg=$2
    fi
    if ! command -v "$1" &>/dev/null; then
        echo -e "${G}Couldn't find $1. Installing it...${N}"
        eval "sudo apt install -y $pkg $debug"
        check_success
    fi
}

# Default values
root=false
debug="&>/dev/null"

# Parse arguments
for arg in "$@"; do
    case $arg in
        -r|--root)
            root=true
            shift
            ;;
        -d|--debug)
            debug=""
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTION]"
            echo "Install all the packages and config files"
            echo ""
            echo "  -r, --root      force installation as root user"
            echo "  -d, --debug     enable debug mode (verbose)"
            echo "  -h, --help      show this help message"
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
if ! eval "ping -4 -c 1 google.com $debug"; then
    echo -e "${R}No internet connection. Exiting...${N}"
    exit 3
fi

# Update and upgrade system
echo -e "${G}Updating and upgrading system using apt...${N}"
eval "sudo apt update -y $debug && sudo apt upgrade -y $debug"
check_success

# Requirements: git, curl, wget
check_command "git"
check_command "curl"
check_command "wget"

# create .config directory
if [ ! -d "$HOME"/.config ]; then
    mkdir -p "$HOME"/.config
fi

### Packages

# Install apt packages
read -r -s -n 1 -p "Do you want to install apt packages? [y/(l)ite/N] " choice; echo
if [[ "$choice" =~ [yY] ]]; then
    echo -e "${G}Installing apt packages...${N}"
    eval "sudo apt install -y $(tr '\n' ' ' < packages/apt.txt) $debug"
    check_success
elif [[ "$choice" =~ [lL] ]]; then
    echo -e "${G}Installing apt packages (lite)...${N}"
    eval "sudo apt install -y $(tr '\n' ' ' < packages/apt-lite.txt) $debug"
    check_success
else
    echo -e "${R}Apt packages were not installed.${N}"
fi

# Install snap packages
if ask "Do you want to install snap packages?"; then
    check_command "snap" "snap snapd"
    echo -e "${G}Installing snap packages...${N}"
    while IFS= read -r pkg; do
        if ! sudo snap install "$pkg"; then
            sudo snap install --classic "$pkg"
        fi
    done < packages/snap.txt &>/dev/null # TODO debug mode
    check_success
else
    echo -e "${R}Snap packages were not installed.${N}"
fi

# Install pip packages
if ask "Do you want to install pip packages?"; then
    check_command "pip" "python3 python3-pip"
    echo -e "${G}Installing pip packages...${N}"
    eval "pip install -r packages/pip.txt $debug"
    check_success
else
    echo -e "${R}Pip packages were not installed.${N}"
fi

### Config files

# Copy bash config files
echo -e "${Y}WARNING${N}: This will overwrite your current bash config files."
echo -e "${C}INFO${N}: Make sure you make a backup now"
if ask "Do you want to copy bash config files?"; then
    mkdir -p "$HOME"/.bash
    echo -e "${G}Copying bash config files...${N}"

    if ask "Do you want to copy .profile?"; then
        echo -e "${G}Copying .profile...${N}"
        cp config/bash/.profile "$HOME"
    else
        echo -e "${R}.profile was not copied.${N}"
    fi

    cp config/bash/.bashrc "$HOME"

    if ask "Do you want to copy .bash/prompt.sh?"; then
        echo -e "${G}Copying .bash/prompt.sh...${N}"
        cp config/bash/.bash/prompt.sh "$HOME/.bash/"
    else
        echo -e "${R}.bash/prompt.sh was not copied.${N}"
    fi

    cp config/bash/.bash/colors.sh "$HOME/.bash/"
    cp config/bash/.bash/aliases.sh "$HOME/.bash/"
    cp config/bash/.bash/functions.sh "$HOME/.bash/"

    if ask "Do you want to copy .bash/keybindings.sh?"; then
        echo -e "${G}Copying .bash/keybindings.sh...${N}"
        cp config/bash/.bash/keybindings.sh "$HOME/.bash/"
    else
        echo -e "${R}.bash/keybindings.sh was not copied.${N}"
    fi

    if ask "Do you want to copy .bash/copilot_cli.sh?"; then
        echo -e "${G}Copying .bash/copilot_cli.sh...${N}"
        cp config/bash/.bash/copilot_cli.sh "$HOME/.bash/"

        if ask "Do you want to install copilot cli?"; then
            check_command "npm"
            echo -e "${G}Installing copilot cli...${N}"
            eval "npm install -g @githubnext/github-copilot-cli $debug"
            check_success
        else
            echo -e "${R}copilot cli was not installed${N}"
        fi
    else
        echo -e "${R}.bash/copilot_cli.sh was not copied.${N}"
    fi

    if ask "Do you want to copy .bash/fzf.sh?"; then
        echo -e "${G}Copying .bash/fzf.sh...${N}"
        cp config/bash/.bash/fzf.sh "$HOME/.bash/"

        if ask "Do you want to install fzf (via git)?"; then
            echo -e "${G}Installing fzf...${N}"
            git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf &&
                ~/.fzf/install ||
                echo -e "${R}fzf installation failed${N}"
            # Remove .fzf.bash if it was installed
            if [ -f "$HOME"/.fzf.bash ]; then
                echo -e "${G}Removing ~/.fzf.bash...${N}"
                rm "$HOME"/.fzf.bash
            fi
            # Remove the last line of .bashrc if it is the fzf source line recently added
            if [[ "$(tail -n 1 "$HOME"/.bashrc)" == *".fzf.bash"* ]]; then
                echo -e "${G}Removing fzf source line from .bashrc...${N}"
                sed -i '$ d' "$HOME"/.bashrc
                # remove the last line if it is empty
                if [[ "$(tail -n 1 "$HOME"/.bashrc)" == "" ]]; then
                    sed -i '$ d' "$HOME"/.bashrc
                fi
            fi
        else
            echo -e "${R}fzf was not installed${N}"
        fi
    else
        echo -e "${R}.bash/fzf.sh was not copied.${N}"
    fi

    if ask "Do you want to install autojump (via git)?"; then
        echo -e "${G}Installing autojump requirements...${N}"
        check_command "python3"
        echo -e "${G}Installing autojump...${N}"
        eval "git clone https://github.com/wting/autojump.git ~/autojump_tmp $debug" &&
            cd ~/autojump_tmp/ &&
            eval "./install.py $debug" &&
            rm -rf ~/autojump_tmp &&
            eval "cd - $debug" ||
            echo -e "${R}autojump installation failed${N}"
    else
        echo -e "${R}autojump was not installed${N}"
    fi

    touch "$HOME"/.bash/custom.sh
else
    echo -e "${R}Bash config files were not copied.${N}"
fi

# Other config files
echo -e "${Y}WARNING${N}: This will overwrite existing config files."
echo -e "${C}INFO${N}: Make sure you make a backup as you go from now on"

# Git config
if ask "Do you want to copy .gitconfig?"; then
    echo -e "${G}Copying .gitconfig...${N}"
    cp config/git/.gitconfig "$HOME"
    echo -e "${C}INFO${N}: This contains my personal information. Make sure to change it.${N}"
    echo -e "${Y}WARNING${N}: This is using credential helper which stores your github token in plain text."
else
    echo -e "${R}.gitconfig was not copied.${N}"
fi

# .nanorc
if ask "Do you want to copy .nanorc?"; then
    echo -e "${G}Copying .nanorc...${N}"
    cp config/nano/.nanorc "$HOME"
else
    echo -e "${R}.nanorc was not copied.${N}"
fi

# .Xresources
if ask "Do you want to copy .Xresources?"; then
    echo -e "${G}Copying .Xresources...${N}"
    cp config/xterm/.Xresources "$HOME"
else
    echo -e "${R}.Xresources was not copied.${N}"
fi

# .tmux.conf
if ask "Do you want to copy .tmux.conf?"; then
    echo -e "${G}Copying .tmux.conf...${N}"
    cp config/tmux/.tmux.conf "$HOME"

    if ask "Do you want to install tmux and plugins?"; then
        echo -e "${G}Installing tmux and plugins...${N}"
        eval "sudo apt install -y tmux $debug"
        check_success
        echo -e "${G}Installing tmux plugins...${N}"
        git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm &&
            ~/.tmux/plugins/tpm/bin/install_plugins
        echo -e "${C}INFO${N}: tmux plugins were installed"
    else
        echo -e "${R}tmux and plugins were not installed.${N}"
    fi

    if ask "Do you want to install gitmux?"; then
        echo -e "${G}Installing gitmux...${N}"
        check_command "go" "golang-go"
        go install github.com/arl/gitmux@latest
        check_success
        echo -e "${C}INFO${N}: gitmux was installed"
        cp config/tmux/.gitmux.conf "$HOME/.config/"
        echo -e "${C}INFO${N}: gitmux config file was copied to ~/.config/.gitmux.conf"
    else
        echo -e "${R}gitmux was not installed.${N}"
    fi
else
    echo -e "${R}.tmux.conf was not copied.${N}"
fi

# config/terminator/config
if ask "Do you want to copy config/terminator/config?"; then
    echo -e "${G}Copying config/terminator/config...${N}"
    mkdir -p "$HOME"/.config/terminator/
    cp config/terminator/config "$HOME"/.config/terminator/
else
    echo -e "${R}config/terminator/config was not copied.${N}"
fi

# config/bat/
if ask "Do you want to copy config/bat/?"; then
    echo -e "${G}Copying config/bat/...${N}"
    mkdir -p "$HOME"/.config/bat/
    cp -r config/bat/* "$HOME"/.config/bat/
    # build bat cache (require to load custom themes)
    eval "bat cache --build $debug || batcat cache --build $debug"
    check_success
else
    echo -e "${R}config/bat/ was not copied.${N}"
fi

# config/btop/
if ask "Do you want to copy config/btop/?"; then
    echo -e "${G}Copying config/btop/...${N}"
    mkdir -p "$HOME"/.config/btop/
    cp -r config/btop/* "$HOME"/.config/btop/
else
    echo -e "${R}config/btop/ was not copied.${N}"
fi

# Neovim appimage
if ask "Do you want to install neovim appimage?"; then
    echo -e "${G}Installing neovim appimage dependencies (fuse)...${N}"
    # NOTE fuse vs fuse3
    eval "sudo apt install -y fuse $debug"
    check_success
    echo "Versions available:"
    echo " 1) latest stable"
    echo " 2) latest nightly"
    echo " 3) v0.9.4"
    read -r -s -n 1 -p "Choose version: " choice; echo
    case $choice in
        1)
            echo -e "${G}Installing latest stable neovim appimage...${N}"
            wget -O nvim https://github.com/neovim/neovim/releases/download/stable/nvim.appimage &&
                chmod u+x nvim && sudo mv nvim /usr/local/bin
            ;;
        2)
            echo -e "${G}Installing latest nightly neovim appimage...${N}"
            wget -O nvim https://github.com/neovim/neovim/releases/download/nightly/nvim.appimage &&
                chmod u+x nvim && sudo mv nvim /usr/local/bin
            ;;
        3)
            echo -e "${G}Installing v0.9.4 neovim appimage...${N}"
            wget -O nvim https://github.com/neovim/neovim/releases/download/v0.9.4/nvim.appimage &&
                chmod u+x nvim && sudo mv nvim /usr/local/bin
            ;;
        *)
            echo -e "${C}Invalid option. Skipping neovim appimage installation.${N}"
            ;;
    esac
else
    echo -e "${R}Neovim appimage was not installed.${N}"
fi

# config/nvim/
if ask "Do you want to copy config/nvim/?"; then
    echo -e "${G}Installing fd-find, ripgrep and shellcheck...${N}"
    eval "sudo apt install -y fd-find ripgrep shellcheck $debug"
    check_success
    echo -e "${G}Copying config/nvim/...${N}"
    rm -rf "$HOME"/.config/nvim/
    cp -r config/nvim/ "$HOME"/.config/
    echo -e "${C}INFO${N}: make sure to run :checkhealth in nvim to check for errors / missing dependencies"
else
    echo -e "${R}config/nvim/ was not copied.${N}"
fi

# Install nvm for nodejs
if ! command -v "nvm" &> /dev/null && ask "Do you want to install nvm?"; then
    echo -e "${G}Installing nvm...${N}"
    # TODO install latest nvm version
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    echo "After resourcing .bashrc. Install lastest nodejs LTS version with:"
    echo "nvm install --lts && nvm use --lts"
else
    echo -e "${R}nvm was not installed.${N}"
    echo -e "${C}INFO${N}: You may want to remove nvm exports from .bashrc"
fi

### Miscellaneous

# Gnome extensions
if ask "Do you want to copy misc/gnome-extensions/"; then
    echo -e "${G}Copying misc/gnome-extensions/...${N}"
    mkdir -p "$HOME"/.local/share/gnome-shell/extensions/
    cp -r misc/gnome-extensions/* "$HOME"/.local/share/gnome-shell/extensions/

    if ask "Do you want to install gnome-shell-extensions?"; then
        echo -e "${G}Installing gnome-shell-extensions...${N}"
        eval "sudo apt install -y gnome-shell-extensions $debug"
        check_success
    else
        echo -e "${R}gnome-shell-extensions was not installed.${N}"
    fi

    if ask "Do you want to import gnome-extensions settings?"; then
        check_command "dconf" "dconf-cli"
        echo -e "${G}Importing gnome-extensions settings...${N}"
        dconf load /org/gnome/shell/extensions/ < config/gnome/extensions/settings.conf
    else
        echo -e "${R}gnome-extensions settings were not imported.${N}"
    fi

    if ask "Do you want to enable gnome-extensions?"; then
        echo -e "${G}Enabling gnome-extensions...${N}"
        dconf load /org/gnome/shell/disabled-extensions/ < config/gnome/extensions/disabled.conf
        dconf load /org/gnome/shell/enabled-extensions/ < config/gnome/extensions/enabled.conf
        echo -e "${C}INFO${N}: re-login to apply changes"
    else
        echo -e "${R}gnome-extensions were not enabled.${N}"
    fi
else
    echo -e "${R}misc/gnome-extensions/ was not copied.${N}"
fi

# Gnome settings
if ask "Do you want to import gnome settings?"; then
    check_command "dconf" "dconf-cli"
    echo -e "${G}Importing gnome settings...${N}"
    dconf load / < config/gnome/settings.conf
else
    echo -e "${R}gnome settings were not imported.${N}"
fi

# Fonts
if ask "Do you want to install nerd fonts?"; then
    echo -e "${G}Copying misc/fonts/...${N}"
    mkdir -p "$HOME"/.local/share/fonts/ &&
        cp misc/fonts/*/* "$HOME"/.local/share/fonts/ &&
        echo -e "${C}Copied fonts to ~/.local/share/fonts/${N}"
    echo -e "${G}Updating font cache...${N}"
    eval "fc-cache -f -v $debug" ||
        echo -e "${R}Couldn't update font cache${N}"
else
    echo -e "${R}Fonts were not installed.${N}"
fi

# Wallpapers
if ask "Do you want to copy wallpapers?"; then
    echo -e "${G}Copying misc/wallpapers/...${N}"
    mkdir -p "$HOME"/Pictures/Wallpapers/ &&
        cp -r misc/wallpapers/* "$HOME"/Pictures/Wallpapers/ &&
        echo -e "${C}Copied wallpapers to ~/Pictures/Wallpapers/${N}"
else
    echo -e "${R}Wallpapers were not copied.${N}"
fi

# Animations
if ask "Do you want to copy ascii animations?"; then
    echo -e "${G}Copying misc/animations/...${N}"
    mkdir -p "$HOME"/Animations/ &&
        cp -r misc/animations/* "$HOME"/Animations/ &&
        echo -e "${C}Copied animations to ~/Animations/${N}"
else
    echo -e "${R}Animations were not copied.${N}"
fi

# /usr/share/applications and /usr/share/icons
# TODO create .desktop.bak files
echo -e "${C}INFO${N}: manually copy .desktop files into your system (misc/applications/ -> /usr/share/applications/)"
echo -e "${C}INFO${N}: manually copy icons into your system (misc/icons/ -> /usr/share/icons/)"
echo -e "${C}INFO${N}: manually run: ${G}\$ sudo update-desktop-database${N}"

# /usr/local/bin
echo -e "${C}INFO${N}: manually copy scripts into your system (misc/bin/)"

# /usr/lib/command-not-found
echo -e "${C}INFO${N}: manually copy misc/command-not-found/command-not-found to /usr/lib/command-not-found"

exit 0
