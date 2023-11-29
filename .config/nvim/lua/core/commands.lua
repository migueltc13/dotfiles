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

-- Persistent sessions
vim.api.nvim_create_user_command("Persistent", function(args)
    -- Close neotree before loading session
    local neotree_close = true
    local neotree_close_function = function ()
        if neotree_close then vim.cmd("Neotree close") end
    end

    local default = "load"
    local option = args[1] or default
    if option == "save" then
        vim.cmd("lua require('persistence').save()")
    elseif option == "load" then
        neotree_close_function()
        vim.cmd("lua require('persistence').load()")
    elseif option == "load_last" then
        neotree_close_function()
        vim.cmd("lua require('persistence').load({last=true})")
    else
        print("Invalid option for Persistent command")
    end
end, {
    nargs = "?", -- Set nargs to "?" to allow an optional argument
    complete = "custom,PersistentComplete" -- Custom completion
})

-- Set completefunc for Persistent command
vim.api.nvim_command([[
  function! PersistentComplete(ArgLead, CmdLine, CursorPos)
    return join(["save", "load", "load_last"], "\n")
  endfunction

  set completefunc=PersistentComplete
  set completeopt=menu,menuone,noselect
]])
