return {
    "williamboman/mason.nvim",
    event = "LazyFile",
    cmd = {
        "Mason",
        --[[
        "MasonInstall",
        "MasonInstallAll",
        "MasonLog",
        "MasonToolsClean",
        "MasonToolsInstall",
        "MasonToolsUpdate",
        "MasonUninstall",
        "MasonUninstallAll",
        "MasonUpdate",
        ]]
    },
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
                "html",
                "cssls",
                "lua_ls",
                "graphql",
                "emmet_ls",
                "prismals",
                "pylsp",
                "bashls",
                "clangd",
                "marksman",
                "hls",
                "sqls",
            },
            -- auto-install configured servers (with lspconfig)
            automatic_installation = true,
        })

        mason_tool_installer.setup({
            ensure_installed = {
                "prettier", -- prettier formatter
                "stylua", -- lua formatter
                "eslint_d", -- js linter
            },
        })

        local install_all_opts = {
            "html-lsp",
            "css-lsp",
            "lua-language-server",
            "graphql-language-service-cli",
            "emmet-ls",
            "pylsp",
            "bash-language-server",
            "clangd",
            "marksman",
            "prettier", -- prettier formatter
            "stylua", -- lua formatter
            "eslint_d", -- js linter
        }

        -- custom cmd to install all mason binaries listed
        vim.api.nvim_create_user_command("MasonInstallAll", function()
            vim.cmd("MasonInstall " .. table.concat(install_all_opts, " "))
        end, {})
    end,
}
