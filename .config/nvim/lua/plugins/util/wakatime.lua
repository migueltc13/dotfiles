return {
    "wakatime/vim-wakatime",
    event = { "BufReadPre", "BufNewFile" },
    cmd = {
        "WakaTimeApiKey",
        "WakaTimeCliLocation",
        "WakaTimeCliVersion",
        "WakaTimeDebugDisable",
        "WakaTimeDebugEnable",
        "WakaTimeFileExpert",
        "WakaTimeScreenRedrawDisable",
        "WakaTimeScreenRedrawEnable",
        "WakaTimeScreenRedrawEnableAuto",
        "WakaTimeToday",
    }
}
