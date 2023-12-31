local M = {}

function M.open_vertical_term()
    local w = vim.api.nvim_win_get_width(vim.api.nvim_get_current_win()) / 2
    vim.cmd('ToggleTerm direction=vertical size=' .. tostring(w > 50 and w or 50))
end

return M
