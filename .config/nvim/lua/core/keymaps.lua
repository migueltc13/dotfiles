local map = vim.keymap.set
local opts = { noremap = true, silent = true, remap = false }
local function desc(description, options)
    opts.desc = description
    if options then
        for k, v in pairs(options) do
            opts[k] = v
        end
    end
    return opts
end

local Ui         = require("util.ui")
local Toggle     = require("util.toggle")
local Telescope  = require("util.telescope")
local Neotree    = require("util.neo-tree")
local Noice      = require("util.noice")
local ToggleTerm = require("util.toggleterm")

-- UI toggle options
map('n', '<leader>uc', ':Colors\n',         desc('Change colorscheme'))
map('n', '<leader>us', Toggle.spell,        desc('Toggle spelling'))
map('n', '<leader>uw', Toggle.wrap,         desc('Toggle word wrap'))
map('n', '<leader>ur', Toggle.rnu,          desc('Toggle relative line numbers'))
map('n', '<leader>ul', Toggle.numbers,      desc('Toggle line numbers'))
map('n', '<leader>ud', Toggle.diagnostics,  desc('Toggle diagnostics (buffer)'))
map('n', '<leader>uC', Toggle.conceallevel, desc('Toggle conceal'))
map('n', '<leader>uh', Toggle.inlay_hint,   desc('Toggle inlay hints'))
map('n', '<leader>ut', Toggle.treesitter,   desc('Toggle treesitter highlighting'))
map('n', '<leader>un', Ui.toggle_notify,    desc('Toggle notifications'))

-- Telescope
map('n', '<leader>ff', ':Telescope find_files\n',      desc('telescope: find files'))
map('n', '<leader> ',  '<leader>ff',                   desc('telescope: find files', { remap = true }))
map('n', '<leader>fF', Telescope.find_hidden_files,    desc('telescope: find (hidden) files'))
map('n', '<leader>fp', ':Telescope oldfiles\n',        desc('telescope: previous files'))
map('n', '<leader>fg', ':Telescope live_grep\n',       desc('telescope: live grep files'))
map('n', '<leader>fb', ':Telescope buffers\n',         desc('telescope: find buffers'))
map('n', '<leader>fh', ':Telescope help_tags\n',       desc('telescope: find help tags'))
map('n', '<leader>fr', ':Telescope resume\n',          desc('telescope: resume previous picker'))
map('n', '<leader>fc', ':Telescope commands\n',        desc('telescope: commands'))
map('n', '<leader>fa', ':Telescope autocommands\n',    desc('telescope: autocommands'))
map('n', '<leader>:',  ':Telescope command_history\n', desc('telescope: command history'))
map('n', '<leader>fk', ':Telescope keymaps\n',         desc('telescope: keymaps'))
map('n', '<leader>fs', ':Telescope notify\n',          desc('telescope: notifications'))

-- Search
map('n', '<leader>sr', ':Spectre\n',                             desc('spectre: replace in files'))
map('n', '<leader>s"', ':Telescope registers\n',                 desc('telescope: registers'))
map('n', '<leader>sa', ':Telescope autocommands\n',              desc('telescope: auto commands'))
map('n', '<leader>sb', ':Telescope current_buffer_fuzzy_find\n', desc('telescope: buffer'))
map('n', '<leader>sc', ':Telescope command_history\n',           desc('telescope: command history'))
map('n', '<leader>sC', ':Telescope commands\n',                  desc('telescope: commands'))
map('n', '<leader>sd', ':Telescope diagnostics bufnr=0\n',       desc('telescope: document diagnostics'))
map('n', '<leader>sD', ':Telescope diagnostics\n',               desc('telescope: workspace diagnostics'))
map('n', '<leader>sg', ':Telescope live_grep\n',                 desc('telescope: live grep files'))
map('n', '<leader>sh', ':Telescope help_tags\n',                 desc('telescope: help pages'))
map('n', '<leader>sH', ':Telescope highlights\n',                desc('telescope: search highlight groups'))
map('n', '<leader>sk', ':Telescope keymaps\n',                   desc('telescope: key maps'))
map('n', '<leader>sM', ':Telescope man_pages\n',                 desc('telescope: man pages'))
map('n', '<leader>sm', ':Telescope marks\n',                     desc('telescope: jump to mark'))
map('n', '<leader>so', ':Telescope vim_options\n',               desc('telescope: options'))
map('n', '<leader>sR', ':Telescope resume\n',                    desc('telescope: resume previous picker'))
map('n', '<leader>sw', Telescope.grep_word,                      desc('telescope: grep word'))
map('v', '<leader>sw', Telescope.grep_selection,                 desc('telescope: grep selection'))

-- Harpoon
map('n', '<leader>he', ':lua require("harpoon.ui").toggle_quick_menu()\n', desc('harpoon: toggle quick menu'))
map('n', '<leader>ha', ':lua require("harpoon.mark").add_file()\n',        desc('harpoon: add file'))
map('n', '<leader>1',  ':lua require("harpoon.ui").nav_file(1)\n',         desc('harpoon: navigate to file 1'))
map('n', '<leader>2',  ':lua require("harpoon.ui").nav_file(2)\n',         desc('harpoon: navigate to file 2'))
map('n', '<leader>3',  ':lua require("harpoon.ui").nav_file(3)\n',         desc('harpoon: navigate to file 3'))
map('n', '<leader>4',  ':lua require("harpoon.ui").nav_file(4)\n',         desc('harpoon: navigate to file 4'))

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
    map('n', '<leader>dl', ':lua vim.diagnostic.open_float()<cr>', desc('LSP: show diagnostics for line'))
    map('n', '<leader>df', ':Telescope diagnostics bufnr=0\n',     desc('LSP: show diagnostics for buffer'))
    map('n', '<leader>da', ':Telescope diagnostics\n',             desc('LSP: show diagnostics for workspace'))
    map('n', '[d',         ':lua vim.diagnostic.goto_prev()\n',    desc('LSP: go to previous diagnostic'))
    map('n', ']d',         ':lua vim.diagnostic.goto_next()\n',    desc('LSP: go to next diagnostic'))
end

-- ToggleTerm
map('n', '<leader>te', ToggleTerm.open_vertical_term,        desc('toggleterm: open vertical'))
map('n', '<leader>to', ':ToggleTerm direction=horizontal\n', desc('toggleterm: open horizontal'))
map('n', '<leader>tf', ':ToggleTerm direction=float\n',      desc('toggleterm: open float'))
map('n', '<leader>tt', ':ToggleTerm direction=tab\n',        desc('toggleterm: open tab'))
map('t', '<Esc>',      '<C-\\><C-n>',                        desc('toggleterm: enter normal mode'))
map('t', '<C-q>',      '<C-\\><C-n>:q\n',                    desc('toggleterm: quit'))

-- Noice
map('c', '<S-Enter>',   Noice.redirect_cmdline, desc('redirect cmdline'))
map('n', '<leader>snl', Noice.last_message,     desc('noice last message'))
map('n', '<leader>snh', Noice.history,          desc('noice history'))
map('n', '<leader>sna', Noice.all,              desc('noice all'))
map('n', '<leader>snd', Noice.dismiss_all,      desc('dismiss all'))
map({'i', 'n', 's'}, '<c-f>', function() Noice.scroll_forward('<c-f>')  end, desc('Scroll forward'))
map({'i', 'n', 's'}, '<c-b>', function() Noice.scroll_backward('<c-b>') end, desc('Scroll backward'))

-- Persistence.nvim
map('n', '<leader>qs', ':lua require("persistence").load()\n',            desc('persistence: restore session'))
map('n', '<leader>ql', ':lua require("persistence").load({last=true})\n', desc('persistence: restore last session'))
map('n', '<leader>qd', ':lua require("persistence").stop()\n',            desc('persistence: don\'t save session'))

-- Neo-tree
map('n', '<leader>e', ':Neotree toggle\n', desc('NeoTree: toggle'))
map('n', '<leader>be', Neotree.buffers,    desc('NeoTree: open buffers'))
map('n', '<leader>ge', Neotree.git_status, desc('NeoTree: open git status'))

-- Git
map('n', '<leader>gg', '<cmd>Lazygit<cr>',               desc('lazygit: open'))
map('n', '<leader>gc', '<cmd>Telescope git_commits<cr>', desc('Git: commits'))
map('n', '<leader>gs', '<cmd>Telescope git_status<cr>',  desc('Git: status'))

-- Copilot
map('n', '<leader>cc', Ui.toggle_copilot,  desc('copilot: toggle'))

-- Markdown-preview
map('n', '<leader>cp', ':MarkdownPreviewToggle\n', desc('markdown-preview: toggle'))

-- Mason
map('n', '<leader>cm', ':Mason\n', desc('mason: open'))

-- UndoTree
map('n', '<A-u>', ':UndotreeToggle\n', desc('undotree: toggle'))

-- Vim-maximizer
map('n', '<leader>m', ':MaximizerToggle\n', desc('vim-maximizer: toggle'))

-- Lazy
map('n', '<leader>l', ':Lazy\n', desc('lazy: open'))

-- Which-key
map('n', '<leader>k', ':WhichKey\n', desc('which-key: show help'))

-- Other plugins maps definitions
-- lua/plugins/git/gitsigns.lua
-- lua/plugins/copilot.lua
-- lua/plugins/nvim-cmp.lua
-- lua/plugins/telescope.lua
-- lua/plugins/treesitter.lua

-- Copy to the system clipboard (Ctrl + Shift + C)
map('x', '<C-C>', '"+y',                          desc('Copy to system clipboard'))
map('n', '<C-C>', 'm`<cmd>norm! V<cr>"+y<esc>``', desc('Copy to system clipboard'))

-- Allow moving selected line(s) of text
map('x', 'J', ':m \'>+1\ngv=gv', desc('Move selected line(s) down'))
map('x', 'K', ':m \'<-2\ngv=gv', desc('Move selected line(s) up'))

-- Keep cursor centered when paging up/down
map('n', '<C-d>', '<C-d>zz', opts)
map('n', '<C-u>', '<C-u>zz', opts)

-- Keep cursor centered when searching
map('n', 'n', 'nzzzv', opts)
map('n', 'N', 'Nzzzv', opts)

-- better indenting
map('v', '<', '<gv')
map('v', '>', '>gv')

-- highlights under cursor
map('n', '<leader>ui', vim.show_pos, { desc = 'Inspect Pos' })

-- Clear search with <esc>
-- map({ 'i', 'n' }, '<esc>', '<cmd>noh<cr><esc>', { desc = 'Escape and clear hlsearch' })

-- Clear search, diff update and redraw
-- map(
--     'n',
--     '<leader>ur',
--     '<Cmd>nohlsearch<Bar>diffupdate<Bar>normal! <C-L><cr>',
--     { desc = 'Redraw / clear hlsearch / diff update' }
-- )

-- File operations
map({ 'i', 'x', 'n', 's' }, '<C-s>', '<cmd>w<cr><esc>', { desc = 'Save file' })
map({ 'i', 'x', 'n', 's' }, '<C-q>', '<cmd>wq<cr><esc>', { desc = 'Save file and quit' })
map('n', '<leader>fn', '<cmd>enew<cr>', { desc = 'New File' })

-- Move to window using the <ctrl> hjkl keys
map('n', '<C-h>', '<C-w>h', { desc = 'Go to the left window', remap = true })
map('n', '<C-j>', '<C-w>j', { desc = 'Go to the lower window', remap = true })
map('n', '<C-k>', '<C-w>k', { desc = 'Go to the upper window', remap = true })
map('n', '<C-l>', '<C-w>l', { desc = 'Go to the right window', remap = true })

-- Resize windows using <alt> hjkl keys
map('n', '<A-k>', '<cmd>resize +2<cr>',          { desc = 'Increase window height' })
map('n', '<A-j>', '<cmd>resize -2<cr>',          { desc = 'Decrease window height' })
map('n', '<A-h>', '<cmd>vertical resize -2<cr>', { desc = 'Decrease window width' })
map('n', '<A-l>', '<cmd>vertical resize +2<cr>', { desc = 'Increase window width' })

-- Split windows
map('n', '<leader>w-', '<C-w>s', { desc = 'Split window below', remap = true })
map('n', '<leader>w|', '<C-w>v', { desc = 'Split window right', remap = true })
map('n', '<leader>-', '<C-w>s',  { desc = 'Split window below', remap = true })
map('n', '<leader>|', '<C-w>v',  { desc = 'Split window right', remap = true })

-- Switch windows
map('n', '<leader>ww', '<C-w>w', { desc = 'Other window', remap = true })

-- Delete windows
map('n', '<leader>wd', '<C-w>c', { desc = 'Delete window', remap = true })

-- Tabs
map('n', '<leader><tab>l',       '<cmd>tablast<cr>',     { desc = 'Last tab' })
map('n', '<leader><tab>f',       '<cmd>tabfirst<cr>',    { desc = 'First tab' })
map('n', '<leader><tab><tab>',   '<cmd>tabnext<cr>',     { desc = 'Next tab' })
map('n', '<leader><tab><S-tab>', '<cmd>tabprevious<cr>', { desc = 'Previous tab' })
map('n', '<leader><tab>n',       '<cmd>tabnew<cr>',      { desc = 'New tab' })
map('n', '<leader><tab>d',       '<cmd>tabclose<cr>',    { desc = 'Close tab' })

-- Buffers
map('n', '<S-h>',      '<cmd>bprevious<cr>', { desc = 'Prev buffer' })
map('n', '<S-l>',      '<cmd>bnext<cr>',     { desc = 'Next buffer' })
map('n', '[b',         '<cmd>bprevious<cr>', { desc = 'Prev buffer' })
map('n', ']b',         '<cmd>bnext<cr>',     { desc = 'Next buffer' })
map('n', '<leader>bb', '<cmd>e #<cr>',       { desc = 'Switch to Other Buffer' })
map('n', '<leader>`',  '<cmd>e #<cr>',       { desc = 'Switch to Other Buffer' })

-- Quit all buffers
map('n', '<leader>qq', '<cmd>qa<cr>', { desc = 'Quit all buffers' })
