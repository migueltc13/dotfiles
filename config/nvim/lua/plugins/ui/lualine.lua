local function lualine_theme()
    local colors = {
        white = "#e6e6e6",
        darkgray = "#16161d",
        gray = "#727169",
        innerbg = nil,
        outerbg = "#16161D",
        normal = "#7e9cd8",
        insert = "#98bb6c",
        visual = "#ffa066",
        replace = "#e46876",
        command = "#e6c384",
    }
    return {
        inactive = {
            a = { fg = colors.white, bg = colors.outerbg, gui = "bold" },
            b = { fg = colors.white, bg = colors.outerbg },
            c = { fg = colors.white, bg = colors.innerbg },
        },
        visual = {
            a = { fg = colors.darkgray, bg = colors.visual, gui = "bold" },
            b = { fg = colors.white, bg = colors.outerbg },
            c = { fg = colors.white, bg = colors.innerbg },
        },
        replace = {
            a = { fg = colors.darkgray, bg = colors.replace, gui = "bold" },
            b = { fg = colors.white, bg = colors.outerbg },
            c = { fg = colors.white, bg = colors.innerbg },
        },
        normal = {
            a = { fg = colors.darkgray, bg = colors.normal, gui = "bold" },
            b = { fg = colors.white, bg = colors.outerbg },
            c = { fg = colors.white, bg = colors.innerbg },
        },
        insert = {
            a = { fg = colors.darkgray, bg = colors.insert, gui = "bold" },
            b = { fg = colors.white, bg = colors.outerbg },
            c = { fg = colors.white, bg = colors.innerbg },
        },
        command = {
            a = { fg = colors.darkgray, bg = colors.command, gui = "bold" },
            b = { fg = colors.white, bg = colors.outerbg },
            c = { fg = colors.white, bg = colors.innerbg },
        },
        terminal = {
            a = { fg = colors.darkgray, bg = colors.insert, gui = "bold" },
            b = { fg = colors.white, bg = colors.outerbg },
            c = { fg = colors.white, bg = colors.innerbg },
        },
    }
end

return {
    "nvim-lualine/lualine.nvim",
    event = "VeryLazy",
    dependencies = {
        { 'nvim-tree/nvim-web-devicons', opt = true },
    },
    config = function()
        local lazy_status = require("lazy.status") -- to configure lazy pending updates count
        local toggle = require("util.toggle") -- to configure status notify

        require("lualine").setup({
            options = {
                icons_enabled = true,
                global_status = true,
                disabled_filetypes = { 'neo-tree', 'dashboard', 'dbui', 'dbout' },
                theme = lualine_theme(),
                -- theme = 'auto',
            },
            sections = {
                lualine_c = {
                    {
                        'filename',
                        -- file_status = true, -- displays file status (readonly status, modified status)
                        -- path = 0 -- 0 = just filename, 1 = relative path, 2 = absolute path
                    },
                },
                lualine_x = {
                    {
                        lazy_status.updates,
                        cond = lazy_status.has_updates,
                        color = { fg = '#ff9e64' },
                    },
                    {
                        toggle.curr_notify_icon,
                        cond = toggle.cond_status_notify,
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
        })
    end,
}
