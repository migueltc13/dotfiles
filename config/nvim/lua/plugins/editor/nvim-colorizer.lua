return {
    "norcalli/nvim-colorizer.lua",
    lazy = true,
    ft = {
        "markdown",
        "html",
        "css",
        -- "scss",
        "javascript",
        "typescript",
        -- "vue",
        -- "svelte"
    },
    config = function()
        require("colorizer").setup()
    end,
}
