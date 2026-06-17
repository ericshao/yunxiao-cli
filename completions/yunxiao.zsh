#compdef yunxiao yx

_yunxiao() {
    local line state

    _arguments -C \
        "1: :->cmds" \
        "*::arg:->args"

    case "$state" in
        cmds)
            _values 'yunxiao commands' \
                'auth[Manage authentication]' \
                'workitem[Manage workitems]' \
                'wi[Manage workitems (alias)]' \
                'comment[Manage comments]' \
                'config[Manage configuration]' \
                'help[Display help]'
            ;;
        args)
            case $line[1] in
                auth)
                    _values 'auth commands' \
                        'login[Login to Yunxiao]' \
                        'logout[Logout from Yunxiao]' \
                        'status[Show authentication status]'
                    ;;
                workitem|wi)
                    _values 'workitem commands' \
                        'list[List workitems]' \
                        'ls[List workitems (alias)]' \
                        'view[View workitem details]' \
                        'create[Create a workitem]' \
                        'update[Update a workitem]'
                    ;;
                comment)
                    _values 'comment commands' \
                        'add[Add a comment]' \
                        'list[List comments]' \
                        'ls[List comments (alias)]'
                    ;;
                config)
                    _values 'config commands' \
                        'get[Get configuration value]' \
                        'set[Set configuration value]' \
                        'list[List all configuration]' \
                        'ls[List all configuration (alias)]' \
                        'path[Show config file path]'
                    ;;
            esac
            ;;
    esac
}

_yunxiao