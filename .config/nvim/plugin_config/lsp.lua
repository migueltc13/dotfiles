-- Load Mason
require('mason').setup()
-- Load Mason LSP config
require('mason-lspconfig').setup({
    ensure_installed = { "lua_ls", "vimls", "bashls", "pylsp", "clangd", "marksman" }
})
-- Load fidget (LSP UI)
require("ibl").setup()

-- Setup LSP's (Note: keymaps function on_attach is defined in keymaps.vim)
require("lspconfig").lua_ls.setup   { on_attach = _G.on_attach }
require("lspconfig").vimls.setup    { on_attach = _G.on_attach }
require("lspconfig").bashls.setup   { on_attach = _G.on_attach }
require("lspconfig").pylsp.setup    {
    on_attach = _G.on_attach,
    cmd = { "pylsp", "--log-file", "/tmp/pylsp.log" },
    filetypes = { "python" },
}
require("lspconfig").clangd.setup   { on_attach = _G.on_attach }
require("lspconfig").marksman.setup { on_attach = _G.on_attach }

-- Set up nvim-cmp.
local cmp = require'cmp'

cmp.setup({
    snippet = {
        -- REQUIRED - you must specify a snippet engine
        expand = function(args)
            vim.fn["vsnip#anonymous"](args.body) -- For `vsnip` users.
            -- require('luasnip').lsp_expand(args.body) -- For `luasnip` users.
            -- require('snippy').expand_snippet(args.body) -- For `snippy` users.
            -- vim.fn["UltiSnips#Anon"](args.body) -- For `ultisnips` users.
        end,
    },
    window = {
        completion = cmp.config.window.bordered(),
        documentation = cmp.config.window.bordered(),
    },
    mapping = cmp.mapping.preset.insert({
        ['<C-b>'] = cmp.mapping.scroll_docs(-4),
        ['<C-f>'] = cmp.mapping.scroll_docs(4),
        ['<C-Space>'] = cmp.mapping.complete(),
        ['<C-e>'] = cmp.mapping.abort(),
        ['<CR>'] = cmp.mapping.confirm({ select = true }), -- Accept currently selected item. Set `select` to `false` to only confirm explicitly selected items.
    }),
    sources = cmp.config.sources({
        { name = 'nvim_lsp' },
        { name = 'vsnip' }, -- For vsnip users.
        -- { name = 'luasnip' }, -- For luasnip users.
        -- { name = 'ultisnips' }, -- For ultisnips users.
        -- { name = 'snippy' }, -- For snippy users.
    }, {
        { name = 'buffer' },
    })
})

-- Set configuration for specific filetype.
cmp.setup.filetype('gitcommit', {
    sources = cmp.config.sources({
        { name = 'git' }, -- You can specify the `git` source if [you were installed it](https://github.com/petertriho/cmp-git).
    }, {
        { name = 'buffer' },
    })
})

-- Use buffer source for `/` and `?` (if you enabled `native_menu`, this won't work anymore).
cmp.setup.cmdline({ '/', '?' }, {
    mapping = cmp.mapping.preset.cmdline(),
    sources = {
        { name = 'buffer' }
    }
})

-- Use cmdline & path source for ':' (if you enabled `native_menu`, this won't work anymore).
cmp.setup.cmdline(':', {
    mapping = cmp.mapping.preset.cmdline(),
    sources = cmp.config.sources({
        { name = 'path' }
    }, {
        { name = 'cmdline' }
    })
})

-- Set up lspconfig.
local capabilities = require('cmp_nvim_lsp').default_capabilities()
require('lspconfig')['lua_ls'].setup { capabilities = capabilities }
require('lspconfig')['vimls'].setup { capabilities = capabilities }
require('lspconfig')['bashls'].setup { capabilities = capabilities }
require('lspconfig')['pylsp'].setup { capabilities = capabilities }
require('lspconfig')['clangd'].setup { capabilities = capabilities }
require('lspconfig')['marksman'].setup { capabilities = capabilities }
-- Replace <YOUR_LSP_SERVER> with each lsp server you've enabled.
-- require('lspconfig')['<YOUR_LSP_SERVER>'].setup { capabilities = capabilities }