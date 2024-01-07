return {
    "nvim-treesitter/nvim-treesitter",
    event = "VeryLazy", -- Can't be "LazyFile"
    cmd = { "TSInstall", "TSBufEnable", "TSBufDisable", "TSModuleInfo" },
    build = ":TSUpdate",
    dependencies = {
        "nvim-treesitter/nvim-treesitter-context",
        "windwp/nvim-ts-autotag",
    },
    config = function()
        require("nvim-treesitter.configs").setup({
            -- enable syntax highlighting
            highlight = { enable = true },
            -- enable indentation
            indent = { enable = true },
            -- enable autotagging (w/ nvim-ts-autotag plugin)
            autotag = { enable = true },
            -- enable incremental selection
            incremental_selection = {
                enable = true,
                keymaps = {
                    init_selection = "<C-space>",
                    node_incremental = "<C-space>",
                    scope_incremental = false,
                    node_decremental = "<bs>",
                },
            },
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
        })
    end,
}
