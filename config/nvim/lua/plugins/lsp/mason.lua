return {
    "williamboman/mason.nvim",
    cmd = {
        "Mason",
        "MasonInstall",
        "MasonInstallAll",
        "MasonLog",
        "MasonToolsClean",
        "MasonToolsInstall",
        "MasonToolsUpdate",
        "MasonUninstall",
        "MasonUninstallAll",
        "MasonUpdate",
    },
    event = "LazyFile",
    dependencies = {
        "williamboman/mason-lspconfig.nvim",
        "WhoIsSethDaniel/mason-tool-installer.nvim",
    },
    config = function()
        -- import mason
        local mason = require("mason")

        -- import mason-lspconfig
        local mason_lspconfig = require("mason-lspconfig")

        local mason_tool_installer = require("mason-tool-installer")

        -- enable mason and configure icons
        mason.setup({
            ui = {
                icons = {
                    package_installed = "✓",
                    package_pending = "➜",
                    package_uninstalled = "✗",
                },
                border = "rounded",
            },
        })

        mason_lspconfig.setup({
            -- list of servers for mason to install
            ensure_installed = {
                "tsserver",
                "html",
                "cssls",
                "tailwindcss",
                "lua_ls",
                "graphql",
                "emmet_ls",
                "prismals",
                "pyright",
                "bashls",
                "clangd",
                "marksman",
            },
            -- auto-install configured servers (with lspconfig)
            automatic_installation = true,
        })

        mason_tool_installer.setup({
            ensure_installed = {
                "prettier", -- prettier formatter
                "stylua", -- lua formatter
                -- "isort", -- python formatter
                -- "black", -- python formatter
                -- "pylint", -- python linter
                "eslint_d", -- js linter
            },
        })

        local install_all_opts = {
            "typescript-language-server",
            "html-lsp",
            "css-lsp",
            "lua-language-server",
            "graphql-language-service-cli",
            "emmet-ls",
            "pyright",
            "bash-language-server",
            "clangd",
            "marksman",
            "prettier", -- prettier formatter
            "stylua", -- lua formatter
            -- "isort", -- python formatter
            -- "black", -- python formatter
            -- "pylint", -- python linter
            "eslint_d", -- js linter
        }

        -- custom cmd to install all mason binaries listed
        vim.api.nvim_create_user_command("MasonInstallAll", function()
            vim.cmd("MasonInstall " .. table.concat(install_all_opts, " "))
        end, {})
    end,
}
