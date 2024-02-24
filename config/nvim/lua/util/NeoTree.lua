local M = {}

-- Open file with system default application
function M.open_in_system(state)
    local node = state.tree:get_node()
    local filepath = node.path
    local osType = os.getenv("OS")

    local command = ""
    if osType == "Windows_NT" then
        command = "start '" .. filepath .. "'"
    elseif osType == "Darwin" then
        command = "open '" .. filepath .. "' &>/dev/null &"
    else
        command = "xdg-open '" .. filepath .. "' &>/dev/null &"
    end

    vim.notify("Opening " .. filepath, vim.log.levels.INFO, { title = "NeoTree" })
    os.execute(command)
end

-- Keymaps functions for NeoTree
function M.git_status()
    require("neo-tree.command").execute({ source = "git_status", toggle = true })
end

function M.buffers()
    require("neo-tree.command").execute({ source = "buffers", toggle = true })
end

return M
