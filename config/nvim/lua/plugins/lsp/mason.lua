return {
    "williamboman/mason.nvim",
    version = "v1.x",
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
        {
            "williamboman/mason-lspconfig.nvim",
            version = "v1.x",
        },
        "WhoIsSethDaniel/mason-tool-installer.nvim",
    },
    config = function()
        -- enable mason and configure icons
        require("mason").setup({
            ui = {
                icons = {
                    package_installed = "✓",
                    package_pending = "➜",
                    package_uninstalled = "✗",
                },
                border = "rounded",
            }
        })

        require("mason-lspconfig").setup({
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

        require("mason-tool-installer").setup({
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
