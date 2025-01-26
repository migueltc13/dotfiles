return {
    "nvim-neo-tree/neo-tree.nvim",
    branch = "v3.x",
    cmd = "Neotree",
    dependencies = {
        "nvim-lua/plenary.nvim",
        "nvim-tree/nvim-web-devicons",
        "MunifTanjim/nui.nvim",
        {
            "s1n7ax/nvim-window-picker",
            lazy = true,
            name = "window-picker",
            version = "2.*",
            config = function()
                require("window-picker").setup({
                    hint = 'floating-big-letter', -- 'statusline-winbar' | 'floating-big-letter'
                    selection_chars = '123456789',
                    show_prompt = true,
                })
            end,
        }
        -- "3rd/image.nvim", -- Image support in preview window: See `# Preview Mode` for more information
    },
    init = function()
        if vim.fn.argc(-1) == 1 then
            local stat = vim.loop.fs_stat(vim.fn.argv(0))
            if stat and stat.type == "directory" then
                require("neo-tree")
            end
        end
    end,
    deactivate = function()
        vim.cmd("Neotree close")
    end,
    opts = {
        sources = { "filesystem", "buffers", "git_status", "document_symbols" },
        open_files_do_not_replace_types = { "terminal", "Trouble", "trouble", "qf", "Outline" },
        filesystem = {
            -- bind_to_cwd = false,
            follow_current_file = { enabled = true },
            use_libuv_file_watcher = true,
            filtered_items = {
                visible = true,
                show_hidden_count = false,
                hide_dotfiles = false,
                hide_gitignored = false,
                hide_by_name = {
                    '.git',
                    '.gitignore',
                    '.DS_Store',
                    'thumbs.db',
                },
            },
            -- hijack_netrw_behavior = "open_current",
        },
        window = {
            position = "right", -- "current"
            width = 30,
            -- auto_expand_width = true,
            mappings = {
                ["<space>"] = "none",
                ["O"] = {
                    command = require("util.NeoTree").open_in_system,
                    desc = "open_with_system_default",
                },
            },
        },
        default_component_configs = {
            symlink_target = {
                enabled = true,
            },
        },
    },
}
