return {
    "nvim-telescope/telescope.nvim",
    event = "VeryLazy",
    branch = "0.1.x",
    dependencies = {
        "nvim-lua/plenary.nvim",
        "nvim-tree/nvim-web-devicons",
        { "nvim-telescope/telescope-fzf-native.nvim", build = "make" },
    },
    config = function()
        require("telescope").setup()
        require("telescope").load_extension("fzf")
        require("telescope").load_extension("notify")
    end,
}
