" Neovim configuration

set number                            " Show line numbers
set relativenumber                    " Show relative line numbers
set autoindent                        " Enable auto-indentation
set smartindent                       " Enable smart-identation
set smarttab                          " Use smart tabs
set shiftwidth=4                      " Set the number of spaces for auto-indent
set tabstop=4                         " Set the number of spaces for a tab character
set softtabstop=4                     " Set soft tabstop
set expandtab
set mouse=a                           " Enable mouse support
set encoding=UTF-8                    " UTF-8 byte sequence
set updatetime=300                    " Update Time (ms)
set nowrap                            " Don't wrap lines
set list listchars=tab:\ \ ,trail:·   " Display tabs and trailing spaces visually

syntax enable                         " Enable syntax highlighting

" Catppucin theme
source ~/.config/nvim/catppuccin.lua
lua vim.cmd.colorscheme "catppuccin"
