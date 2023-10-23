" Neovim configuration

set number                            " Show line numbers
set relativenumber                    " Show relative line numbers
set autoindent                        " Enable auto-indentation
set smartindent                       " Enable smart-identation
set smarttab                          " Use smart tabs
set shiftwidth=4                      " Set the number of spaces for auto-indent
set tabstop=4                         " Set the number of spaces for a tab character
set softtabstop=4                     " Set soft tabstop
set expandtab                         " Expand tabs to spaces
set breakindent                       " Enable break indent
set mouse=a                           " Enable mouse support
set encoding=UTF-8                    " UTF-8 byte sequence
set updatetime=200                    " Decrease update time (default 4000 ms)
set timeoutlen=1000                   " mapped sequences time (default 1000 ms)
set nowrap                            " Don't wrap lines
set list listchars=tab:\ \ ,trail:·   " Display tabs and trailing spaces visually
set termguicolors                     " Enable true color support (24 bits)
set whichwrap+=<,>,[,]                " Allows wrap when using arrow keys
set scrolloff=8                       " Minimal number of lines to keep above/bellow the cursor
set signcolumn=yes                    " Keep signcolumn on by default
set completeopt=menuone,noselect      " Better completion experience
set hlsearch                          " Enable search highlighting
set incsearch                         " Enable search patterns highlighting
set undodir=~/.vim/undodir            " Set undo directory
set undofile                          " Enable undo file
set clipboard=unnamed                 " Clipboard (nvim/OS) settings. See `:help 'clipboard'`

" Disable netrw and its plugins
let g:loaded_netrw = 1
let g:loaded_netrwPlugin = 1

" Set leader key as space
let g:mapleader = ' ' 

syntax enable                         " Enable syntax highlighting
