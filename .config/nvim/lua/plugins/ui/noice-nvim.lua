return {
    "folke/noice.nvim",
    dependencies = {
        { "MunifTanjim/nui.nvim", lazy = true },
        "rcarriga/nvim-notify",
    },
    config = function()
        require("noice").setup({
            cmdline = {
                format = {
                    filter = { title = " Shell " },
                },
            },
            lsp = {
                override = {
                    ["vim.lsp.util.convert_input_to_markdown_lines"] = true,
                    ["vim.lsp.util.stylize_markdown"] = true,
                    ["cmp.entry.get_documentation"] = true,
                },
            },
            routes = {
                {
                    filter = {
                        event = "msg_show",
                        any = {
                            { find = "%d+L, %d+B" },
                            { find = "; after #%d+" },
                            { find = "; before #%d+" },
                        },
                    },
                    view = "mini",
                },
            },
            presets = {
                bottom_search = false,
                command_palette = true,
                long_message_to_split = true,
                inc_rename = true,
                lsp_doc_border = true,
            },
        })
    end,
}
