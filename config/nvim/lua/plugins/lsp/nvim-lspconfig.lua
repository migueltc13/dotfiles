return {
	"neovim/nvim-lspconfig",
	event = "LazyFile",
	dependencies = {
		"mason.nvim",
		"hrsh7th/cmp-nvim-lsp", -- lsp source for nvim-cmp
		-- { "antosha417/nvim-lsp-file-operations", config = true },
	},
	config = function()
		-- import lspconfig plugin
		local lspconfig = require("lspconfig")

		-- import cmp-nvim-lsp plugin
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

		-- used to enable autocompletion (assign to every lsp server config)
		local capabilities = cmp_nvim_lsp.default_capabilities()
		-- local capabilities = vim.lsp.protocol.make_client_capabilities()

		-- Change the Diagnostic symbols in the sign column (gutter)
		local signs = { Error = " ", Warn = " ", Hint = "󰠠 ", Info = " " }
		for type, icon in pairs(signs) do
			local hl = "DiagnosticSign" .. type
			vim.fn.sign_define(hl, { text = icon, texthl = hl, numhl = "" })
		end

		-- configure html server
		lspconfig["html"].setup({
			capabilities = capabilities,
			on_attach = lsp_on_attach,
			handlers = handlers,
		})

		-- configure typescript server with plugin
		lspconfig["tsserver"].setup({
			capabilities = capabilities,
			on_attach = lsp_on_attach,
			handlers = handlers,
		})

		-- configure css server
		lspconfig["cssls"].setup({
			capabilities = capabilities,
			on_attach = lsp_on_attach,
			handlers = handlers,
		})

		-- configure graphql language server
		lspconfig["graphql"].setup({
			capabilities = capabilities,
			on_attach = lsp_on_attach,
			handlers = handlers,
			filetypes = { "graphql", "gql", "svelte", "typescriptreact", "javascriptreact" },
		})

		-- configure emmet language server
		lspconfig["emmet_ls"].setup({
			capabilities = capabilities,
			on_attach = lsp_on_attach,
			handlers = handlers,
			filetypes = { "html", "typescriptreact", "javascriptreact", "css", "sass", "scss", "less", "svelte" },
		})

		-- configure python server
		lspconfig["pyright"].setup({
			capabilities = capabilities,
			on_attach = lsp_on_attach,
			handlers = handlers,
		})

		-- configure lua server (with special settings)
		lspconfig["lua_ls"].setup({
			capabilities = capabilities,
			on_attach = lsp_on_attach,
			handlers = handlers,
			settings = { -- custom settings for lua
				Lua = {
					-- make the language server recognize "vim" global
					diagnostics = {
						globals = { "vim" },
					},
					workspace = {
						-- make language server aware of runtime files
						library = {
							[vim.fn.expand("$VIMRUNTIME/lua")] = true,
							[vim.fn.stdpath("config") .. "/lua"] = true,
						},
					},
				},
			},
		})

		-- configure bash server
		lspconfig["bashls"].setup({
			capabilities = capabilities,
			on_attach = lsp_on_attach,
			handlers = handlers,
		})

		-- configure clangd server
		lspconfig["clangd"].setup({
			capabilities = capabilities,
			on_attach = lsp_on_attach,
			handlers = handlers,
			cmd = {
				"clangd",
				"--offset-encoding=utf-16",
			},
		})

		-- configure marksman server
		lspconfig["marksman"].setup({
			capabilities = capabilities,
			on_attach = lsp_on_attach,
			handlers = handlers,
		})

        -- configure java server
        -- lspconfig["java-language-server"].setup({
        --     capabilities = capabilities,
        --     on_attach = lsp_on_attach,
        --     handlers = handlers,
        -- })

        -- configure java server
        lspconfig["jdtls"].setup({
            capabilities = capabilities,
            on_attach = lsp_on_attach,
            handlers = handlers,
        })

		-- configure sqls server
		-- lspconfig["sqls"].setup({
		-- 	capabilities = capabilities,
		-- 	on_attach = lsp_on_attach,
		-- 	handlers = handlers,
		-- })
	end,
}
