local M = {}

-- Select all text in the buffer (Creates a mark 'A' that you can jump to)
function M.select_all()
    vim.api.nvim_feedkeys('mA', 'n', true)
    vim.notify('Created mark "A"', vim.log.levels.INFO, {title = 'Select all text'})
    vim.api.nvim_feedkeys('ggVG', 'n', true)
end

return M
