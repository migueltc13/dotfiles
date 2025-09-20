return {
    "nvim-telescope/telescope.nvim",
    cmd = "Telescope",
    branch = "master", -- or "0.1.x" (deprecated)
    dependencies = {
        "nvim-lua/plenary.nvim",
        "nvim-tree/nvim-web-devicons",
        "nvim-treesitter/nvim-treesitter",
        { "nvim-telescope/telescope-fzf-native.nvim", build = "make" },
    },
    config = function()
        local telescope = require("telescope")
        local actions = require("telescope.actions")
        telescope.setup({
            defaults = {
                mappings = {
                    i = {
                        -- close with escape
                        ["<esc>"] = actions.close,
                        -- move up and down with Ctrl + k/j and mouse scroll
                        ["<C-j>"] = actions.move_selection_next,
                        ["<C-k>"] = actions.move_selection_previous,
                        ["<ScrollWheelDown>"] = actions.move_selection_next,
                        ["<ScrollWheelUp>"] = actions.move_selection_previous,
                        -- cycle history with Ctrl + n/p
                        ["<C-n>"] = actions.cycle_history_prev,
                        ["<C-p>"] = actions.cycle_history_next,
                    },
                },
            }
        })
        telescope.load_extension("fzf")
        telescope.load_extension("notify")
    end,
}
