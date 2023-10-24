call plug#begin('~/.config/nvim/plugged')

" Status bar
Plug 'nvim-lualine/lualine.nvim'

" File explorer
Plug 'nvim-tree/nvim-tree.lua'

" UndoTree
Plug 'mbbill/undotree'

" Required by Telescope and Harpoon
Plug 'nvim-lua/plenary.nvim'

" Telescope
Plug 'nvim-telescope/telescope.nvim', { 'branch': '0.1.x' }
Plug 'nvim-telescope/telescope-fzf-native.nvim', { 'do': 'make' }

" Harpoon
Plug 'theprimeagen/harpoon'

" Git related plugins
Plug 'tpope/vim-fugitive'
Plug 'tpope/vim-rhubarb'

" LSP related plugins
Plug 'neovim/nvim-lspconfig'
Plug 'williamboman/mason.nvim'
Plug 'williamboman/mason-lspconfig.nvim'

" LSP Standalone UI
Plug 'j-hui/fidget.nvim', { 'tag': 'legacy' }

" Auto completion
Plug 'hrsh7th/cmp-nvim-lsp'
Plug 'hrsh7th/cmp-buffer'
Plug 'hrsh7th/cmp-path'
Plug 'hrsh7th/cmp-cmdline'
Plug 'hrsh7th/nvim-cmp'

" Snippets
Plug 'hrsh7th/cmp-vsnip'
Plug 'hrsh7th/vim-vsnip'

" Treesitter (syntax highlighting)
Plug 'nvim-treesitter/nvim-treesitter', {'do': ':TSUpdate'}
Plug 'nvim-treesitter/nvim-treesitter-textobjects'

" ALE (syntax error highlighting)
Plug 'dense-analysis/ale'

" Copilot
Plug 'zbirenbaum/copilot.lua'

" Commenting
Plug 'tpope/vim-commentary'

" Add indentation guides
Plug 'lukas-reineke/indent-blankline.nvim'

" Colorizer (highlight and display color codes)
Plug 'norcalli/nvim-colorizer.lua'

" Markdown preview
Plug 'iamcco/markdown-preview.nvim', { 'do': 'cd app && npx --yes yarn install' }

" Catppuccin theme
Plug 'catppuccin/nvim', { 'as': 'catppuccin' }

" One Dark theme
Plug 'navarasu/onedark.nvim'

" Developer Icons
Plug 'nvim-tree/nvim-web-devicons'

" Train vim muscle memory (delete this later)
Plug 'theprimeagen/vim-be-good'

call plug#end()

" Config plugins
source ~/.config/nvim/plugin_config/lualine.lua
source ~/.config/nvim/plugin_config/nvim-tree.lua
source ~/.config/nvim/plugin_config/lsp.lua
source ~/.config/nvim/plugin_config/copilot.lua
source ~/.config/nvim/plugin_config/treesitter.lua
source ~/.config/nvim/plugin_config/indent-blankline.lua
source ~/.config/nvim/plugin_config/markdown-preview.vim
source ~/.config/nvim/plugin_config/catppuccin.lua
lua require('telescope').load_extension('fzf')
