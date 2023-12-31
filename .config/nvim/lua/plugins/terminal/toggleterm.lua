return {
    "akinsho/toggleterm.nvim",
    cmd = {
        "ToggleTerm",
        "ToggleTermSendCurrentLine",
        "ToggleTermSendVisualLines",
        "ToggleTermSendVisualSelection",
        "ToggleTermSetName",
        "ToggleTermToggleAll",
    },
    version = "*",
    config = function()
        require("toggleterm").setup{
            float_opts = {
                border = "rounded",
            },
        }
    end,
}
