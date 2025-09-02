local M = {}

M.activate = function ()
    local win_config = {
        split = 'right',
        height = 1,
    }

    local buffer_id = vim.api.nvim_create_buf(false, true)

    vim.fn.system("make assemble")
    vim.api.nvim_open_win(buffer_id,false, win_config)
end

M.setup = function (opts)
end
M.activate()
return M
