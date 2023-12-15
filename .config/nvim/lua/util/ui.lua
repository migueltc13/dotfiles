-- ---@class util.ui
-- ---@overload fun(builtin:string, opts?:util.ui.opts)
-- local M = setmetatable({}, {
--     __call = function(m, ...)
--         return m.ui(...)
--     end,
-- })

local M = {}

-- nvim-notify

M.notify_icons = {
    on = "🌣",
    off = "☾",
}

vim.g.status_notify = true

-- Used in ../plugins/ui/lualine.lua
function M.cond_status_notify()
    return vim.g.status_notify == false
end

-- Used in ../plugins/ui/lualine.lua
function M.curr_notify_icon()
    if vim.g.status_notify == true then
        return M.notify_icons.on
    else
        return M.notify_icons.off
    end
end

-- Used in ../core/keymaps.lua
function M.toggle_notify()
    if vim.g.status_notify == true then
        vim.g.status_notify = false
        require("notify").dismiss()
        vim.notify("Notifications disabled", 3, { title = "nvim-notify", icon = M.notify_icons.off })
    else
        vim.g.status_notify = true
        -- setup using ../plugins/ui/nvim-notify.lua
        require("plugins.ui.nvim-notify").config()
        vim.notify("Notifications enabled", 3, { title = "nvim-notify", icon = M.notify_icons.on })
    end
end

-- copilot

M.copilot_icons = {
    on = "🛩️",
    off = "🚫"
}

local copilot_status = true

function M.toggle_copilot()
    if copilot_status == true then
        copilot_status = false
        vim.cmd("Copilot disable")
        vim.notify("Copilot disabled", 3, { title = "copilot", icon = M.copilot_icons.off })
    else
        copilot_status = true
        vim.cmd("Copilot enable")
        vim.notify("Copilot enabled", 3, { title = "copilot", icon = M.copilot_icons.on })
    end
end

return M
