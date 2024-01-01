return {
    "nvim-neo-tree/neo-tree.nvim",
    branch = "v3.x",
    cmd = "Neotree",
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-tree/nvim-web-devicons",
      "MunifTanjim/nui.nvim",
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
                    '.DS_Store',
                    'thumbs.db',
                },
            },
        },
        window = {
            width = 30,
            mappings = {
                ["<space>"] = "none",
                ["O"] = {
                    command = require("util.NeoTree").open_in_system,
                    desc = "open_with_system_default",
                },
            },
        },
        default_component_configs = {
            indent = {
                with_expanders = true, -- if nil and file nesting is enabled, will enable expanders
                expander_collapsed = "",
                expander_expanded = "",
                expander_highlight = "NeoTreeExpander",
            },
        },
    },
}
