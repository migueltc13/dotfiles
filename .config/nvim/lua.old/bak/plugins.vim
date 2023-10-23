call plug#begin('~/.config/nvim/plugged')

" NERDTree for file navigation
Plug 'preservim/nerdtree'

" Status bar
Plug 'vim-airline/vim-airline'

" TODO
Plug 'tpope/vim-fugitive'

" TODO
Plug 'junegunn/fzf'

" Highlight syntax errors
Plug 'dense-analysis/ale'

" Vim Terminal
Plug 'tc50cal/vim-terminal'

" Developer Icons
Plug 'ryanoasis/vim-devicons'

" Auto Completion
"Plug 'neoclide/coc.nvim', {'branch': 'master', 'do': 'npm ci'}

" Markdown preview
Plug 'iamcco/markdown-preview.nvim', { 'do': { -> mkdp#util#install() }, 'for': ['markdown', 'vim-plug']}

" Catppuccin theme
Plug 'catppuccin/nvim', { 'as': 'catppuccin' }

call plug#end()
