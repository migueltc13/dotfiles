return {
    "norcalli/nvim-colorizer.lua",
    event = "LazyFile",
    config = function()
        require("colorizer").setup()
    end,
}
