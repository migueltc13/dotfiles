return {
    "akinsho/bufferline.nvim",
    version = "*",
    dependencies = "nvim-tree/nvim-web-devicons",
    config = function()
        local bufferline = require("bufferline")
        bufferline.setup({
            options = {
                mode = "tabs",
                style_preset = bufferline.style_preset.minimal, -- default
                themable = true,
                indicator = {
                    icon =  "│",
                    style = "icon",
                },
                max_name_length = 30,
                diagnostics = "nvim_lsp",
                diagnostics_update_in_insert = false,
                offsets = {
                    {
                        filetype = "neo-tree",
                        text = "File Explorer",
                        highlight = "Directory",
                        text_align = "left"
                    },
                },
                color_icons = true,
                show_buffer_close_icons = false,
                show_close_icon = false,
                show_tab_indicators = false,
                persist_buffer_sort = true, -- whether or not custom sorted buffers should persist
                move_wraps_at_ends = false, -- whether or not the move command "wraps" at the first line or last position
                separator_style = { "", "" }, -- "slant" | "thick" | "thin" | { 'any', 'any' },
                enforce_regular_tabs = false,
                always_show_bufferline = false,
            },
            highlights = {
                -- fill = {
                --     fg = "none",
                --     bg = "none",
                -- },
                -- separator = {
                --     fg = "#212121",
                --     bg = "none",
                -- },
                -- separator_selected = {
                --     fg = "#313131",
                --     bg = "none",
                -- },
            },
        })
    end
}
