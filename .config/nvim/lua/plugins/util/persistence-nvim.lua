return {
    "folke/persistence.nvim",
    event = "VeryLazy",
    opts = {
        options = vim.opt.sessionoptions:get()
    },
}
