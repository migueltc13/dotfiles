return {
    'kristijanhusak/vim-dadbod-ui',
    dependencies = {
        {
            'tpope/vim-dadbod',
            lazy = true
        },
        {
            'kristijanhusak/vim-dadbod-completion',
            ft = { 'sql', 'mysql', 'plsql' },
            lazy = true
        },
    },
    cmd = {
        'DBUI',
        'DBUIToggle',
        'DBUIAddConnection',
        'DBUIFindBuffer',
    },
    init = function()
        -- Settings
        vim.g.db_ui_show_help = 0
        vim.g.db_ui_use_nerd_fonts = 1
        vim.g.db_ui_winwidth = 40
        vim.g.db_ui_use_nvim_notify = 1
        vim.g.db_ui_auto_execute_table_helpers = 0
        vim.g.db_ui_save_location = vim.fn.stdpath('data') .. '/dadbod/'
        vim.g.db_ui_tmp_query_location = vim.fn.stdpath('data') .. '/dadbod/queries/'

        -- Notification colors
        vim.cmd('hi NotificationInfo    guifg=#89B4FA guibg=none')
        vim.cmd('hi NotificationWarning guifg=#F9E2AF guibg=none')
        vim.cmd('hi NotificationError   guifg=#F38BA8 guibg=none')

        -- Enable auto-completion
        require("util.Dadbob").setup()
    end,
}
