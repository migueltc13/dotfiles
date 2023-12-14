---@class util.ui.opts

---@class util.ui
---@overload fun(builtin:string, opts?:util.ui.opts)
local M = setmetatable({}, {
    __call = function(m, ...)
        return m.ui(...)
    end,
})

-- nvim-notify

M.notify_icons = {
    on = "🌣",
    off = "☾",
}

-- Used in ../plugins/ui/nvim-notify.lua
function M.init_status_notify()
    vim.g.status_notify = true
end

-- Used in ../plugins/ui/lualine.lua
function M.cond_status_notify()
    return vim.g.status_notify == false
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

-- Used in ../plugins/ui/lualine.lua
function M.curr_notify_icon()
    if vim.g.status_notify == true then
        return M.notify_icons.on
    else
        return M.notify_icons.off
    end
end

-- copilot

M.copilot_icons = {
    on = "🛩️",
    off = "🚫"
}

-- Used in ../plugins/copilot.lua
function M.init_copilot()
    vim.g.copilot = true
end

-- Used in ../core/keymaps.lua
function M.toggle_copilot()
    if vim.g.copilot == true then
        vim.g.copilot = false
        vim.notify("Copilot disabled", 3, { title = "copilot", icon = M.copilot_icons.off })
    else
        vim.g.copilot = true
        vim.notify("Copilot enabled", 3, { title = "copilot", icon = M.copilot_icons.on })
    end
end

return M
