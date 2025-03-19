
return {
    "CopilotC-Nvim/CopilotChat.nvim",
    dependencies = {
        "zbirenbaum/copilot.lua", -- or github/copilot.vim
        "nvim-lua/plenary.nvim"   -- for curl, log wrapper
    },
    config = function()
        local select = require('CopilotChat.select')

        require('CopilotChat').setup({
            debug = false, -- Enable debug logging
            proxy = nil, -- [protocol://]host[:port] Use this proxy
            allow_insecure = false, -- Allow insecure server connections

            model = 'gpt-4o', -- Default model to use, see ':CopilotChatModels' for available models (can be specified manually in prompt via $).
            agent = 'copilot', -- Default agent to use, see ':CopilotChatAgents' for available agents (can be specified manually in prompt via @).

            temperature = 0.1, -- GPT temperature

            question_header = '### User ', -- Header to use for user questions
            answer_header = '### Copilot ', -- Header to use for AI answers
            error_header = '### Error ', -- Header to use for errors
            separator = '###', -- Separator to use in chat (default is '---') (other options: '***', '⎼⎼⎼', '~~~')

            show_folds = true, -- Shows folds for sections in chat
            show_help = true, -- Shows help message as virtual lines when waiting for user input
            auto_follow_cursor = true, -- Auto-follow cursor in chat
            auto_insert_mode = false, -- Automatically enter insert mode when opening window and if auto follow cursor is enabled on new prompt
            clear_chat_on_new_prompt = false, -- Clears chat on every new prompt

            context = nil, -- Default context to use, 'buffers', 'buffer' or none (can be specified manually in prompt via @).
            history_path = vim.fn.stdpath('data') .. '/copilotchat_history', -- Default path to stored history
            callback = nil, -- Callback to use when ask response is received

            -- default selection (visual or line)
            selection = function(source)
                return select.visual(source) or select.line(source)
            end,

            -- default prompts
            prompts = {
                Explain = {
                    prompt = '/COPILOT_EXPLAIN Write an explanation for the active selection as paragraphs of text.',
                },
                Review = {
                    prompt = '/COPILOT_REVIEW Review the selected code.',
                    -- callback = function(_, _)
                    --     -- see config.lua for implementation
                    -- end,
                },
                Fix = {
                    prompt = '/COPILOT_GENERATE There is a problem in this code. Rewrite the code to show it with the bug fixed.',
                },
                Optimize = {
                    prompt = '/COPILOT_GENERATE Optimize the selected code to improve performance and readablilty.',
                },
                Docs = {
                    prompt = '/COPILOT_GENERATE Please add documentation comment for the selection.',
                },
                Tests = {
                    prompt = '/COPILOT_GENERATE Please generate tests for my code.',
                },
                FixDiagnostic = {
                    prompt = 'Please assist with the following diagnostic issue in file:',
                    selection = select.diagnostics,
                },
                Commit = {
                    prompt = 'Write commit message for the change with commitizen convention. Make sure the title has maximum 50 characters and message is wrapped at 72 characters. Wrap the whole message in code block with language gitcommit.',
                    selection = select.gitdiff,
                },
                CommitStaged = {
                    prompt = 'Write commit message for the change with commitizen convention. Make sure the title has maximum 50 characters and message is wrapped at 72 characters. Wrap the whole message in code block with language gitcommit.',
                    selection = function(source)
                        return select.gitdiff(source, true)
                    end,
                },
            },

            -- default window options
            window = {
                layout = 'vertical', -- 'vertical', 'horizontal', 'float'
                width = 0.5, -- fractional width of parent, or absolute width in columns when > 1
                height = 0.5, -- fractional height of parent, or absolute height in rows when > 1
                -- Options below only apply to floating windows
                relative = 'editor', -- 'editor', 'win', 'cursor', 'mouse'
                border = 'single', -- 'none', single', 'double', 'rounded', 'solid', 'shadow'
                row = nil, -- row position of the window, default is centered
                col = nil, -- column position of the window, default is centered
                title = 'Copilot Chat', -- title of chat window
                footer = nil, -- footer of chat window
                zindex = 1, -- determines if window is on top or below other floating windows
            },

            -- default mappings
            mappings = {
                complete = {
                    insert = '<Tab>',
                },
                close = {
                    normal = 'q',
                    insert = '<C-c>',
                },
                reset = {
                    normal = '<C-l>',
                    insert = '<C-l>',
                },
                submit_prompt = {
                    normal = '<CR>',
                    insert = '<C-s>',
                },
                toggle_sticky = {
                    detail = 'Makes line under cursor sticky or deletes sticky line.',
                    normal = 'gr',
                },
                accept_diff = {
                    normal = '<C-y>',
                    insert = '<C-y>',
                },
                jump_to_diff = {
                    normal = 'gj',
                },
                quickfix_diffs = {
                    normal = 'gq',
                },
                yank_diff = {
                    normal = 'gy',
                    register = '"',
                },
                show_diff = {
                    normal = 'gd',
                },
                show_info = {
                    normal = 'gi',
                },
                show_context = {
                    normal = 'gc',
                },
                show_help = {
                    normal = 'gh',
                }
            }
        })
    end,
    cmd = {
        "CopilotChat",
        --[[
        "CopilotChatOpen",
        "CopilotChatClose",
        "CopilotChatToggle",
        "CopilotChatReset",
        "CopilotChatSave",
        "CopilotChatLoad",
        "CopilotChatDebugInfo",
        -- Commands coming from default prompts
        "CopilotChatExplain",
        "CopilotChatReview",
        "CopilotChatFix",
        "CopilotChatOptimize",
        "CopilotChatDocs",
        "CopilotChatTests",
        "CopilotChatFixDiagnostic",
        "CopilotChatCommit",
        "CopilotChatCommitStaged",
        ]]
    }
}
