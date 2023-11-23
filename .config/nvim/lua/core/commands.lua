-- Set colorscheme using telescope
vim.api.nvim_create_user_command("Colors", function()
    vim.cmd("Lazy load onedark.nvim")
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

-- last-command
local function init_last_command()
    G_last_cmd = ''
    G_last_dir = ''
end

init_last_command()

function G_save_last_cmd()
    -- Get last command from bash history
    G_last_cmd = vim.fn.system('cat ~/.bash_history | tail -n 1')
    -- Save last dir
    G_last_dir = vim.fn.system('cat /tmp/last_dir')
    -- Print command
    print('Saved command: ' .. G_last_cmd )
    -- print('Saved dir: ' .. G_last_dir )
    -- Escape special characters
    G_last_cmd = string.gsub(G_last_cmd, "'", "\\'")
    G_last_dir = string.gsub(G_last_dir, "'", "\\'")
    G_last_cmd = string.gsub(G_last_cmd, '\\', '\\\\')
    G_last_dir = string.gsub(G_last_dir, '\\', '\\\\')
    -- Strip trailing newline
    G_last_cmd = string.gsub(G_last_cmd, '\n', '')
    G_last_dir = string.gsub(G_last_dir, '\n', '')
    -- Add surrounding quotes
    G_last_dir = "'" .. G_last_dir .. "'"
    G_last_cmd = "'" .. G_last_cmd .. "'"
    -- write last dir to file
    vim.fn.system('echo ' .. G_last_dir .. ' > /tmp/last_saved_dir')
end

-- function G_edit_last_cmd()
--     -- Open a float window to edit the last command
--     vim.cmd('TermExec cmd="clear"')
--     vim.cmd('TermExec cmd=\'cd "$(cat /tmp/last_saved_dir)"\'')
--     -- TODO open plenary float window
--     -- vim.cmd('TermExec cmd=\'nvim -c "set splitright | 10split | wincmd j | setlocal buftype=nofile bufhidden=hide noswapfile" /tmp/last_saved_cmd\'')
-- end

function G_run_last_cmd()
    -- vim.cmd('TermExec cmd="clear"')
    vim.cmd('TermExec cmd=\'cd "$(cat /tmp/last_saved_dir)"\'')
    vim.cmd('TermExec cmd=' .. G_last_cmd)
end
