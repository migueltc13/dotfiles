return {
    {
        "nvim-treesitter/nvim-treesitter",
        event = { "BufRead", "BufNewFile" },
        cmd = { "TSInstall", "TSBufEnable", "TSBufDisable", "TSModuleInfo" },
        build = ":TSUpdate",
        dependencies = {
            -- "nvim-treesitter/nvim-treesitter-textobjects",
            "windwp/nvim-ts-autotag",
        },
        config = function()
            -- import nvim-treesitter plugin
            local treesitter = require("nvim-treesitter.configs")

            -- configure treesitter
            treesitter.setup({ -- enable syntax highlighting
            highlight = {
                enable = true,
            },
            -- enable indentation
            indent = { enable = true },
            -- enable autotagging (w/ nvim-ts-autotag plugin)
            autotag = { enable = true },
            -- ensure these language parsers are installed
            ensure_installed = {
                "python",
                "c",
                "cpp",
                "c_sharp",
                "dot",
                "doxygen",
                "haskell",
                "rust",
                "java",
                "csv",
                "json",
                "javascript",
                "typescript",
                "yaml",
                "html",
                "css",
                "markdown",
                "markdown_inline",
                "graphql",
                "bash",
                "dockerfile",
                "gitignore",
                "query",
                "regex",
                "lua",
                "vim",
                "vimdoc",
                "comment",
            },
            incremental_selection = {
                enable = true,
                keymaps = {
                    init_selection = "<C-space>",
                    node_incremental = "<C-space>",
                    scope_incremental = false,
                    node_decremental = "<bs>",
                },
            },
            -- enable nvim-ts-context-commentstring plugin for commenting tsx and jsx
            context_commentstring = {
                enable = true,
                enable_autocmd = false,
            },
        })
    end,
    }
}
