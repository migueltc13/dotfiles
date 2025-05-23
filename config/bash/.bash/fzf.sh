# Setup fzf
# ---------
if [[ ! "$PATH" == *$HOME/.fzf/bin* ]]; then
  PATH="${PATH:+${PATH}:}$HOME/.fzf/bin"
fi

# Auto-completion
# ---------------
source "$HOME/.fzf/shell/completion.bash"

# Key bindings
# ------------
source "$HOME/.fzf/shell/key-bindings.bash"

# Env variables
# -------------
export FZF_DEFAULT_OPTS="--layout=reverse --ansi --multi"
export FZF_CTRL_R_OPTS="--prompt '$ '"
# export FZF_DEFAULT_COMMAND='find .'
export FZF_ALT_C_COMMAND='find . -type d 2>/dev/null'
# export FZF_ALT_C_COMMAND='fdfind -H -t d'

# Catppuccin mocha theme
# ----------------------
export FZF_DEFAULT_OPTS="$FZF_DEFAULT_OPTS \
--color=spinner:#f5e0dc,hl:#f38ba8 \
--color=fg:#cdd6f4,header:#f38ba8,info:#cba6f7,pointer:#f5e0dc \
--color=marker:#f5e0dc,fg+:#cdd6f4,prompt:#cba6f7,hl+:#f38ba8"
# default background color
# --color=bg+:#313244,bg:#1e1e2e,spinner:#f5e0dc,hl:#f38ba8 \
