" Telescope
nnoremap <leader>ff :Telescope find_files<cr>
nnoremap <leader>fg :Telescope live_grep<cr>
nnoremap <leader>fb :Telescope buffers<cr>
nnoremap <leader>fh :Telescope help_tags<cr>

" Harpoon
nnoremap <leader>a :lua require("harpoon.mark").add_file()<CR>
nnoremap <leader>e :lua require("harpoon.ui").toggle_quick_menu()<CR>
nnoremap <leader>1 :lua require("harpoon.ui").nav_file(1)<CR>
nnoremap <leader>2 :lua require("harpoon.ui").nav_file(2)<CR>
nnoremap <leader>3 :lua require("harpoon.ui").nav_file(3)<CR>
nnoremap <leader>4 :lua require("harpoon.ui").nav_file(4)<CR>

" LSP
lua << EOF
function on_attach(...)
    vim.keymap.set('n', '<leader>rn', vim.lsp.buf.rename())
    vim.keymap.set('n', '<leader>ca', vim.lsp.buf.code_action())
    vim.keymap.set('n', 'gd', vim.lsp.buf.definition())
    vim.keymap.set('n', 'gD', vim.lsp.buf.declaration())
    vim.keymap.set('n', 'gi', vim.lsp.buf.implementation())
    vim.keymap.set('n', 'gr', require('telescope.builtin').lsp_references())
    vim.keymap.set('n', 'K', vim.lsp.buf.hover())
end

-- Set on_attach as a global variable (Note: used in plugins_config/lsp.lua)
_G.on_attach = on_attach
EOF

" NERDTree
nnoremap <C-n> :NERDTree<CR>
nnoremap <C-f> :NERDTreeFocus<CR>
nnoremap <C-t> :NERDTreeToggle<CR>

" UndoTree
nnoremap <leader>u :UndotreeToggle<CR>

" Vim-fugitive
nnoremap <leader>gs :Git<CR>

" Copy to the system clipboard (Ctrl+Shift+C)
nnoremap <C-C> "+y
vnoremap <C-C> "+y

" Allow moving selected line(s) of text
vnoremap J :m '>+1<CR>gv=gv
vnoremap K :m '<-2<CR>gv=gv

" Keep cursor centered when paging up/down
nnoremap <C-d> <C-d>zz
nnoremap <C-u> <C-u>zz

" Keep cursor centered when searching
nnoremap n nzzzv
nnoremap N Nzzzv
