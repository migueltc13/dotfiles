local M = {}

-- Select all text in the buffer (Creates a mark 'A' that you can jump to)
function M.select_all()
    vim.api.nvim_feedkeys('mA', 'n', true)
    vim.notify('Created mark "A"', vim.log.levels.INFO, {title = 'Selected all text'})
    vim.api.nvim_feedkeys('ggVG', 'n', true)
end

-- Makes current file executable
function M.make_executable()
    local filename = vim.fn.expand('%')
    vim.fn.system({'chmod', '+x', filename})

    if vim.v.shell_error == 0 then
        vim.notify(filename .. ' is now executable', vim.log.levels.INFO, {title = 'Success'})
    else
        vim.notify('Failed to make ' .. filename .. ' executable', vim.log.levels.ERROR, {title = 'Error'})
    end
end

return M
