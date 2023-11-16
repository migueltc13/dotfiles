vim.o.number = true                    -- Show line numbers
vim.o.relativenumber = true            -- Show relative line numbers
vim.o.autoindent = true                -- Enable auto-indentation
vim.o.smartindent = true               -- Enable smart-indentation
vim.o.smarttab = true                  -- Use smart tabs
vim.o.shiftwidth = 4                   -- Set the number of spaces for auto-indent
vim.o.tabstop = 4                      -- Set the number of spaces for a tab character
vim.o.softtabstop = 4                  -- Set soft tabstop
vim.o.expandtab = true                 -- Expand tabs to spaces
vim.o.breakindent = true               -- Enable break indent
vim.o.mouse = "a"                      -- Enable mouse support
vim.o.encoding = "UTF-8"               -- UTF-8 byte sequence
vim.o.updatetime = 200                 -- Decrease update time (default 4000 ms)
vim.o.timeoutlen = 1000                -- Mapped sequences time (default 1000 ms)
vim.o.wrap = false                     -- Don't wrap lines
vim.o.list = true                      -- Display tabs and trailing spaces visually
vim.o.listchars = "tab:▸ ,trail:·"     -- Set listchars for tabs and trailing spaces
vim.o.termguicolors = true             -- Enable true color support (24 bits)
vim.o.whichwrap = "b,s,<,>,[,]"        -- Allows wrap when using arrow keys
vim.o.scrolloff = 8                    -- Minimal number of lines to keep above/below the cursor
vim.o.signcolumn = "yes"               -- Keep signcolumn on by default
vim.o.completeopt = "menuone,noselect" -- Better completion experience
vim.o.hlsearch = false                 -- Disable search highlighting
vim.o.incsearch = true                 -- Enable search patterns highlighting
-- vim.o.ignorecase = true              -- Ignore case when searching
-- vim.o.smartcase = true               -- Ignore case when searching lowercase

-- Set undodir directory
vim.o.undodir = vim.fn.expand("~/.vim/undodir")
vim.o.undofile = true                  -- Enable undo file
vim.o.clipboard = "unnamed"            -- Clipboard (nvim/OS) settings

-- Enable syntax highlighting
vim.cmd('syntax enable')

-- Disable netrw and its plugins
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

-- Python 3 executable
vim.g.python3_host_prog = '/usr/bin/python3'

-- Set leader key as space
vim.g.mapleader = ' '
