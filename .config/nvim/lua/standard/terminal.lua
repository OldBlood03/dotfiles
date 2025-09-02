local api = vim.api

local state = { buf = -1, win = -1 }

local create_floating_terminal = function (opts)
    local buf = nil
    if api.nvim_buf_is_valid(opts.buf) then
        buf = opts.buf
    else
        local temp = api.nvim_get_current_buf()
        vim.cmd.term()
        buf = api.nvim_get_current_buf()
        api.nvim_set_current_buf(temp)
    end

    local height = vim.fn.float2nr(vim.api.nvim_win_get_height(0)*0.8)
    local width = vim.fn.float2nr(vim.api.nvim_win_get_width(0)*0.8)
    local col = (vim.o.columns-width)/2
    local row = (vim.o.lines-height)/2

    local win_opts = {
        relative = 'editor',
        width = width,
        height = height,
        row = row,
        col = col,
        style = "minimal",
        border =  "rounded",
    }
    local win = api.nvim_open_win(buf, true, win_opts)
    return {buf = buf, win = win}
end

local toggle_terminal = function ()
    if not api.nvim_win_is_valid(state.win) then
        state = create_floating_terminal(state)
    else
        api.nvim_win_hide(state.win)
    end
end

api.nvim_create_user_command("Floaterm", toggle_terminal, {})
