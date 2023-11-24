return {
    "stevearc/dressing.nvim",
    config = function()
        require('dressing').setup({
            input = {
                win_options = {
                    winhighlight = 'NormalFloat:DiagnosticError'
                }
            }
        })
    end,
    --init = function()
    --    ---@diagnostic disable-next-line: duplicate-set-field
    --    vim.ui.select = function(...)
    --        require("lazy").load({ plugins = { "dressing.nvim" } })
    --        return vim.ui.select(...)
    --    end
    --    ---@diagnostic disable-next-line: duplicate-set-field
    --    vim.ui.input = function(...)
    --        require("lazy").load({ plugins = { "dressing.nvim" } })
    --        return vim.ui.input(...)
    --    end
    --end,
}
