local projectfile = vim.fn.getcwd() .. '/project.godot'
if vim.fn.filereadable(projectfile) == 1 then
    vim.fn.serverstart("./godothost")
end
