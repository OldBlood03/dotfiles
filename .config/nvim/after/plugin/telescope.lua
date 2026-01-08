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

vim.keymap.set("n", "<leader>d", function()
  require("telescope").extensions.zoxide.list({
    attach_mappings = function(_, map)
      local actions = require("telescope.actions")
      local action_state = require("telescope.actions.state")

      local function cd_and_explore(prompt_bufnr)
        local selection = action_state.get_selected_entry()
        actions.close(prompt_bufnr)

        if selection and selection.path then
          -- cd into the chosen directory
          vim.cmd("cd " .. selection.path)
          -- open netrw in it
          vim.cmd("execute 'Ex' getcwd()")
        end
      end

      map("i", "<CR>", cd_and_explore) -- Enter in insert mode
      map("n", "<CR>", cd_and_explore) -- Enter in normal mode
      return true
    end,
  })
end, { desc = "zoxide + cd + netrw" })
