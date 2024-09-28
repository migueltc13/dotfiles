return {
    -- Live share for Neovim
    "azratul/live-share.nvim",
    dependencies = {
        "jbyuki/instant.nvim",
    },
    -- lazy = true,
    event = "VeryLazy",
    config = function()
        vim.g.instant_username = os.getenv("USER")
    end,
}
