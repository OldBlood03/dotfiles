vim.api.nvim_create_autocmd("BufNewFile", {
    pattern = {'*.tex'},
    callback = function()
        local fn = vim.fn;
        local current_dir = fn.expand("%:p:h");
        local template_dir = fn.expand("~/.config/nvim/lua/oliver/templates/tex/")
        local template_name = "template.tex"
        local template_path = template_dir .. template_name
        local files = fn.glob(template_dir .. "*", false, true)

        local want_to_template = vim.fn.input ("Do you want to copy the template y(es) n(o)? ")

        if want_to_template:find("[nN]") then
            return nil
        end

        vim.cmd.read(template_path)
        for _, file in pairs(files) do
            print("file = " .. file)
            if not file:match(template_name) then
                fn.system("cp " .. file .. " " .. current_dir)
            end
        end
    end
})
