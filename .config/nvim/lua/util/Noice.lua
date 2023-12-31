local M = {}

function M.redirect_cmdline()
    require("noice").redirect(vim.fn.getcmdline())
end

function M.last_message()
    require("noice").cmd("last")
end

function M.history()
    require("noice").cmd("history")
end

function M.all()
    require("noice").cmd("all")
end

function M.dismiss_all()
    require("noice").cmd("dismiss")
end

function M.scroll_forward(keymap)
    if not require("noice.lsp").scroll(4) then
        return keymap
    end
end

function M.scroll_backward(keymap)
    if not require("noice.lsp").scroll(-4) then
        return keymap
    end
end

return M
