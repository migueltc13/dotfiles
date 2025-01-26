return {
    "folke/which-key.nvim",
    event = "VeryLazy",
    cmd = "WhichKey",
    dependencies = {
        "nvim-tree/nvim-web-devicons",
        "echasnovski/mini.icons",
    },
    opts_extend = { "spec" },
    opts = {
        defaults = {},
        preset = "modern",
        spec = {
            {
                mode = { "n", "v" },
                { "[",             group = "prev" },
                { "]",             group = "next" },
                { "g",             group = "goto" },
                { "z",             group = "fold" },
                -- { "gs",            group = "surround" },
                { "<leader><tab>", group = "tabs" },
                { "<leader>b",     group = "buffer" },
                { "<leader>c",     group = "code" },
                { "<leader>f",     group = "find" },
                { "<leader>g",     group = "git" },
                { "<leader>gh",    group = "hunks" },
                { "<leader>q",     group = "quit/session" },
                { "<leader>s",     group = "search" },
                { "<leader>u",     group = "ui" },
                { "<leader>w",     group = "windows" },
                { "<leader>d",     group = "diagnostics/debug" },
                { "<leader>h",     group = "harpoon" },
                { "<leader>sn",    group = "noice" },
                { "<leader>ut",    group = "treesitter" },
            },
        },
        plugins = { spelling = true },
    },
    keys = {
        {
            "<leader>?",
            function()
                require("which-key").show({ global = false })
            end,
            desc = "Buffer Local Keymaps (which-key)",
        },
    },
    config = function(_, opts)
        local wk = require("which-key")
        wk.setup(opts)
        if not vim.tbl_isempty(opts.defaults) then
            vim.notify("which-key: opts.defaults is deprecated. Please use opts.spec instead.", vim.log.levels.WARN)
            wk.register(opts.defaults)
        end
    end,
}
