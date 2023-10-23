call plug#begin('~/.config/nvim/plugged')

" Required by Telescope and Harpoon
Plug 'nvim-lua/plenary.nvim'

" Telescope
Plug 'nvim-telescope/telescope.nvim', { 'branch': '0.1.x' }

" Treesitter
Plug 'nvim-treesitter/nvim-treesitter', {'do': ':TSUpdate'}

" Harpoon
Plug 'ThePrimeagen/harpoon'

" Status bar
Plug 'vim-airline/vim-airline'

" Developer Icons
Plug 'ryanoasis/vim-devicons'

" NERDTree for file navigation
Plug 'preservim/nerdtree'

" UndoTree
Plug 'mbbill/undotree'

" Git related plugins
Plug 'tpope/vim-fugitive'
Plug 'tpope/vim-rhubarb'

" LSP related plugins
Plug 'williamboman/mason.nvim'
Plug 'williamboman/mason-lspconfig.nvim'
Plug 'neovim/nvim-lspconfig'

" Auto completion
Plug 'hrsh7th/cmp-nvim-lsp'
Plug 'hrsh7th/cmp-buffer'
Plug 'hrsh7th/cmp-path'
Plug 'hrsh7th/cmp-cmdline'
Plug 'hrsh7th/nvim-cmp'

" Snippets
Plug 'hrsh7th/cmp-vsnip'
Plug 'hrsh7th/vim-vsnip'

" Highlight syntax errors
Plug 'dense-analysis/ale'

" Copilot
Plug 'zbirenbaum/copilot.lua'

" Markdown preview
Plug 'iamcco/markdown-preview.nvim', { 'do': { -> mkdp#util#install() }, 'for': ['markdown', 'vim-plug']}

" Catppuccin theme
Plug 'catppuccin/nvim', { 'as': 'catppuccin' }

call plug#end()

" Config plugins
source ~/.config/nvim/plugin_config/treesitter.lua
source ~/.config/nvim/plugin_config/catppuccin.lua
source ~/.config/nvim/plugin_config/lsp.lua
source ~/.config/nvim/plugin_config/copilot.lua
