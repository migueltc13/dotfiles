return {
    "folke/which-key.nvim",
    event = "VeryLazy",
    cmd = "WhichKey",
    opts = {
        window = {
            border = "rounded",
        },
        plugins = { spelling = true },
        defaults = {
            mode = { "n", "v" },
            ["g"] = { name = "+goto" },
            -- ["gs"] = { name = "+surround" },
            ["]"] = { name = "+next" },
            ["["] = { name = "+prev" },
            ["<leader><tab>"] = { name = "+tabs" },
            ["<leader>b"] =     { name = "+buffer" },
            ["<leader>c"] =     { name = "+code" },
            ["<leader>f"] =     { name = "+find" },
            ["<leader>g"] =     { name = "+git" },
            ["<leader>gh"] =    { name = "+hunks" },
            ["<leader>q"] =     { name = "+quit/session" },
            ["<leader>s"] =     { name = "+search" },
            ["<leader>u"] =     { name = "+ui" },
            ["<leader>w"] =     { name = "+windows" },
            ["<leader>d"] =     { name = "+diagnostics/dap/dbui" },
            ["<leader>h"] =     { name = "+harpoon" },
            ["<leader>sn"] =    { name = "+noice" },
            ["<leader>ut"] =    { name = "+treesitter" },
            -- ["<leader>x"] = { name = "+diagnostics/quickfix" },
        },
    },
    config = function(_, opts)
        local wk = require("which-key")
        wk.setup(opts)
        wk.register(opts.defaults)
    end,
}
