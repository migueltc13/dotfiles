local M = {}

function M.git_status()
    require("neo-tree.command").execute({ source = "git_status", toggle = true })
end

function M.buffers()
    require("neo-tree.command").execute({ source = "buffers", toggle = true })
end

return M
