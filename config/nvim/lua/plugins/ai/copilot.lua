return {
    "zbirenbaum/copilot.lua",
    cmd = "Copilot",
    event = "InsertEnter",
    config = function()
        require('copilot').setup({
            panel = {
                enabled = true,
                auto_refresh = true,
                keymap = {
                    jump_prev = "[[",
                    jump_next = "]]",
                    accept = "<CR>",
                    refresh = "gr",
                    open = "<M-c>",
                },
                layout = {
                    position = "bottom", -- top | bottom | left | right
                    ratio = 0.4,
                },
            },
            suggestion = {
                enabled = true,
                auto_trigger = true,
                debounce = 75,
                keymap = {
                    accept = "<M-CR>",
                    accept_word = false,
                    accept_line = false,
                    next = "<M-n>",
                    prev = "<M-p>",
                    dismiss = "<M-]>",
                },
            },
            filetypes = {
                yaml = true, -- default: false
                markdown = true, -- default: false
                help = true, -- default: false
                gitcommit = true, -- default: false
                gitrebase = true, -- default: false
                hgcommit = true, -- default: false
                svn = true, -- default: false
                cvs = true, -- default: false
                ["."] = false,
            },
            copilot_node_command = 'node', -- Node.js version must be > 16.x
            server_opts_overrides = {},
        })
        -- Remove legacy commands
        vim.cmd("silent! delcommand CopilotAuth")
        vim.cmd("silent! delcommand CopilotDetach")
        vim.cmd("silent! delcommand CopilotPanel")
        vim.cmd("silent! delcommand CopilotStop")
    end,
}
