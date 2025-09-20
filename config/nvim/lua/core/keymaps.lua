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

local Telescope = require("util.Telescope")
local Neotree   = require("util.NeoTree")
local Noice     = require("util.Noice")
local Misc      = require("util.misc")
local Toggle    = require("util.toggle")
local Colors    = require("util.colorscheme")

-- UI toggle options
map('n', '<leader>uc',  Colors.change,       desc('Change colorscheme'))
map('n', '<leader>us',  Toggle.spell,        desc('Toggle spelling'))
map('n', '<leader>uw',  Toggle.wrap,         desc('Toggle word wrap'))
map('n', '<leader>ur',  Toggle.rnu,          desc('Toggle relative line numbers'))
map('n', '<leader>ul',  Toggle.numbers,      desc('Toggle line numbers'))
map('n', '<leader>uf',  Toggle.fileformat,   desc('Toggle file format'))
map('n', '<leader>ud',  Toggle.diagnostics,  desc('Toggle diagnostics (buffer)'))
map('n', '<leader>uC',  Toggle.conceallevel, desc('Toggle conceal'))
map('n', '<leader>uh',  Toggle.inlay_hint,   desc('Toggle inlay hints'))
map('n', '<leader>uth', Toggle.ts_highlight, desc('Toggle highlighting'))
map('n', '<leader>uti', Toggle.ts_indent,    desc('Toggle indent'))
map('n', '<leader>uta', Toggle.ts_autotag,   desc('Toggle auto tag'))
map('n', '<leader>uts', Toggle.ts_inc_sel,   desc('Toggle incremental selection'))
map('n', '<leader>utc', Toggle.ts_context,   desc('Toggle context'))
map('n', '<leader>un',  Toggle.notify,       desc('Toggle notifications'))
map('n', '<leader>uz',  Toggle.zen,          desc('Toggle zen mode'))

-- Telescope
map('n', '<leader>ff',  ':Telescope find_files\n',      desc('telescope: find files'))
map('n', '<leader> ',   '<leader>ff',                   desc('telescope: find files', { remap = true }))
map('n', '<leader>fF',  Telescope.find_hidden_files,    desc('telescope: find (hidden) files'))
map('n', '<leader>fp',  ':Telescope oldfiles\n',        desc('telescope: previous files'))
map('n', '<leader>fg',  ':Telescope live_grep\n',       desc('telescope: live grep files'))
map('n', '<leader>fb',  ':Telescope buffers\n',         desc('telescope: find buffers'))
map('n', '<leader>fh',  ':Telescope help_tags\n',       desc('telescope: find help tags'))
map('n', '<leader>fr',  ':Telescope resume\n',          desc('telescope: resume previous picker'))
map('n', '<leader>fc',  ':Telescope commands\n',        desc('telescope: commands'))
map('n', '<leader>fa',  ':Telescope autocommands\n',    desc('telescope: autocommands'))
map('n', '<leader>:',   ':Telescope command_history\n', desc('telescope: command history'))
map('n', '<leader>fk',  ':Telescope keymaps\n',         desc('telescope: keymaps'))
map('n', '<leader>fn',  ':Telescope notify\n',          desc('telescope: notifications'))
map('n', '<leader>ftw', Telescope.todos,                desc('telescope: find todo\'s in workspace'))
map('n', '<leader>ftb', Telescope.todos_current_file,   desc('telescope: find todo\'s in buffer'))
map('n', '<leader>cf',  Telescope.config_files,         desc('telescope: config files'))

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
    map('n', '<leader>dl', ':lua vim.diagnostic.open_float()\n',   desc('LSP: show diagnostics for line'))
    map('n', '<leader>db', ':Telescope diagnostics bufnr=0\n',     desc('LSP: show diagnostics for buffer'))
    map('n', '<leader>dw', ':Telescope diagnostics\n',             desc('LSP: show diagnostics for workspace'))
    map('n', '[d',         ':lua vim.diagnostic.goto_prev()\n',    desc('LSP: go to previous diagnostic'))
    map('n', ']d',         ':lua vim.diagnostic.goto_next()\n',    desc('LSP: go to next diagnostic'))
end

-- Noice
map('c', '<S-Enter>',   Noice.redirect_cmdline, desc('redirect cmdline'))
map('n', '<leader>snl', Noice.last_message,     desc('noice last message'))
map('n', '<leader>snh', Noice.history,          desc('noice history'))
map('n', '<leader>sna', Noice.all,              desc('noice all'))
map('n', '<leader>snd', Noice.dismiss_all,      desc('dismiss all'))
map({'i', 's', 'n'}, '<c-f>', function() Noice.scroll_forward('<c-f>')  end, desc('Scroll forward'))
map({'i', 's', 'n'}, '<c-b>', function() Noice.scroll_backward('<c-b>') end, desc('Scroll backward'))

-- Terminal
map('n', '<leader>tt',     ':ToggleTerm\n',                      desc('toggleterm: open terminal'))
map('n', '<leader>te',     ':ToggleTerm direction=vertical\n',   desc('toggleterm: open vertical'))
map('n', '<leader>to',     ':ToggleTerm direction=horizontal\n', desc('toggleterm: open horizontal'))
map('n', '<leader>tf',     ':ToggleTerm direction=float\n',      desc('toggleterm: open float'))
map('n', '<leader>t<tab>', ':ToggleTerm direction=tab\n',        desc('toggleterm: open tab'))
map('t', '<Esc>',          '<C-\\><C-n>',                        desc('toggleterm: enter normal mode'))
map('t', '<C-q>',          '<C-\\><C-n>:q\n',                    desc('toggleterm: quit'))

-- DAP
map('n', '<leader>dt', ':lua require("dapui").toggle()\n',             desc('DAP: toggle ui'))
map('n', '<leader>dr', ':lua require("dapui").open({reset = true})\n', desc('DAP: reset'))
map('n', '<leader>dc', ':DapContinue\n',                               desc('DAP: continue'))
map('n', '<leader>d ', ':DapToggleBreakpoint\n',                       desc('DAP: toggle breakpoint'))

-- DBUI
map('n', '<leader>dd', ':DBUIToggle\n', desc('DBUI: toggle'))

-- Persistence.nvim
map('n', '<leader>q ', ':Persistence load\n',      desc('persistence: restore session'))
map('n', '<leader>ql', ':Persistence load_last\n', desc('persistence: restore last session'))
map('n', '<leader>qs', ':Persistence save\n',      desc('persistence: save current session'))
map('n', '<leader>qd', ':Persistence stop\n',      desc('persistence: don\'t save session'))

-- Neo-tree
map('n', '<leader>e',  ':Neotree toggle\n', desc('NeoTree: toggle'))
map('n', '<M-e>',      ':Neotree focus\n',  desc('NeoTree: focus')) -- overrides nvim-autopairs fast wrap
map('n', '<leader>be', Neotree.buffers,     desc('NeoTree: open buffers'))
map('n', '<leader>ge', Neotree.git_status,  desc('NeoTree: open git status'))

-- Git
map('n', '<leader>gg', ':LazyGit\n',               desc('lazygit: open'))
map('n', '<leader>gc', ':Telescope git_commits\n', desc('Git: commits'))
map('n', '<leader>gs', ':Telescope git_status\n',  desc('Git: status'))

-- Copilot
map('n', '<leader>cc', Toggle.copilot,      desc('copilot: toggle'))
map('n', '<leader>cs', ':Copilot status\n', desc('copilot: status'))

-- Copilot Chat
map('n', '<leader>ct', Toggle.copilot_chat, desc('copilot-chat: toggle'))

-- Markdown-preview
map('n', '<leader>cp', ':MarkdownPreviewToggle\n', desc('markdown-preview: toggle'))

-- Mason
map('n', '<leader>cm', ':Mason\n', desc('mason: open'))

-- UndoTree
map('n', '<A-u>', ':UndotreeToggle\n', desc('undotree: toggle'))

-- Vim-maximizer
map('n', '<leader>m', ':MaximizerToggle!\n', desc('vim-maximizer: toggle'))

-- Lazy
-- map('n', '<leader>l', ':Lazy\n', desc('lazy: open'))

-- Which-key
map('n', '<leader>k', ':WhichKey\n', desc('which-key: open'))

-- Other plugins keymaps definitions
-- ../plugins/ai/copilot.lua
-- ../plugins/ai/copilotchat.lua
-- ../plugins/editor/nvim-cmp.lua
-- ../plugins/editor/nvim-treesitter.lua
-- ../plugins/editor/comment-nvim.lua
-- ../plugins/git/gitsigns.lua
-- ../plugins/util/telescope.lua

-- Allow moving in insert mode with <alt> + hjkl
map({ 'i', 'c' }, '<A-h>', '<left>',  desc('Move left',  { remap = true }))
map({ 'i', 'c' }, '<A-j>', '<down>',  desc('Move down',  { remap = true }))
map({ 'i', 'c' }, '<A-k>', '<up>',    desc('Move up',    { remap = true }))
map({ 'i', 'c' }, '<A-l>', '<right>', desc('Move right', { remap = true }))

-- Allow moving on wrapped lines (Disabled as it causes lag)
-- map('n', 'j',      'v:count ? "j" : "gj"',      { expr = true, remap = true })
-- map('n', 'k',      'v:count ? "k" : "gk"',      { expr = true, remap = true })
-- map('n', '<down>', 'v:count ? "<down>" : "gj"', { expr = true, remap = true })
-- map('n', '<up>',   'v:count ? "<up>"   : "gk"', { expr = true, remap = true })

-- Disable shift + up/down keys movement in insert mode
map('i', '<S-Up>',   '<nop>', desc('Disable shift + up key movement'))
map('i', '<S-Down>', '<nop>', desc('Disable shift + down key movement'))

-- Disable shift + up/down keys default movement in normal and visual mode
map({ 'n', 'v' }, '<S-Up>',   'k', desc('Go up',   { remap = true }))
map({ 'n', 'v' }, '<S-Down>', 'j', desc('Go down', { remap = true }))

-- Allow moving selected line(s) of text
map('v', 'J', ':m \'>+1\ngv=gv', desc('Move selected line(s) down'))
map('v', 'K', ':m \'<-2\ngv=gv', desc('Move selected line(s) up'))

-- Keep cursor centered when paging up/down
map('n', '<C-d>', '<C-d>zz', desc('Page down', { remap = true }))
map('n', '<C-u>', '<C-u>zz', desc('Page up',   { remap = true }))

-- Keep cursor centered when searching
map('n', 'n', 'nzzzv', desc('Search next',     { remap = true }))
map('n', 'N', 'Nzzzv', desc('Search previous', { remap = true }))

-- better indenting
map('v', '<', '<gv', desc('Indent left',  { remap = true }))
map('v', '>', '>gv', desc('Indent right', { remap = true }))

-- highlights under cursor
map('n', '<leader>ui', vim.show_pos, desc('Inspect position under cursor'))

-- File operations
map({ 'i', 'v', 'n' }, '<C-s>', '<cmd>w<cr><esc>',          desc('Save file'))
map({ 'i', 'v', 'n' }, '<C-q>', '<cmd>wq<cr><esc>',         desc('Save file and quit'))
map('n', '<leader>n',  '<cmd>enew<cr>',                     desc('New file'))
map('n', '<leader>o',  '<cmd>sil !xdg-open % & disown<cr>', desc('Open file with system default'))
map('n', '<leader>x',   Misc.make_executable,               desc('Make file executable'))

-- Ctrl + click to open links
map({'i', 'v', 'c', 't', 'n'}, '<C-LeftMouse>', '', desc('Open link', { remap = true }))

-- Go to alternate buffer with Ctrl + ^
map('n', '<C-\\>', '<cmd>b#<cr>', desc('Go to alternate buffer', { remap = true }))

-- Allow Ctrl + ^ in insert mode
map('i', '<C-\\>', '<esc><C-\\>', desc('[<C-^>]', { remap = true }))

-- Copy to the system clipboard (Ctrl + C)
map('v', '<C-C>', '"+y',                          desc('Copy to system clipboard'))
map('n', '<C-C>', 'm`<cmd>norm! V<cr>"+y<esc>``', desc('Copy to system clipboard'))

-- Delete word before cursor
map({ 'i', 'c' }, '<C-H>', '<C-w>', { desc = 'Delete word before cursor', remap = true })

-- Select all text in the buffer
map('n', '<C-a>', Misc.select_all, desc('Select all'))

-- Quit all
map('n', '<leader>qq', '<cmd>qa<cr>', desc('Quit all'))

-- Buffers
map('n', '<S-h>',      '<cmd>bprevious<cr>', desc('Prev buffer'))
map('n', '<S-l>',      '<cmd>bnext<cr>',     desc('Next buffer'))
map('n', '<leader>bb', '<cmd>e #<cr>',       desc('Switch buffer [<C-^>]'))
map('n', '<leader>bq', '<cmd>q<cr>',         desc('Quit buffer'))
map('n', '<leader>bd', '<cmd>bd<cr>',        desc('Delete buffer'))

-- Move between windows using the <ctrl> hjkl keys
map('n', '<C-h>', '<C-w>h', desc('Go to the left window',  { remap = true }))
map('n', '<C-j>', '<C-w>j', desc('Go to the lower window', { remap = true }))
map('n', '<C-k>', '<C-w>k', desc('Go to the upper window', { remap = true }))
map('n', '<C-l>', '<C-w>l', desc('Go to the right window', { remap = true }))

-- Resize windows using <ctrl> + <alt> hjkl keys
map('n', '<C-A-k>', '<cmd>resize +4<cr>',      desc('Increase window height'))
map('n', '<C-A-j>', '<cmd>resize -4<cr>',      desc('Decrease window height'))
map('n', '<C-A-h>', '<cmd>vert resize -4<cr>', desc('Decrease window width'))
map('n', '<C-A-l>', '<cmd>vert resize +4<cr>', desc('Increase window width'))

-- Split windows
map('n', '<leader>w|', '<C-w>v', desc('Split window right',  { remap = true }))
map('n', '<leader>w-', '<C-w>s', desc('Split window below',  { remap = true }))
map('n', '<leader>-',  '<C-w>s', desc('Split window below',  { remap = true }))
map('n', '<leader>|',  '<C-w>v', desc('Split window right',  { remap = true }))

-- Switch windows
map('n', '<leader>ww', '<C-w>w', desc('Other window',        { remap = true }))
map('n', '<leader>wx', '<C-w>x', desc('Exchange windows',    { remap = true }))

-- Close windows
map('n', '<leader>wd', '<C-w>d', desc('Delete window',       { remap = true }))
map('n', '<leader>wc', '<C-w>c', desc('Close window',        { remap = true }))
map('n', '<leader>wo', '<C-w>o', desc('Close other windows', { remap = true }))

-- Tabs
map('n', '<leader><tab>n',       '<cmd>tabnew<cr>',      desc('New tab'))
map('n', '<leader><tab>c',       '<cmd>tabclose<cr>',    desc('Close tab'))
map('n', '<leader><tab>l',       '<cmd>tablast<cr>',     desc('Last tab'))
map('n', '<leader><tab>f',       '<cmd>tabfirst<cr>',    desc('First tab'))
map('n', '<tab>',                '<cmd>tabnext<cr>',     desc('Next tab'))
map('n', '<S-tab>',              '<cmd>tabprevious<cr>', desc('Previous tab'))
map('n', '<leader><tab><tab>',   '<cmd>tabnext<cr>',     desc('Next tab [<tab>]'))
map('n', '<leader><tab><S-tab>', '<cmd>tabprevious<cr>', desc('Previous tab [<S-tab>]'))
for i = 1, 4 do
map('n', '<leader><tab>' .. i, '<cmd>' .. i .. 'tabnext<cr>', desc('Go to tab ' .. i))
end
