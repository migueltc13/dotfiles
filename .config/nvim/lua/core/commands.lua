-- Set colorscheme using telescope
vim.api.nvim_create_user_command("Colors", function()
    vim.cmd("Lazy load onedarkpro.nvim")
    vim.cmd("Lazy load tokyonight.nvim")
    vim.cmd("Telescope colorscheme")
end, {})

-- Show keymaps using telescope
vim.api.nvim_create_user_command("Keymaps", function()
    vim.cmd("Telescope keymaps")
end, {})

-- Show command history using telescope
vim.api.nvim_create_user_command("History", function()
    vim.cmd("Telescope command_history")
end, {})

-- Run commands using telescope
vim.api.nvim_create_user_command("Commands", function()
    vim.cmd("Telescope commands")
end, {})

-- Show vim options using telescope
vim.api.nvim_create_user_command("Options", function()
    vim.cmd("Telescope options")
end, {})

-- Show vim autocommands using telescope
vim.api.nvim_create_user_command("Autocommands", function()
    vim.cmd("Telescope autocommands")
end, {})

-- Persistence sessions
vim.api.nvim_create_user_command("Persistence", function(args)

    -- Noification with vim.notify
    local lvl = vim.log.levels
    local function notify(msg, level)
        vim.notify(msg, level, { title = "Persistence" })
    end

    local default = "load"
    local option = args.args == "" and default or args.args

    if option == "save" then
        vim.cmd("silent! Neotree close") -- Close neotree before saving/loading session
        vim.cmd("lua require('persistence').save()")
        notify("Session saved", lvl.INFO)

    elseif option == "load" then
        vim.cmd("silent! Neotree close") -- Close neotree before saving/loading session
        vim.cmd("lua require('persistence').load()")
        notify("Loaded session", lvl.INFO)

    elseif option == "load_last" then
        vim.cmd("silent! Neotree close") -- Close neotree before saving/loading session
        vim.cmd("lua require('persistence').load({last=true})")
        notify("Loaded last session", lvl.INFO)

    elseif option == "stop" then
        vim.cmd("lua require('persistence').stop()")
        notify("Persistence stopped", lvl.INFO)

    elseif option == "start" then
        vim.cmd("lua require('persistence').start()")
        notify("Persistence started", lvl.INFO)

    elseif option == "list" then
        local path = vim.fn.stdpath('state') .. '/sessions/'
        -- print the list of sessions in a readable format
        local sessions = ""
        for i, session in ipairs(require('persistence').list()) do
            session = string.gsub(session, path, '')
            session = string.gsub(session, '%%', '/')
            sessions = sessions .. (i .. "\t" .. session .. "\n")
        end
        notify("Saved sessions path: " .. path .. "\n\n" .. sessions, lvl.INFO)
    else
        notify("Invalid option for `Persistence` command", lvl.ERROR)
    end
end, {
    nargs = "?", -- Set nargs to "?" to allow an optional argument
    complete = "custom,PersistenceComplete" -- Custom completion
})

-- Set completefunc for Persistence command
vim.api.nvim_command([[
  function! PersistenceComplete(ArgLead, CmdLine, CursorPos)
    return join(["load", "load_last", "save", "start", "stop", "list"], "\n")
  endfunction

  set completefunc=PersistenceComplete
  set completeopt=menu,menuone,noselect
]])

-- Todo
vim.api.nvim_create_user_command("Todo", function()
    -- Keywords to search for
    local keywords = {
        "TODO",
        "HACK",
        "NOTE", "INFO",
        "WARN", "WARNING",  "XXX",
        "TEST", "TESTING",  "PASSED",       "FAILED",
        "PERF", "OPTIM",    "PERFORMANCE",  "OPTIMIZE",
        "FIX",  "FIXME",    "BUG",          "FIXIT",    "ISSUE",
    }

    -- Convert keywords to regex
    local regex = table.concat(keywords, "|")

    -- Search for keywords in the current workspace
    require("telescope.builtin").grep_string({
        prompt_title = "Todo Telescope",
        search = regex,
        cwd = false,
    })
end, {})
