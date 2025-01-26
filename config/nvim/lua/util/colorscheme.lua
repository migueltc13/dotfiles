local M = {}

local function main(opts)
    opts = opts or {}

    local pickers = require('telescope.pickers')
    local finders = require('telescope.finders')
    local actions = require('telescope.actions')
    local action_state = require('telescope.actions.state')
    local conf = require('telescope.config').values

    local initial_color = vim.g.colors_name
    local function escape(bufnr)
        actions.close(bufnr)
        local cmd = 'colorscheme ' .. initial_color
        vim.cmd(cmd)
    end

    local function preview(bufnr)
        local selection = action_state.get_selected_entry(bufnr)
        local cmd = 'colorscheme ' .. selection.value
        vim.cmd(cmd)
    end

    local function next_color(bufnr)
        actions.move_selection_next(bufnr)
        local selection = action_state.get_selected_entry(bufnr)
        local cmd = 'colorscheme ' .. selection.value
        vim.cmd(cmd)
    end

    local function prev_color(bufnr)
        actions.move_selection_previous(bufnr)
        local selection = action_state.get_selected_entry(bufnr)
        local cmd = 'colorscheme ' .. selection.value
        vim.cmd(cmd)
    end

    local get_colors_table = function()
        local cs = vim.fn.getcompletion('', 'color')
        table.insert(cs, 1, initial_color)
        return cs
    end

    -- load custom colorschemes before getting colors table
    require("lazy").load({ plugins = { "catppuccin", "tokyonight.nvim", "onedarkpro.nvim" } })
    local colors = get_colors_table()

    pickers.new(opts, {
        finder = finders.new_table(colors),
        sorter = conf.generic_sorter(opts),
        attach_mappings = function(bufnr, map)
            actions.select_default:replace(function()
                actions.close(bufnr)
                local selection = action_state.get_selected_entry(bufnr)
                local cmd = 'colorscheme ' .. selection.value
                vim.cmd(cmd)
            end)

            -- Exit
            map('i', '<C-c>',  escape)
            map('i', '<Esc>',  escape)
            -- Preview
            map('i', '<space>', preview)
            -- Movement
            for _, key in ipairs({'<Down>', '<C-n>', '<C-j>', '<ScrollWheelDown>'}) do
                map('i', key, next_color)
            end
            for _, key in ipairs({'<Up>', '<C-p>', '<C-k>', '<ScrollWheelUp>'}) do
                map('i', key, prev_color)
            end

            return true
        end,
        on_input_change = function(bufnr)
            local selection = action_state.get_selected_entry(bufnr)
            local cmd = 'colorscheme ' .. selection.value
            vim.cmd(cmd)
        end,
    }):find()
end

function M.change()
    local themes = require('telescope.themes')
    main(themes.get_dropdown({
        prompt_title = 'Change Colorscheme',
        layout_config = {
            width = 25,
            height = 0.60,
        },
    }))
end

return M
