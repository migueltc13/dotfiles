return {
    "jpmcb/nvim-llama",
    cmd = "Llama",
    config = function()
        require("nvim-llama").setup({
            -- See plugin debugging logs
            debug = false,

            -- The model for ollama to use. This model will be automatically downloaded.
            model = "orca-mini", -- llama2, codellama

            -- Models
            --[[
            Model               Parameters  Size    Model setting
            Neural Chat         7B          4.1GB   model = neural-chat
            Starling            7B          4.1GB   model = starling-lm
            Mistral             7B          4.1GB   model = mistral
            Llama 2             7B          3.8GB   model = llama2
            Code Llama          7B          3.8GB   model = codellama
            Llama 2 Uncensored  7B          3.8GB   model = llama2-uncensored
            Llama 2 13B         13B         7.3GB   model = llama2:13b
            Llama 2 70B         70B         39GB    model = llama2:70b
            Orca Mini           3B          1.9GB   model = orca-mini
            Vicuna              7B          3.8GB   model = vicuna
            --]]

            -- Hardware requirements
            --[[
            Parameters  RAM
            3B          8GB
            7B          16GB
            13B         32GB
            70B         64GB
            --]]
        })
    end
}
