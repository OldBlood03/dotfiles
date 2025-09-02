local builtin = require('telescope.builtin')
vim.keymap.set('n', '<leader>f', function ()
    builtin.find_files({hidden = true})
end
, {})

vim.keymap.set('n', '<leader>w', builtin.diagnostics, {})
vim.keymap.set('n', '<leader>o', builtin.help_tags, {})

vim.keymap.set('n', '<leader>g', function ()
    builtin.live_grep()
end
, {})
