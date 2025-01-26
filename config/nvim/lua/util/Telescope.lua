local M = {}

function M.find_hidden_files()
    require("telescope.builtin").find_files({ hidden = true })
end

function M.config_files()
    return require("telescope.builtin").find_files({ cwd = vim.fn.stdpath("config") })
end

function M.grep_word()
    require("telescope.builtin").grep_string({ word_match = "-w", })
end

function M.grep_selection()
    require("telescope.builtin").grep_string()
end

---@param opts table @options for the search
function M.todos(opts)
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

    -- Get current file
    local curr_file = nil
    if opts and opts.cf then
        curr_file = vim.fn.expand("%:p")
    end

    -- Search for keywords in the current workspace
    require("telescope.builtin").grep_string({
        prompt_title = "Find Todo's",
        search = regex,
        blob = true,
        search_dirs = { curr_file },
    })
end

function M.todos_current_file()
    M.todos({ cf = true })
end

return M
