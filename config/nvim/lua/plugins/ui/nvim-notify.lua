return {
    "rcarriga/nvim-notify",
    event = "VeryLazy",
    config = function()
        require("notify").setup({
            timeout = 1000, -- default 3000 (ms)
            fps = 60,
            render = "default", -- "default" | "minimal" | "simple" | "compact" | "wrapped-compact"
            stages = "fade_in_slide_out", -- "fade_in_slide_out" | "fade" | "slide" | "static"
            background_colour = "#000",
            max_height = function()
                return math.floor(vim.o.lines * 0.75)
            end,
            max_width = function()
                return math.floor(vim.o.columns * 0.75)
            end,
            on_open = function(win)
                vim.api.nvim_win_set_config(win, { zindex = 100 })
            end,
            top_down = false,
        })
        vim.notify = require("notify")
    end,
}
