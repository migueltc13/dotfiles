local keymap = vim.api.nvim_set_keymap
local opts = { noremap = true, silent = true }
local function desc(description)
    opts.desc = description
    return opts
end

-- Telescope
keymap('n', '<leader>ff', ':Telescope find_files\n', desc('Telescope: find files'))
keymap('n', '<leader>fg', ':Telescope live_grep\n',  desc('Telescope: live grep files'))
keymap('n', '<leader>fb', ':Telescope buffers\n',    desc('Telescope: find buffers'))
keymap('n', '<leader>fh', ':Telescope help_tags\n',  desc('Telescope: find help tags'))

-- Harpoon
keymap('n', '<leader>e', ':lua require("harpoon.ui").toggle_quick_menu()\n', desc('Harpoon: toggle quick menu'))
keymap('n', '<leader>a', ':lua require("harpoon.mark").add_file()\n',        desc('Harpoon: add file'))
keymap('n', '<leader>1', ':lua require("harpoon.ui").nav_file(1)\n',         desc('Harpoon: navigate to file 1'))
keymap('n', '<leader>2', ':lua require("harpoon.ui").nav_file(2)\n',         desc('Harpoon: navigate to file 2'))
keymap('n', '<leader>3', ':lua require("harpoon.ui").nav_file(3)\n',         desc('Harpoon: navigate to file 3'))
keymap('n', '<leader>4', ':lua require("harpoon.ui").nav_file(4)\n',         desc('Harpoon: navigate to file 4'))

-- LSP
_G.on_attach = function(...)
    keymap('n', 'K',          ':lua vim.lsp.buf.hover()\n',           desc('LSP: Show documentation'))
    keymap('n', 'gd',         ':lua vim.lsp.buf.definition()\n',      desc('LSP: Go to definition'))
    keymap('n', 'gD',         ':lua vim.lsp.buf.declaration()\n',     desc('LSP: Go to declaration'))
    keymap('n', 'gi',         ':lua vim.lsp.buf.implementation()\n',  desc('LSP: Go to implementation'))
    keymap('n', 'gt',         ':lua vim.lsp.buf.type_definition()\n', desc('LSP: Go to type definition'))
    keymap('n', 'gr',         ':Telescope lsp_references\n',          desc('LSP: Show references'))
    keymap('n', 'gs',         ':lua vim.lsp.buf.signature_help()\n',  desc('LSP: Show signature help'))
    keymap('n', '<leader>rn', ':lua vim.lsp.buf.rename()\n',          desc('LSP: Smart rename'))
    keymap('n', '<leader>ca', ':lua vim.lsp.buf.code_action()\n',     desc('LSP: Code action'))
    keymap('n', '<leader>rs', ':LspRestart\n',                        desc('LSP: Restart language server'))
    keymap('n', '<leader>d',  ':lua vim.diagnostic.open_float()\n',   desc('LSP: Show diagnostics for line'))
    keymap('n', '<leader>D',  ':Telescope diagnostics bufnr=0\n',     desc('LSP: Show diagnostics for buffer'))
    keymap('n', '[d',         ':lua vim.diagnostic.goto_prev()\n',    desc('LSP: Go to previous diagnostic'))
    keymap('n', ']d',         ':lua vim.diagnostic.goto_next()\n',    desc('LSP: Go to next diagnostic'))
end

-- Nvim-Tree
keymap('n', '<C-n>', ':NvimTreeOpen\n',   desc('Nvim-Tree: open'))
keymap('n', '<C-f>', ':NvimTreeFocus\n',  desc('Nvim-Tree: focus'))
keymap('n', '<C-t>', ':NvimTreeToggle\n', desc('Nvim-Tree: toggle'))

-- UndoTree
keymap('n', '<leader>u', ':UndotreeToggle\n', desc('UndoTree: toggle'))

-- Vim-fugitive
keymap('n', '<leader>gs', ':Git\n', desc('Vim-fugitive: open git'))

-- Vim-maximizer
keymap('n', '<leader>m', ':MaximizerToggle\n', desc('Vim-maximizer: toggle'))

-- Other plugins keymaps definitions
-- lua/plugins/copilot.lua
-- lua/plugins/nvim-cmp.lua
-- lua/plugins/nvim-tree.lua
-- lua/plugins/telescope.lua
-- lua/plugins/treesitter.lua
-- lua/plugins/treesitter-text-objects.lua

-- Copy to the system clipboard (Ctrl + Shift + C)
keymap('n', '<C-C>', '"+y', desc('Copy to system clipboard'))
keymap('v', '<C-C>', '"+y', desc('Copy to system clipboard'))

-- Allow moving selected line(s) of text
keymap('v', 'J', ':m \'>+1\ngv=gv', desc('Move selected line(s) down'))
keymap('v', 'K', ':m \'<-2\ngv=gv', desc('Move selected line(s) up'))

-- Keep cursor centered when paging up/down
keymap('n', '<C-d>', '<C-d>zz', opts)
keymap('n', '<C-u>', '<C-u>zz', opts)

-- Keep cursor centered when searching
keymap('n', 'n', 'nzzzv', opts)
keymap('n', 'N', 'Nzzzv', opts)
