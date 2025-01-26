return {
    'nvimdev/dashboard-nvim',
    cmd = 'Dashboard',
    lazy = true,
    init = function()
        if vim.fn.argc(-1) == 0 then
            require('dashboard')
        end
    end,
    opts = function()
        local logo1 = [[
 /$$   /$$ /$$$$$$$$  /$$$$$$  /$$    /$$ /$$$$$$ /$$      /$$
| $$$ | $$| $$_____/ /$$__  $$| $$   | $$|_  $$_/| $$$    /$$$
| $$$$| $$| $$      | $$  \ $$| $$   | $$  | $$  | $$$$  /$$$$
| $$ $$ $$| $$$$$   | $$  | $$|  $$ / $$/  | $$  | $$ $$/$$ $$
| $$  $$$$| $$__/   | $$  | $$ \  $$ $$/   | $$  | $$  $$$| $$
| $$\  $$$| $$      | $$  | $$  \  $$$/    | $$  | $$\  $ | $$
| $$ \  $$| $$$$$$$$|  $$$$$$/   \  $/    /$$$$$$| $$ \/  | $$
|__/  \__/|________/ \______/     \_/    |______/|__/     |__/
]]

        local logo2 = [[
             _             _            _      _          _        _         _   _       
            /\ \     _    /\ \         /\ \   /\ \    _ / /\      /\ \      /\_\/\_\ _   
           /  \ \   /\_\ /  \ \       /  \ \  \ \ \  /_/ / /      \ \ \    / / / / //\_\ 
          / /\ \ \_/ / // /\ \ \     / /\ \ \  \ \ \ \___\/       /\ \_\  /\ \/ \ \/ / / 
         / / /\ \___/ // / /\ \_\   / / /\ \ \ / / /  \ \ \      / /\/_/ /  \____\__/ /  
        / / /  \/____// /_/_ \/_/  / / /  \ \_\\ \ \   \_\ \    / / /   / /\/________/   
       / / /    / / // /____/\    / / /   / / / \ \ \  / / /   / / /   / / /\/_// / /    
      / / /    / / // /\____\/   / / /   / / /   \ \ \/ / /   / / /   / / /    / / /     
     / / /    / / // / /______  / / /___/ / /     \ \ \/ /___/ / /__ / / /    / / /      
    / / /    / / // / /_______\/ / /____\/ /       \ \  //\__\/_/___\\/_/    / / /       
    \/_/     \/_/ \/__________/\/_________/         \_\/ \/_________/        \/_/        
]]

        local logo3 = [[
      ___          ___          ___                                ___     
     /\  \        /\__\        /\  \         ___                  /\  \    
     \:\  \      /:/ _/_      /::\  \       /\  \      ___       |::\  \   
      \:\  \    /:/ /\__\    /:/\:\  \      \:\  \    /\__\      |:|:\  \  
  _____\:\  \  /:/ /:/ _/_  /:/  \:\  \      \:\  \  /:/__/    __|:|\:\  \ 
 /::::::::\__\/:/_/:/ /\__\/:/__/ \:\__\ ___  \:\__\/::\  \   /::::|_\:\__\
 \:\~~\~~\/__/\:\/:/ /:/  /\:\  \ /:/  //\  \ |:|  |\/\:\  \__\:\~~\  \/__/
  \:\  \       \::/_/:/  /  \:\  /:/  / \:\  \|:|  | ~~\:\/\__\\:\  \      
   \:\  \       \:\/:/  /    \:\/:/  /   \:\__|:|__|    \::/  / \:\  \     
    \:\__\       \::/  /      \::/  /     \::::/__/     /:/  /   \:\__\    
     \/__/        \/__/        \/__/       ~~~~         \/__/     \/__/    
]]

        local logos = { logo1, logo2, logo3 }
        local logo = logos[math.random(#logos)]

        logo = string.rep('\n', 4) .. logo .. '\n\n'

        local opts = {
            theme = 'doom',
            hide = {
                -- this is taken care of by lualine
                -- enabling this messes up the actual laststatus setting after loading a file
                statusline = false,
            },
            config = {
                header = vim.split(logo, '\n'),
                center = {
                    { action = 'Telescope find_files',                 desc = ' Find file',       icon = ' ', key = 'f' },
                    { action = 'enew | startinsert',                   desc = ' New file',        icon = ' ', key = 'n' },
                    { action = 'Telescope oldfiles',                   desc = ' Recent files',    icon = ' ', key = 'r' },
                    { action = 'Telescope live_grep',                  desc = ' Find text',       icon = ' ', key = 'g' },
                    { action = 'Persistence load',                     desc = ' Restore session', icon = ' ', key = 's' },
                    { action = 'Lazy',                                 desc = ' Lazy',            icon = ' ', key = 'l' },
                    { action = require("util.Telescope").config_files, desc = ' Config files',    icon = ' ', key = 'c' },
                    { action = 'qa',                                   desc = ' Quit',            icon = ' ', key = 'q' },
                },
                footer = function()
                    local stats = require('lazy').stats()
                    local ms = (math.floor(stats.startuptime * 100 + 0.5) / 100)
                    return { '⚡ Neovim loaded ' .. stats.loaded .. '/' .. stats.count .. ' plugins in ' .. ms .. 'ms' }
                end,
            },
        }

        for _, button in ipairs(opts.config.center) do
            button.desc = button.desc .. string.rep(' ', 43 - #button.desc)
            button.key_format = '  %s'
        end

        -- close Lazy and re-open when the dashboard is ready
        if vim.o.filetype == 'lazy' then
            vim.cmd.close()
            vim.api.nvim_create_autocmd('User', {
                pattern = 'DashboardLoaded',
                callback = function()
                    require('lazy').show()
                end,
            })
        end

        return opts
    end,
}
