-- for conciseness
local Util = require("util")
local map = vim.keymap.set
local opts = { noremap = true, silent = true }
local function desc(description)
    opts.desc = description
    return opts
end

-- UI toggle options
map('n', '<leader>uc', ':Colors\n',                                  desc('Change colorscheme'))
map('n', '<leader>us', function() Util.toggle('spell') end,          desc('Toggle spelling'))
map('n', '<leader>uw', function() Util.toggle('wrap') end,           desc('Toggle word wrap'))
map('n', '<leader>uL', function() Util.toggle('relativenumber') end, desc('Toggle relative line numbers'))
map('n', '<leader>ul', function() Util.toggle.number() end,          desc('Toggle line numbers'))
-- map('n', '<leader>uf', function() Util.format.toggle() end,          desc('Toggle auto format (global)'))
-- map('n', '<leader>uF', function() Util.format.toggle(true) end,      desc('Toggle auto format (buffer)'))
-- map('n', '<leader>ud', function() Util.toggle.diagnostics() end,     desc('Toggle diagnostics'))
local conceallevel = vim.o.conceallevel > 0 and vim.o.conceallevel or 3
map("n", "<leader>uC", function() Util.toggle("conceallevel", false, {0, conceallevel}) end,
    desc("Toggle Conceal"))
if vim.lsp.inlay_hint then
    map("n", "<leader>uh", function() vim.lsp.inlay_hint(0, nil) end,
    desc("Toggle Inlay Hints"))
end
map("n", "<leader>ut", function() if vim.b.ts_highlight then vim.treesitter.stop() else vim.treesitter.start() end end,
    desc("Toggle Treesitter Highlight"))

-- Lazy
map('n', '<leader>l', ':Lazy\n', desc('lazy: open'))

-- Telescope
-- TODO https://github.com/LazyVim/LazyVim/blob/68ff818a5bb7549f90b05e412b76fe448f605ffb/lua/lazyvim/plugins/editor.lua
map('n', '<leader>ff', ':Telescope find_files\n',      desc('telescope: find files (cwd)'))
map('n', '<leader> ',  '<leader>ff', { remap = true, desc = 'telescope: find files (cwd)' })
-- TODO -- map('n', '<leader>fF', Util.telescope('files'),        desc('Find Files (root dir)'))
map('n', '<leader>fr', ':Telescope oldfiles\n',        desc('telescope: recent files'))
map('n', '<leader>fg', ':Telescope live_grep\n',       desc('telescope: live grep files'))
map('n', '<leader>fb', ':Telescope buffers\n',         desc('telescope: find buffers'))
map('n', '<leader>fh', ':Telescope help_tags\n',       desc('telescope: find help tags'))
map('n', '<leader>fp', ':Telescope resume\n',          desc('telescope: resume previous picker'))
map('n', '<leader>fc', ':Telescope commands\n',        desc('telescope: commands'))
map('n', '<leader>fa', ':Telescope autocommands\n',    desc('telescope: autocommands'))
map('n', '<leader>:',  ':Telescope command_history\n', desc('telescope: command history'))
map('n', '<leader>fk', ':Telescope keymaps\n',         desc('telescope: keymaps'))
map('n', '<leader>fs', ':Telescope notify\n',          desc('telescope: notifications'))

-- Search
map('n', '<leader>sr', ':Spectre\n',                                 desc('spectre: replace in files'))
map('n', '<leader>s"', ':Telescope registers\n',                     desc('registers'))
map('n', '<leader>sa', ':Telescope autocommands\n',                  desc('auto commands'))
map('n', '<leader>sb', ':Telescope current_buffer_fuzzy_find\n',     desc('buffer'))
map('n', '<leader>sc', ':Telescope command_history\n',               desc('command history'))
map('n', '<leader>sC', ':Telescope commands\n',                      desc('commands'))
map('n', '<leader>sd', ':Telescope diagnostics bufnr=0\n',           desc('document diagnostics'))
map('n', '<leader>sD', ':Telescope diagnostics\n',                   desc('workspace diagnostics'))
map('n', '<leader>sg', Util.telescope('live_grep', { cwd = false }), desc('grep (cwd)'))
map('n', '<leader>sG', Util.telescope('live_grep'),                  desc('grep (root dir)'))
map('n', '<leader>sh', ':Telescope help_tags\n',                     desc('help pages'))
map('n', '<leader>sH', ':Telescope highlights\n',                    desc('search highlight groups'))
map('n', '<leader>sk', ':Telescope keymaps\n',                       desc('key maps'))
map('n', '<leader>sM', ':Telescope man_pages\n',                     desc('man pages'))
map('n', '<leader>sm', ':Telescope marks\n',                         desc('jump to mark'))
map('n', '<leader>so', ':Telescope vim_options\n',                   desc('options'))
map('n', '<leader>sR', ':Telescope resume\n',                        desc('resume'))
map('n', '<leader>sw', Util.telescope('grep_string', { cwd = false, word_match = '-w' }), desc('word (cwd)'))
map('n', '<leader>sW', Util.telescope('grep_string', { word_match = '-w' }),              desc('word (root dir)'))
map('v', '<leader>sw', Util.telescope('grep_string', { cwd = false }),                    desc('selection (cwd)'))
map('v', '<leader>sW', Util.telescope('grep_string'),                                     desc('selection (root dir)'))

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
    map('n', '<leader>dl', ':lua vim.diagnostic.open_float()<CR>', desc('LSP: show diagnostics for line'))
    map('n', '<leader>df', ':Telescope diagnostics bufnr=0\n',     desc('LSP: show diagnostics for buffer'))
    map('n', '<leader>da', ':Telescope diagnostics\n',             desc('LSP: show diagnostics for workspace'))
    map('n', '[d',         ':lua vim.diagnostic.goto_prev()\n',    desc('LSP: go to previous diagnostic'))
    map('n', ']d',         ':lua vim.diagnostic.goto_next()\n',    desc('LSP: go to next diagnostic'))
end

-- Neo-tree
map('n', '<leader>e', ':Neotree toggle\n', desc('NeoTree: toggle'))
map('n', '<leader>E', function()
    require("neo-tree.command").execute({ toggle = true, dir = vim.loop.cwd() })
end, desc('NeoTree: open current directory'))
map('n', '<leader>ge', function()
    require("neo-tree.command").execute({ source = "git_status", toggle = true })
end, desc('NeoTree: open git status'))
map('n', '<leader>be', function()
    require("neo-tree.command").execute({ source = "buffers", toggle = true })
end, desc('NeoTree: open buffers'))

-- Nvim-Notify
map('n', '<leader>un', ':lua require("notify").dismiss()\n', desc('notify: dismiss all notifications'))

-- UndoTree
map('n', '<A-u>', ':UndotreeToggle\n', desc('undotree: toggle'))

-- Git
map('n', '<leader>gg', function() Util.terminal({'lazygit'}) end, desc('lazygit: Open (cwd)'))
map('n', '<leader>gG', function() Util.terminal({'lazygit'}, {cwd = Util.root()}) end, desc('lazygit: Open (root dir)'))
map('n', '<leader>gc', ':Telescope git_commits<CR>', desc('Git: commits'))
map('n', '<leader>gs', ':Telescope git_status<CR>',  desc('Git: status'))
map('n', '<leader>ge', function()
    require('neo-tree.command').execute({ source = 'git_status', toggle = true })
end, desc('Neotree: Git explorer'))

-- Vim-maximizer
map('n', '<leader>m', ':MaximizerToggle\n', desc('vim-maximizer: toggle'))

-- Noice
map('c', '<S-Enter>', function() require("noice").redirect(vim.fn.getcmdline()) end, desc('Redirect Cmdline'))
map('n', '<leader>snl', function() require("noice").cmd("last") end,                 desc("Noice Last Message"))
map('n', '<leader>snh', function() require("noice").cmd("history") end,              desc("Noice History"))
map('n', '<leader>sna', function() require("noice").cmd("all") end,                  desc("Noice All"))
map('n', '<leader>snd', function() require("noice").cmd("dismiss") end,              desc("Dismiss All"))
map({'i', 'n', 's'}, "<c-f>", function() if not require("noice.lsp").scroll(4) then return "<c-f>" end end,  desc("Scroll forward"))
map({'i', 'n', 's'}, "<c-b>", function() if not require("noice.lsp").scroll(-4) then return "<c-b>" end end, desc("Scroll backward"))

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

-- Markdown-preview
map('n', '<leader>cp', ':MarkdownPreviewToggle\n', desc('markdown-preview: toggle'))

-- Mason
map('n', '<leader>cm', ':Mason\n', desc('mason: open'))

-- Persistence.nvim
map('n', '<leader>qs', ':lua require("persistence").load()\n',            desc('persistence: Restore Session'))
map('n', '<leader>ql', ':lua require("persistence").load({last=true})\n', desc('persistence: Restore Last Session'))
map('n', '<leader>qd', ':lua require("persistence").stop()\n',            desc('persistence: Don\'t Save Current Session'))

-- Which-key
map('n', '<leader>k', ':WhichKey\n', desc('which-key: show help'))

-- Other plugins maps definitions
-- lua/plugins/git/gitsigns.lua
-- lua/plugins/copilot.lua
-- lua/plugins/nvim-cmp.lua
-- lua/plugins/telescope.lua
-- lua/plugins/treesitter.lua
-- lua/plugins/treesitter-text-objects.lua

-- Copy to the system clipboard (Ctrl + Shift + C)
map({'n', 'x'}, '<C-C>', '"+y', desc('Copy to system clipboard'))

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
--     '<Cmd>nohlsearch<Bar>diffupdate<Bar>normal! <C-L><CR>',
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
