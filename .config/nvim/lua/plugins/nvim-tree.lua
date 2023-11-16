return {
    "nvim-tree/nvim-tree.lua",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    lazy = true,
    event = {"VimEnter", "BufWinEnter"},
    config = function()
        local function _on_attach(bufnr)
            local api = require "nvim-tree.api"

            local function opts(desc)
                return { desc = "nvim-tree: " .. desc, buffer = bufnr, noremap = true, silent = true, nowait = true }
            end

            -- default mappings
            api.config.mappings.default_on_attach(bufnr)

            -- custom mappings
            -- Disable <C-t> to open a new tab (
            vim.keymap.set('n', '<C-t>', '<cmd>:NvimTreeToggle<CR>', opts('Toggle'))
            vim.keymap.set('n', '?', api.tree.toggle_help, opts('Help'))
        end

        require('nvim-tree').setup({
            on_attach = _on_attach,

            renderer = {
                icons = {
                    glyphs = {
                        folder = {
                            arrow_closed = "",
                            arrow_open = "",
                        }
                    }
                }
            }
        })
    end
}
