return {
    "akinsho/toggleterm.nvim",
    version = "*",
    config = function()
        require("toggleterm").setup{
            float_opts = {
                border = "rounded",
            },
        }
    end,
}
