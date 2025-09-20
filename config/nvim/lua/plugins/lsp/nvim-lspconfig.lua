return {
    "neovim/nvim-lspconfig",
    event = "LazyFile",
    dependencies = {
        "mason.nvim",
        "hrsh7th/cmp-nvim-lsp", -- lsp source for nvim-cmp
        -- { "antosha417/nvim-lsp-file-operations", config = true },
    },
    config = function()
        local cmp_nvim_lsp = require("cmp_nvim_lsp")

        -- set rounded borders for floating windows
        vim.diagnostic.config({
            float = { border = "rounded" },
        })
        local handlers = {
            ["textDocument/hover"] = vim.lsp.with(vim.lsp.handlers.hover, { border = "rounded" }),
            ["textDocument/signatureHelp"] = vim.lsp.with(vim.lsp.handlers.signature_help, { border = "rounded" }),
        }
        require("lspconfig.ui.windows").default_options.border = "rounded"

        -- Default LSP capabilities (completions capabilities are overridden by cmp-nvim-lsp)
        local capabilities = vim.lsp.protocol.make_client_capabilities()
        capabilities.textDocument.completion = cmp_nvim_lsp.default_capabilities().textDocument.completion

        -- Change the Diagnostic symbols in the sign column (gutter)
        local signs = { Error = " ", Warn = " ", Hint = "󰠠 ", Info = " " }
        for type, icon in pairs(signs) do
            local hl = "DiagnosticSign" .. type
            vim.fn.sign_define(hl, { text = icon, texthl = hl, numhl = "" })
        end

        -- LSPs with default configurations
        local servers = {
            "bashls",
            "hls",
            "pylsp",
            "lua_ls",
            "jdtls",
            "marksman",
            "html",
            "cssls",
            "emmet_ls",
            "graphql",
            -- "sqls",
        }

        for _, server in ipairs(servers) do
            vim.lsp.config(server, {
                capabilities = capabilities,
                on_attach = lsp_on_attach,
                handlers = handlers,
            })
            vim.lsp.enable(server)
        end

        -- configure and enable python server
        vim.lsp.config("pylsp", {
            capabilities = capabilities,
            on_attach = lsp_on_attach,
            handlers = handlers,
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
            capabilities = capabilities,
            on_attach = lsp_on_attach,
            handlers = handlers,
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
                },
            },
        })

        vim.lsp.enable("lua_ls")

        -- configure and enable clangd server
        vim.lsp.config("clangd", {
            capabilities = capabilities,
            on_attach = lsp_on_attach,
            handlers = handlers,
            cmd = {
                "clangd",
                "--offset-encoding=utf-16",
            },
        })

        vim.lsp.enable("clangd")

        -- configure and enable typescript server with vue support
        vim.lsp.config("ts_ls", {
            capabilities = capabilities,
            on_attach = lsp_on_attach,
            handlers = handlers,
            init_options = {
                plugins = {
                    {
                        name = "@vue/typescript-plugin",
                        location = "/usr/local/lib/node_modules/@vue/language-server",
                        languages = { "vue" },
                    },
                }
            },
            filetypes = { "javascript", "vue" },
        })

        vim.lsp.enable("ts_ls")
    end,
}
