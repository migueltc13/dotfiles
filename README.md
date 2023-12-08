# Dotfiles

## Overview

![overview.gif](.github/img/overview.gif)

This repository contains my personal dotfiles. It is intended to be used on
Debian-based systems, but it should work on other Linux distributions as well.

### Packages

- [apt-packages.txt](apt-packages.txt) - apt packages
- [snap-packages.txt](snap-packages.txt) - snap packages
- [apt-packages-lite.txt](apt-packages-lite.txt) - minimal apt packages
<!-- TODO - [pip-packages.txt](pip-packages.txt) - pip packages -->
<!-- TODO - [npm-packages.txt](npm-packages.txt) - npm packages -->
<!-- TODO - [gem-packages.txt](gem-packages.txt) - gem packages -->
<!-- TODO - [cargo-packages.txt](cargo-packages.txt) - cargo packages -->

### Bash configuration

- [.bashrc](.bashrc) - main bash config file
- [.bash_prompt](.bash_prompt) - bash prompt config
- [.bash_colors](.bash_colors) - bash colors
- [.bash_aliases](.bash_aliases) - bash aliases
- [.bash_functions](.bash_functions) - bash functions
- [.bash_keybindings](.bash_keybindings) - bash keybindings
- [.bash_copilot_cli](.bash_copilot_cli) - copilot cli config
- [.bash_fzf](.bash_fzf) - fzf config
- [.profile](.profile) - bash profile, used for login shells

### Other configuration

- [neovim](.config/nvim/) - neovim config
- [.nanorc](.nanorc) - nano config
- [terminator](.config/terminator/config) - terminator config
- [.Xresources](.Xresources) - xterm config
- [.gitconfig](.gitconfig) - git config

### usr/ directory

<!-- TODO add some scripts to .gitignore -->
<!-- TODO enhance usr/local/lib/command-not-found script -->
- [bin/](usr/local/bin/) - local scripts
- [share/](usr/local/share/) - applications and respective icons
- [lib/](usr/local/lib/) - command-not-found script (inspired by Kali Linux)

### Gnome shell extensions

Located in [.local/share/gnome-shell/extensions/]().

- [activities-text@z0d1ac](.local/share/gnome-shell/extensions/activities-text@z0d1ac)
- [blur-my-shell@aunetx](.local/share/gnome-shell/extensions/blur-my-shell@aunetx)
- [clipboard-indicator@tudmotu.com](.local/share/gnome-shell/extensions/clipboard-indicator@tudmotu.com)
- [CoverflowAltTab@palatis.blogspot.com](.local/share/gnome-shell/extensions/CoverflowAltTab@palatis.blogspot.com)
- [custom-accent-colors@demiskp](.local/share/gnome-shell/extensions/custom-accent-colors@demiskp)
- [gsconnect@andyholmes.github.io](.local/share/gnome-shell/extensions/gsconnect@andyholmes.github.io)
- [hidetopbar@mathieu.bidon.ca](.local/share/gnome-shell/extensions/hidetopbar@mathieu.bidon.ca)
- [lockkeys@fawtytoo](.local/share/gnome-shell/extensions/lockkeys@fawtytoo)

### Wallpapers

Located in [Pictures/Wallpapers/]().

- [wallpaper.sh](Pictures/Wallpapers/wallpaper.sh) - script to randomly change wallpaper, used within a cron job
- [wallpaper.log](Pictures/Wallpapers/wallpaper.log) - log file for `wallpaper.sh` output
- [wallpaper.png](Pictures/Wallpapers/wallpaper.png) - current wallpaper symlinked

Cron job example:

```bash
# m h   dom mon dow  command
0 * * * *   $HOME/Pictures/Wallpapers/wallpaper.sh &> $HOME/Wallpapers/wallpaper.log
```

### Terminal ascii animations

Located in [Animations/](Animations/).

### Fonts

Located in [fonts/](fonts/).

- [Hack](fonts/Hack.zip) - Hack font
- [Nerd Fonts Symbols](fonts/NerdFontsSymbolsOnly.zip) - Nerd Fonts symbols only

## Installation

Interactive installation with [./install.sh](./install.sh) script.

## Update

Update with [./check_changes.sh](./check_changes.sh) script.
