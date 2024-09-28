return {
    -- Live share for Neovim
    "jbyuki/instant.nvim",
    lazy = true,
    cmd = {
        -- Server commands
        "InstantStartServer",
        "InstantStopServer",
        -- Client commands
        -- -- For single buffer sharing use:
        "InstantShareSingle",
        "InstantJoinSingle",
        -- -- For session sharing:
        "InstantStartSession",
        "InstantJoinSession",
        -- -- Aditional commands
        "InstantStatus",
        "InstantFollow",
        "InstantStopFollow",
        "InstantOpenAll",
        "InstantSaveAll",
        "InstantMark",
        "InstantMarkClear",
        "InstantStop"
    },
    config = function()
        vim.g.instant_username = os.getenv("USER")
    end,
}
