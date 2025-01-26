local M = {}

-- Select all text in the buffer (Creates a mark 'A' that you can jump to)
function M.select_all()
    vim.api.nvim_feedkeys('mA', 'n', true)
    vim.notify('Created mark "A"', vim.log.levels.INFO, {title = 'Selected all text'})
    vim.api.nvim_feedkeys('ggVG', 'n', true)
end

-- Makes current file executable
function M.make_executable()
    -- Get full file path
    local filename = vim.fn.expand('%')

    -- Save the file
    local status, err = pcall(vim.api.nvim_command, 'w')
    if not status then
        vim.notify(
            'Failed to save \'' .. filename .. '\'' .. '\n' .. err,
            vim.log.levels.ERROR,
            {title = 'Failed to make file executable'}
        )
        return
    end

    -- Execute chmod +x on the file
    local output = vim.fn.system({'chmod', '+x', filename})

    -- Notify user of the result
    if vim.v.shell_error == 0 then
        vim.notify(
            '\'' .. filename .. '\' is now executable',
            vim.log.levels.INFO,
            {title = 'Success'}
        )
    else
        -- strip the last trailing newline from output
        if output:sub(-1) == "\n" then
            output = output:sub(1, -2)
        end

        vim.notify(
            output,
            vim.log.levels.ERROR,
            {title = 'Failed to make \'' .. filename .. '\' executable' }
        )
    end
end

return M
