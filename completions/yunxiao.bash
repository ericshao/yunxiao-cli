_yunxiao_completions()
{
    local cur prev opts
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    # 全局选项
    if [[ ${cur} == -* ]] ; then
        opts="--version --verbose --debug --help"
        COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
        return 0
    fi

    # 命令补全
    if [ ${COMP_CWORD} -eq 1 ]; then
        opts="auth workitem comment config help"
        COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
        return 0
    fi

    # 子命令补全
    case "${COMP_WORDS[1]}" in
        auth)
            opts="login logout status"
            COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
            ;;
        workitem|wi)
            opts="list view create update"
            COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
            ;;
        comment)
            opts="add list"
            COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
            ;;
        config)
            opts="get set list path"
            COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
            ;;
    esac
}

complete -F _yunxiao_completions yunxiao
complete -F _yunxiao_completions yx