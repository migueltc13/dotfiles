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

function M.find_todos()
    -- Keywords to search for
    local keywords = {
        "TODO",
        "HACK",
        "NOTE", "INFO",
        "WARN", "WARNING",  "XXX",
        "TEST", "TESTING",  "PASSED",   "FAILED",
        "PERF", "OPTIM",    "OPTIMIZE", "PERFORMANCE",
        "FIX",  "FIXME",    "FIXIT",    "BUG",  "ISSUE",
    }

    -- Convert keywords to regex
    local regex = table.concat(keywords, "|")

    -- Search for keywords in the current workspace
    require("telescope.builtin").grep_string({
        prompt_title = "Find Todo's",
        search = regex,
        blob = true,
        cwd = false,
    })
end

return M
