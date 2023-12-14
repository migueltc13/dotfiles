return {
    "nvim-neo-tree/neo-tree.nvim",
    cmd = "Neotree",
    event = "VeryLazy",
    branch = "v3.x",
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-tree/nvim-web-devicons",
      "MunifTanjim/nui.nvim",
      -- "3rd/image.nvim", -- Image support in preview window: See `# Preview Mode` for more information
    },
    deactivate = function()
        vim.cmd([[Neotree close]])
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
                show_hidden_count = true,
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
                    command = function(state)
                        local node = state.tree:get_node()
                        local filepath = node.path
                        -- local osType = os.getenv("OS")

                        local command = "xdg-open '" .. filepath .. "'"
                        vim.cmd("!" .. command)

                        -- if osType == "Windows_NT" then
                        --     command = "start " .. filepath
                        -- elseif osType == "Darwin" then
                        --     command = "open " .. filepath
                        -- else
                        --     command = "xdg-open " .. filepath
                        -- end
                        -- os.execute(command)
                    end,
                    desc = "open_with_system_defaults",
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
    -- config = function(_, opts)
    --     -- TODO: Implement this lsp.on_rename function
    --     local function on_move(data)
    --         require("util").lsp.on_rename(data.source, data.destination)
    --     end
    --
    --     local events = require("neo-tree.events")
    --     opts.event_handlers = opts.event_handlers or {}
    --     vim.list_extend(opts.event_handlers, {
    --         { event = events.FILE_MOVED, handler = on_move },
    --         { event = events.FILE_RENAMED, handler = on_move },
    --     })
    --     require("neo-tree").setup(opts)
    --     vim.api.nvim_create_autocmd("TermClose", {
    --         pattern = "*lazygit",
    --         callback = function()
    --             if package.loaded["neo-tree.sources.git_status"] then
    --                 require("neo-tree.sources.git_status").refresh()
    --             end
    --         end,
    --     })
    -- end,
}
