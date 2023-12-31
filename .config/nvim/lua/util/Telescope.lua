local M = {}

function M.find_hidden_files()
    require("telescope.builtin").find_files({ hidden = true })
end

function M.grep_word()
    require("telescope.builtin").grep_string({ cwd = false, word_match = "-w", })
end

function M.grep_selection()
    require("telescope.builtin").grep_string({ cwd = false, })
end

function M.config_files()
    return require("telescope.builtin").find_files({ cwd = vim.fn.stdpath("config") })
end

return M
