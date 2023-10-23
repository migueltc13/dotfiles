call plug#begin('~/.config/nvim/plugged')

" Required by Telescope and Harpoon
Plug 'nvim-lua/plenary.nvim'

" Telescope
Plug 'nvim-telescope/telescope.nvim', { 'tag': '0.1.4' }

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

" GitHub Copilot
Plug 'zbirenbaum/copilot.lua'

" LSP related plugins
Plug 'williamboman/mason.nvim'
Plug 'williamboman/mason-lspconfig.nvim'
Plug 'neovim/nvim-lspconfig'

" Highlight syntax errors
Plug 'dense-analysis/ale'

" Vim Terminal
Plug 'tc50cal/vim-terminal'

" Markdown preview
Plug 'iamcco/markdown-preview.nvim', { 'do': { -> mkdp#util#install() }, 'for': ['markdown', 'vim-plug']}

" Catppuccin theme
Plug 'catppuccin/nvim', { 'as': 'catppuccin' }

call plug#end()

" Config plugins
source ~/.config/nvim/plugin_config/lsp_config.lua
source ~/.config/nvim/plugin_config/treesitter.lua
source ~/.config/nvim/plugin_config/catppuccin.lua
source ~/.config/nvim/plugin_config/copilot.lua
