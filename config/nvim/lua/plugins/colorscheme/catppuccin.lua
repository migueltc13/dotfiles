return {
    "catppuccin/nvim",
    name = "catppuccin",
    priority = 1000,
    -- lazy = true,
    config = function()
        require("catppuccin").setup({
            transparent_background = true,
            float = {
                transparent = true, -- enable transparent floating windows
                solid = "rounded", -- use solid styling for floating windows, see |winborder|
            },
            integrations = {
                aerial = true,
                alpha = true,
                cmp = true,
                dashboard = true,
                flash = true,
                gitsigns = true,
                headlines = true,
                illuminate = true,
                indent_blankline = {
                    enabled = true,
                    scope_color = "",
                    colored_indent_levels = false,
                },
                leap = true,
                lsp_trouble = true,
                mason = true,
                markdown = true,
                mini = true,
                native_lsp = {
                    enabled = true,
                    underlines = {
                        errors = { "undercurl" },
                        hints = { "undercurl" },
                        warnings = { "undercurl" },
                        information = { "undercurl" },
                    },
                },
                navic = { enabled = true, custom_bg = "lualine" },
                neotest = true,
                neotree = true,
                noice = true,
                notify = false,
                semantic_tokens = true,
                telescope = true,
                treesitter = true,
                treesitter_context = true,
                which_key = true,
            }
        })
        vim.cmd("colorscheme catppuccin")
    end,
}
