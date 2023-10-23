require('mason').setup()
require('mason-lspconfig').setup({
    ensure_installed = { "lua_ls", "vimls", "bashls", "pylsp", "clangd", "marksman" }
})

require("lspconfig").lua_ls.setup {}
require("lspconfig").vimls.setup {}
require("lspconfig").bashls.setup {}
require("lspconfig").pylsp.setup {}
require("lspconfig").clangd.setup {}
require("lspconfig").marksman.setup {}
