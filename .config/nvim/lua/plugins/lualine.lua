return {
    {
        'linrongbin16/lsp-progress.nvim',
        dependencies = { 'nvim-tree/nvim-web-devicons' },
        config = function()
            require('lsp-progress').setup()
        end,
    },
    {
        "nvim-lualine/lualine.nvim",
        dependencies = {
            { 'nvim-tree/nvim-web-devicons', opt = true },
            'linrongbin16/lsp-progress.nvim',
        },
        config = function()
            local lazy_status = require("lazy.status") -- to configure lazy pending updates count

            require('lualine').setup {
                options = {
                    icons_enabled = true,
                    theme = 'auto',
                },
                sections = {
                    lualine_c = {
                        {
                            'filename',
                            -- file_status = true, -- displays file status (readonly status, modified status)
                            -- path = 0 -- 0 = just filename, 1 = relative path, 2 = absolute path
                        },
                        {
                            function()
                                return require('lsp-progress').progress({
                                    -- max_size = 80,
                                })
                            end,
                        }
                    },
                    lualine_x = {
                        {
                            lazy_status.updates,
                            cond = lazy_status.has_updates,
                            color = { fg = '#ff9e64' },
                        },
                        { "encoding" },
                        { "fileformat" },
                        { "filetype" }
                    }
                },
                inactive_sections = {
                    lualine_c = { { 'filename', file_status = false } },
                    lualine_x = {}, -- default: { 'location' }
                },
            }
        end,
    }
}
