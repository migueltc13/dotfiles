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

require("lazy").setup(
{
    { import = "plugins" },
    { import = "plugins.colorscheme" },
    { import = "plugins.git" },
    { import = "plugins.lsp" },
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
        notify = true,
    },
    ui = {
        border = "rounded",
    },
})