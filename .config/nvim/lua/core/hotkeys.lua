local map = vim.keymap.set
local opts = { noremap = true, silent = true }
local function desc(description)
    opts.desc = description
    return opts
end

-- Telescope
map('n', '<leader>ff', ':Telescope find_files\n', desc('telescope: find files'))
map('n', '<leader>fg', ':Telescope live_grep\n',  desc('telescope: live grep files'))
map('n', '<leader>fb', ':Telescope buffers\n',    desc('telescope: find buffers'))
map('n', '<leader>fh', ':Telescope help_tags\n',  desc('telescope: find help tags'))

-- Harpoon
map('n', '<leader>e', ':lua require("harpoon.ui").toggle_quick_menu()\n', desc('harpoon: toggle quick menu'))
map('n', '<leader>a', ':lua require("harpoon.mark").add_file()\n',        desc('harpoon: add file'))
map('n', '<leader>1', ':lua require("harpoon.ui").nav_file(1)\n',         desc('harpoon: navigate to file 1'))
map('n', '<leader>2', ':lua require("harpoon.ui").nav_file(2)\n',         desc('harpoon: navigate to file 2'))
map('n', '<leader>3', ':lua require("harpoon.ui").nav_file(3)\n',         desc('harpoon: navigate to file 3'))
map('n', '<leader>4', ':lua require("harpoon.ui").nav_file(4)\n',         desc('harpoon: navigate to file 4'))

-- LSP
_G.lsp_on_attach = function()
    map('n', 'K',          ':lua vim.lsp.buf.hover()\n',           desc('LSP: show documentation'))
    map('n', 'gd',         ':lua vim.lsp.buf.definition()\n',      desc('LSP: go to definition'))
    map('n', 'gD',         ':lua vim.lsp.buf.declaration()\n',     desc('LSP: go to declaration'))
    map('n', 'gi',         ':lua vim.lsp.buf.implementation()\n',  desc('LSP: go to implementation'))
    map('n', 'gt',         ':lua vim.lsp.buf.type_definition()\n', desc('LSP: go to type definition'))
    map('n', 'gr',         ':Telescope lsp_references\n',          desc('LSP: show references'))
    map('n', 'gs',         ':lua vim.lsp.buf.signature_help()\n',  desc('LSP: show signature help'))
    map('n', '<leader>rn', ':lua vim.lsp.buf.rename()\n',          desc('LSP: smart rename'))
    map('n', '<leader>ca', ':lua vim.lsp.buf.code_action()\n',     desc('LSP: code action'))
    map('n', '<leader>rs', ':LspRestart\n',                        desc('LSP: restart language server'))
    map('n', '<leader>dl', ':lua vim.diagnostic.open_float()\n',   desc('LSP: show diagnostics for line'))
    map('n', '<leader>df', ':Telescope diagnostics bufnr=0\n',     desc('LSP: show diagnostics for buffer'))
    map('n', '<leader>da', ':Telescope diagnostics\n',             desc('LSP: show diagnostics for workspace'))
    map('n', '[d',         ':lua vim.diagnostic.goto_prev()\n',    desc('LSP: go to previous diagnostic'))
    map('n', ']d',         ':lua vim.diagnostic.goto_next()\n',    desc('LSP: go to next diagnostic'))
end

-- Nvim-Tree
map('n', '<C-f>', ':NvimTreeFocus\n',  desc('nvim-tree: focus'))
map('n', '<C-t>', ':NvimTreeToggle\n', desc('nvim-tree: toggle'))
-- map('n', '<C-n>', ':NvimTreeOpen\n',   desc('nvim-tree: open'))

-- UndoTree
map('n', '<leader>u', ':UndotreeToggle\n', desc('undotree: toggle'))

-- LazyGit
map('n', '<leader>g', ':LazyGit\n', desc('lazygit: open'))

-- Vim-maximizer
map('n', '<leader>m', ':MaximizerToggle\n', desc('vim-maximizer: toggle'))

-- ToggleTerm
function G_open_vertical_term()
    local w = vim.api.nvim_win_get_width(vim.api.nvim_get_current_win()) / 2
    vim.cmd('ToggleTerm direction=vertical size=' .. tostring(w > 50 and w or 50))
end
map('n', '<leader>to', ':ToggleTerm direction=horizontal\n', desc('toggleterm: open horizontal'))
map('n', '<leader>te', ':lua G_open_vertical_term()\n',      desc('toggleterm: open vertical'))
map('n', '<leader>tf', ':ToggleTerm direction=float\n',      desc('toggleterm: open float'))
map('n', '<leader>tt', ':ToggleTerm direction=tab\n',        desc('toggleterm: open tab'))
map('t', '<Esc>',      '<C-\\><C-n>',                        desc('toggleterm: enter normal mode'))
map('t', '<C-q>',      '<C-\\><C-n>:q\n',                    desc('toggleterm: quit'))

-- Copilot
map('n', '<leader>cs', ':Copilot status\n',  desc('copilot: status'))
map('n', '<leader>ce', ':Copilot enable\n',  desc('copilot: enable'))
map('n', '<leader>cd', ':Copilot disable\n', desc('copilot: disable'))

-- Which-key
map('n', '<leader>k', ':WhichKey\n', desc('which-key: show help'))

-- last-command (custom made)
map('n', '<leader>ls', ':lua G_save_last_cmd()\n', desc('last-command: save last command'))
map('n', '<leader>lr', ':lua G_run_last_cmd()\n',  desc('last-command: run last command'))

-- Other plugins maps definitions
-- lua/plugins/git/gitsigns.lua
-- lua/plugins/copilot.lua
-- lua/plugins/nvim-cmp.lua
-- lua/plugins/nvim-tree.lua
-- lua/plugins/telescope.lua
-- lua/plugins/treesitter.lua
-- lua/plugins/treesitter-text-objects.lua

-- Copy to the system clipboard (Ctrl + Shift + C)
map({'n', 'v'}, '<C-C>', '"+y', desc('Copy to system clipboard'))

-- Allow moving selected line(s) of text
map('v', 'J', ':m \'>+1\ngv=gv', desc('Move selected line(s) down'))
map('v', 'K', ':m \'<-2\ngv=gv', desc('Move selected line(s) up'))

-- Keep cursor centered when paging up/down
map('n', '<C-d>', '<C-d>zz', opts)
map('n', '<C-u>', '<C-u>zz', opts)

-- Keep cursor centered when searching
map('n', 'n', 'nzzzv', opts)
map('n', 'N', 'Nzzzv', opts)

-- Switch between tabs
map('n', '<C-w>n', ':tabn\n', desc('Switch to next tab'))
map('n', '<C-w>N', ':tabN\n', desc('Switch to previous tab'))
