local M = {}

local level = vim.log.levels.INFO

function M.option(option)
    ---@diagnostic disable-next-line: assign-type-mismatch
    vim.wo[option] = not vim.wo[option]
    local status = vim.wo[option] and "on" or "off"
    vim.notify(option .. ": " .. status, level, { title = "Toggle option" })
end

function M.spell()
    M.option("spell")
end

function M.wrap()
    M.option("wrap")
end

function M.rnu()
    M.option("relativenumber")
end

function M.numbers()
    vim.wo.number = not vim.wo.number
    vim.wo.relativenumber = vim.wo.number
    local status = vim.wo.number and "on" or "off"
    vim.notify("number: " .. status .. " | relativenumber: " .. status, level, { title = "Toggle option" })
end

local diagnostics_status = true
function M.diagnostics()
    diagnostics_status = not diagnostics_status
    if diagnostics_status then
        vim.diagnostic.enable()
        vim.notify("Enabled diagnostics", level, { title = "Toggle diagnostics" })
    else
        vim.diagnostic.disable()
        vim.notify("Disabled diagnostics", level, { title = "Toggle diagnostics" })
    end
end

function M.conceallevel()
    vim.o.conceallevel = vim.o.conceallevel > 0 and 0 or 3
    vim.notify("conceallevel: " .. vim.o.conceallevel, level, { title = "Toggle option" })
end

function M.inlay_hint()
    if vim.lsp.inlay_hint then
        vim.lsp.inlay_hint(0, nil)
        if vim.lsp.inlay_hint.is_enabled() then
            vim.notify("inlay hints enabled", level, { title = "Toggle option" })
        else
            vim.notify("inlay hints disabled", level, { title = "Toggle option" })
        end
    else
        vim.notify("inlay hints not available", level, { title = "Toggle option" })
    end
end

function M.treesitter()
    if vim.b.ts_highlight then
        vim.treesitter.stop()
        vim.notify("Disabled highlighting", level, { title = "Toggle Treesitter" })
    else
        vim.treesitter.start()
        vim.notify("Enabled highlighting", level, { title = "Toggle Treesitter" })
    end
end

return M
