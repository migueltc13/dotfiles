local o = vim.opt
local g = vim.g

-- General settings
o.termguicolors = true               -- Enable true color support (24 bits)
o.encoding = "UTF-8"                 -- UTF-8 byte sequence
o.updatetime = 400                   -- Decrease update time (default 4000 ms)
o.timeoutlen = 200                   -- Mapped sequences time (default 1000 ms)
o.number = true                      -- Show line numbers
o.relativenumber = true              -- Show relative line numbers
o.signcolumn = "yes"                 -- Keep signcolumn on by default
o.colorcolumn = "80"                 -- Set color column to 80
o.scrolloff = 4                      -- Minimal number of lines to keep above/below the cursor
g.lazyredraw = true                  -- Enable lazyredraw

-- Indentation settings
o.autoindent = true                  -- Enable auto-indentation
o.smartindent = true                 -- Enable smart-indentation
o.smarttab = true                    -- Use smart tabs
o.shiftwidth = 4                     -- Set the number of spaces for auto-indent
o.tabstop = 4                        -- Set the number of spaces for a tab character
o.softtabstop = 4                    -- Set soft tabstop
o.expandtab = true                   -- Expand tabs to spaces
o.breakindent = true                 -- Enable break indent
o.list = true                        -- Display tabs and trailing spaces visually
o.listchars = "tab:▸ ,trail:·"       -- Set listchars for tabs and trailing spaces
o.wrap = false                       -- Disable line wrap
-- o.whichwrap = "b,s,<,>,[,]"          -- Allows wrap when using arrow keys
o.virtualedit = "block"              -- Allow cursor to move anywhere in visual block mode

-- Search settings
o.hlsearch = false                   -- Disable search highlighting
o.incsearch = true                   -- Enable search patterns highlighting
o.ignorecase = true                  -- Ignore case when searching
o.smartcase = true                   -- Ignore case when searching lowercase

-- Window settings
o.splitbelow = true                  -- Horizontal splits will automatically be below
o.splitright = true                  -- Vertical splits will automatically be to the right

-- Mouse settings
o.mouse = "a"                        -- Enable mouse support in all modes
o.mousemodel = "popup_setpos"        -- Set mouse model to popup_setpos
o.mousefocus = false                 -- Disable mouse focus
o.mousescroll = "ver:1,hor:3"        -- Set mouse scroll speed (default ver:3,hor:6)
o.mousetime = 400                    -- Set double click speed time (default 500 ms)
o.mousemoveevent = false             -- Disable mouse move event
o.mousehide = true                   -- Enable mouse hide when typing

-- Clipboard settings
o.clipboard = "unnamed"

-- Undo settings
o.undofile = true
o.undolevels = 10000
o.undodir = vim.fn.stdpath('state') .. '/undodir'

-- Spell settings
o.spell = false                      -- Disable spell checking
o.spelllang = "en,pt_pt"             -- Set spell language to English and Portuguese (Portugal)
o.spellfile = vim.fn.stdpath('config') .. '/spell/custom.utf-8.add'

-- Disable netrw and its plugins
g.loaded_netrw = 1
g.loaded_netrwPlugin = 1

-- Disable ruby provider
g.loaded_ruby_provider = 0

-- Python 3 executable
g.python3_host_prog = vim.split(vim.fn.system('which python3'), '\n')[1]

-- Set leader and local leader keys
g.mapleader = ' '
g.maplocalleader = '\\'
