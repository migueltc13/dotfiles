-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
---@diagnostic disable-next-line: undefined-field
if not vim.loop.fs_stat(lazypath) then
    vim.fn.system({
        "git",
        "clone",
        "--filter=blob:none",
        "https://github.com/folke/lazy.nvim.git",
        "--branch=stable", -- latest stable release
        lazypath,
    })
end
vim.opt.rtp:prepend(lazypath)

-- Add LazyFile event to load plugins
require("util.plugin").setup()

require("lazy").setup(
{
    { import = "plugins.ai" },
    { import = "plugins.colorscheme" },
    { import = "plugins.dap" },
    { import = "plugins.editor" },
    { import = "plugins.git" },
    { import = "plugins.lsp" },
    { import = "plugins.nav" },
    { import = "plugins.practice" },
    -- { import = "plugins.sql" },
    { import = "plugins.terminal" },
    { import = "plugins.ui" },
    { import = "plugins.util" },
},
{
    install = {
        colorscheme = { "catppuccin" }
    },
    checker = {
        enabled = true,
        notify = false,
    },
    change_detection = {
        notify = false,
    },
    ui = {
        border = "rounded",
    },
})
