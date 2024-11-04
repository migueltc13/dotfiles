return {
    "akinsho/toggleterm.nvim",
    cmd = {
        "ToggleTerm",
        -- "ToggleTermSendCurrentLine",
        -- "ToggleTermSendVisualLines",
        -- "ToggleTermSendVisualSelection",
        -- "ToggleTermSetName",
        -- "ToggleTermToggleAll",
        "TermExec",
        "Terminal",
    },
    version = "*",
    config = function()
        local toggleterm = require("toggleterm")
        toggleterm.setup{
            size = function(term)
                if term.direction == "vertical" then
                    return vim.o.columns * 0.4
                elseif term.direction == "horizontal" then
                    return vim.opt.lines._value * 0.4
                end
            end,
            float_opts = {
                border = "rounded",
            },
        }

        -- Alias Terminal to ToggleTerm
        local commandline = require("toggleterm.commandline")
        vim.api.nvim_create_user_command(
            "Terminal",
            function(opts) toggleterm.toggle_command(opts.args, opts.count) end,
            { count = true, complete = commandline.toggle_term_complete, nargs = "*" }
        )
    end,
}
