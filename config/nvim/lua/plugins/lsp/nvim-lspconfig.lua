return {
    "neovim/nvim-lspconfig",
    event = "LazyFile",
    dependencies = {
        "mason.nvim",
        "hrsh7th/cmp-nvim-lsp", -- lsp source for nvim-cmp
        { "antosha417/nvim-lsp-file-operations", config = true },
        { "folke/lazydev.nvim", opts = {} },
    },
    config = function()
        -- Default LSP capabilities
        local capabilities = vim.lsp.protocol.make_client_capabilities()

        -- Override the completions capabilities with cmp-nvim-lsp
        local cmp_nvim_lsp = require("cmp_nvim_lsp")
        capabilities.textDocument.completion = cmp_nvim_lsp.default_capabilities().textDocument.completion

        -- Change the Diagnostic symbols in the sign column (gutter)
        vim.diagnostic.config({
            signs = {
                -- icons / symbols
                text = {
                    [vim.diagnostic.severity.ERROR] = " ",
                    [vim.diagnostic.severity.WARN]  = " ",
                    [vim.diagnostic.severity.INFO]  = " ",
                    [vim.diagnostic.severity.HINT]  = "󰠠 ",
                },
                -- Add underline to the section of the line with the diagnostic
                linehl = {
                    [vim.diagnostic.severity.ERROR] = "Error",
                    [vim.diagnostic.severity.WARN]  = "Warn",
                    [vim.diagnostic.severity.INFO]  = "Info",
                    [vim.diagnostic.severity.HINT]  = "Hint",
                },
                -- Add highlight color to the number column
                numhl = {
                    [vim.diagnostic.severity.ERROR] = "ErrorMsg",
                    [vim.diagnostic.severity.WARN]  = "WarningMsg",
                    [vim.diagnostic.severity.INFO]  = "DiagnosticInfo",
                    [vim.diagnostic.severity.HINT]  = "DiagnosticHint",
                },
            },
            -- set rounded borders for floating windows
            float = { border = "rounded" },
            -- show virtual text (for each diagnostic)
            virtual_text = true,
        })

        -- Default capabilities, on_attach function and handlers for all LSP servers
        vim.lsp.config("*", {
            capabilities = capabilities,
            on_attach = lsp_on_attach,
        })

        -- LSPs with default configurations
        local servers = {
            "bashls",
            "hls",
            "jdtls",
            "marksman",
            "html",
            "cssls",
            "emmet_ls",
            "graphql",
            -- "sqls",
        }

        for _, server in ipairs(servers) do
            vim.lsp.config(server, {})
            vim.lsp.enable(server)
        end

        -- configure and enable python server
        vim.lsp.config("pylsp", {
            settings = {
                pylsp = {
                    plugins = {
                        pycodestyle = {
                            -- maxLineLength = 100, -- default: 79 (E501 is ignored)
                            ignore = {
                                "E202", -- whitespace before ')'
                                "E221", -- spaces before operator
                                "E241", -- multiple spaces after ','
                                "E272", -- multiple spaces before keyword
                                "E501", -- line too long
                                "W503", -- line break before binary operator
                                "W504", -- line break after binary operator
                            }
                        }
                    }
                }
            }
        })

        vim.lsp.enable("pylsp")

        -- configure and enable lua server
        vim.lsp.config("lua_ls", {
            settings = {
                Lua = {
                    runtime = {
                        version = 'LuaJIT',
                    },
                    diagnostics = {
                        globals = { "vim", "require" },
                    },
                    workspace = {
                        -- make LS aware of runtime files
                        library = {
                            [vim.fn.expand("$VIMRUNTIME/lua")] = true,
                            [vim.fn.stdpath("config") .. "/lua"] = true,
                        },
                    },
                    completion = {
                        callSnippet = "Replace",  -- ensures function completions come with placeholders
                    },
                },
            },
        })

        vim.lsp.enable("lua_ls")

        -- configure and enable clangd server
        vim.lsp.config("clangd", {
            on_attach = lsp_on_attach,  -- ensures on_attach is set
            cmd = {
                "clangd",
                "--offset-encoding=utf-16",
            },
        })

        vim.lsp.enable("clangd")

        -- configure and enable typescript server with vue support
        vim.lsp.config("ts_ls", {
            init_options = {
                plugins = {
                    {
                        name = "@vue/typescript-plugin",
                        location = "/usr/local/lib/node_modules/@vue/language-server",
                        languages = { "vue" },
                    },
                }
            },
            filetypes = { "javascript", "javascriptreact", "typescript", "typescriptreact", "vue" },
        })

        vim.lsp.enable("ts_ls")
    end,
}
