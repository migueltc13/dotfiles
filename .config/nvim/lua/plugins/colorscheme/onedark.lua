return {
    "navarasu/onedark.nvim",
    lazy = true,
    config = function()
        require("onedark").setup {
            transparent = true
        }
    end
}
