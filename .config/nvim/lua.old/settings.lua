-- Neovim settings configuration
vim.o.number = true                  -- Show line numbers
vim.o.relativenumber = true          -- Show relative line numbers
vim.o.autoindent = true              -- Enable auto-indentation
vim.o.smartindent = true             -- Enable smart-indentation
vim.o.smarttab = true                -- Use smart tabs
vim.o.shiftwidth = 4                 -- Set the number of spaces for auto-indent
vim.o.tabstop = 4                    -- Set the number of spaces for a tab character
vim.o.softtabstop = 4                -- Set soft tabstop
vim.o.expandtab = true               -- Expand tabs to spaces
vim.o.mouse = 'a'                    -- Enable mouse support
vim.o.encoding = 'UTF-8'             -- UTF-8 byte sequence
vim.o.wrap = false                   -- Don't wrap lines

-- Allows wrap when using arrow keys
vim.cmd('set whichwrap+=<,>,[,]')

-- Display tabs and trailing spaces visually
vim.o.list = true
vim.o.listchars = 'tab:  ,trail:·'

-- Set highlight on search
vim.o.hlsearch = false

-- See `:help 'clipboard'`
vim.o.clipboard = 'unnamed'

-- Enable break indent
vim.o.breakindent = true

-- Save undo history
vim.o.undofile = true

-- Case sensitive on search
vim.o.ignorecase = false
vim.o.smartcase = false

-- Keep signcolumn on by default
vim.wo.signcolumn = 'yes'

-- Decrease update time
vim.o.updatetime = 250 -- By default updatetime is 4000 ms
vim.o.timeoutlen = 300 -- By default timeoutlen is 1000 ms

-- Set completeopt to have a better completion experience
vim.o.completeopt = 'menuone,noselect'

vim.o.termguicolors = true -- True color support

-- Enable syntax highlighting
vim.cmd('syntax enable')
