vim.g.mapleader = " "
vim.keymap.set("n", "<leader>e", vim.cmd.Ex)

vim.keymap.set("v", "J", ":m '>+1<CR>gv=gv")
vim.keymap.set("v", "K", ":m '<-2<CR>gv=gv")

vim.keymap.set("n", "J", "mzJ`z")
vim.keymap.set("n", "<C-d>", "<C-d>zz")
vim.keymap.set("n", "<C-u>", "<C-u>zz")
vim.keymap.set("n", "n", "nzzzv")
vim.keymap.set("n", "N", "Nzzzv")

-- greatest remap ever
vim.keymap.set("x", "<leader>p", [["_dP]])

-- next greatest remap ever : asbjornHaland
vim.keymap.set({"n", "v"}, "<leader>y", [["+y]])
vim.keymap.set("n", "<leader>Y", [["+Y]])

--quickfix navigation
vim.keymap.set("n", "<C-k>", "<cmd>cprev<CR>")
vim.keymap.set("n", "<C-j>", "<cmd>cnext<CR>")

--tab navigation
vim.keymap.set("n", "<C-h>", "<cmd>tabprev<CR>")
vim.keymap.set("n", "<C-l>", "<cmd>tabnext<CR>")

vim.keymap.set({"n", "v"}, "<leader>d", "\"_d")

-- This is going to get me cancelled
vim.keymap.set("i", "<C-c>", "<Esc>")

vim.keymap.set("n", "Q", "<nop>")

--for terminal mode
vim.keymap.set ("n", "<leader>t","<CMD>Floaterm<CR>")
vim.keymap.set("t", "<C-c>", [[ <C-\><C-n> ]])

local netrw_tcd = function ()
    local filetype = vim.api.nvim_get_option_value("filetype", {buf = vim.api.nvim_get_current_buf()})
    if filetype == "netrw" then
        local current_dir = vim.b.netrw_curdir
        vim.cmd("tcd " .. current_dir)
    else
        vim.cmd("tcd %:p:h")
    end
end

vim.keymap.set("n", "<leader>q", netrw_tcd)

