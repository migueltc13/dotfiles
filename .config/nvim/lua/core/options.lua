local o = vim.opt
local g = vim.g

o.number = true                    -- Show line numbers
o.relativenumber = true            -- Show relative line numbers
o.autoindent = true                -- Enable auto-indentation
o.smartindent = true               -- Enable smart-indentation
o.smarttab = true                  -- Use smart tabs
o.shiftwidth = 4                   -- Set the number of spaces for auto-indent
o.tabstop = 4                      -- Set the number of spaces for a tab character
o.softtabstop = 4                  -- Set soft tabstop
o.expandtab = true                 -- Expand tabs to spaces
o.breakindent = true               -- Enable break indent
o.mouse = "a"                      -- Enable mouse support
o.encoding = "UTF-8"               -- UTF-8 byte sequence
o.updatetime = 400                 -- Decrease update time (default 4000 ms)
o.timeoutlen = 200                 -- Mapped sequences time (default 1000 ms)
o.wrap = false                     -- Don't wrap lines
o.list = true                      -- Display tabs and trailing spaces visually
o.listchars = "tab:▸ ,trail:·"     -- Set listchars for tabs and trailing spaces
o.termguicolors = true             -- Enable true color support (24 bits)
o.whichwrap = "b,s,<,>,[,]"        -- Allows wrap when using arrow keys
o.scrolloff = 4                    -- Minimal number of lines to keep above/below the cursor
o.signcolumn = "yes"               -- Keep signcolumn on by default
o.completeopt = "menuone,noselect" -- Better completion experience
o.hlsearch = false                 -- Disable search highlighting
o.incsearch = true                 -- Enable search patterns highlighting
-- o.ignorecase = true              -- Ignore case when searching
-- o.smartcase = true               -- Ignore case when searching lowercase

-- Set undodir directory
o.undodir = vim.fn.expand("~/.vim/undodir")
o.undofile = true                  -- Enable undo file
o.clipboard = "unnamed"            -- Clipboard (nvim/OS) settings

-- Enable syntax highlighting
vim.cmd('syntax enable')

-- Disable netrw and its plugins
g.loaded_netrw = 1
g.loaded_netrwPlugin = 1

-- Python 3 executable
g.python3_host_prog = '/usr/bin/python3'

-- Set leader and local leader keys
g.mapleader = ' '
g.maplocalleader = '\\'
