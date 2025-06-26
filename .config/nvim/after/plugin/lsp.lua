require("mason").setup()
--require("mason-lspconfig").setup({
--    ensure_installed = { "lua_ls", "clangd"},
--    automatic_installation = true,
--})

local capabilities = vim.lsp.protocol.make_client_capabilities()
capabilities = vim.tbl_deep_extend("force", capabilities, require('cmp_nvim_lsp').default_capabilities())

local lspconfig = require("lspconfig")
lspconfig["pylsp"].setup {
  settings = {
    python = {
      analysis = {
        diagnosticSeverity = {
            ["E"] = "none",  -- Example: Disable errors
            ["W"] = "none",  -- Example: Disable warnings
            ["C"] = "none",  -- Example: Disable conventions
            ["N"] = "none",  -- Example: Disable naming conventions
            ["F"] = "none",  -- Example: Disable flakes-specific errors
        },
      },
    },
    pylsp = {
        plugins = {
            pycodestyle = {
                ignore = {"E", "W", "C", "N", "F"}, -- Or specific codes
            },
        },
    },
  },
}

lspconfig.gdscript.setup{capabilities = capabilities}
lspconfig.lua_ls.setup{ capabilities = capabilities }

vim.opt.signcolumn = 'yes'

--]]

-- This is where you enable features that only work
-- if there is a language server active in the file
vim.api.nvim_create_autocmd('LspAttach', {
    desc = 'LSP actions',
    callback = function(event)
        local opts = {buffer = event.buf}
        vim.keymap.set('n', 'K', '<cmd>lua vim.lsp.buf.hover()<cr>', opts)
        vim.keymap.set('n', 'gd', '<cmd>lua vim.lsp.buf.definition()<cr>', opts)
        vim.keymap.set('n', 'gD', '<cmd>lua vim.lsp.buf.declaration()<cr>', opts)
        vim.keymap.set('n', 'gi', '<cmd>lua vim.lsp.buf.implementation()<cr>', opts)
        vim.keymap.set('n', 'go', '<cmd>lua vim.lsp.buf.type_definition()<cr>', opts)
        vim.keymap.set('n', 'gr', '<cmd>lua vim.lsp.buf.references()<cr>', opts)
        vim.keymap.set('n', 'gs', '<cmd>lua vim.lsp.buf.signature_help()<cr>', opts)
        vim.keymap.set('n', '<F2>', '<cmd>lua vim.lsp.buf.rename()<cr>', opts)
        vim.keymap.set({'n', 'x'}, '<F3>', '<cmd>lua vim.lsp.buf.format({async = true})<cr>', opts)
        vim.keymap.set('n', '<F4>', '<cmd>lua vim.lsp.buf.code_action()<cr>', opts)
    end,
})

