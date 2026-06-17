#!/usr/bin/env node

/**
 * Shell 补全脚本生成器
 * 支持 bash, zsh, fish
 */

const fs = require('fs');
const path = require('path');

const commands = {
  auth: ['login', 'logout', 'status'],
  workitem: ['list', 'view', 'create', 'update'],
  comment: ['add', 'list'],
  config: ['get', 'set', 'list', 'path'],
};

const options = {
  global: ['--version', '--verbose', '--debug', '--help'],
  workitem: {
    list: [
      '-s',
      '--status',
      '-a',
      '--assigned-to',
      '-t',
      '--type',
      '-l',
      '--labels',
      '--sprint',
      '-p',
      '--page',
      '--per-page',
      '-o',
      '--output',
      '--json',
    ],
    view: ['--json', '--comments', '--activities'],
    create: [
      '-s',
      '--space-id',
      '-t',
      '--type',
      '-a',
      '--assigned-to',
      '--sprint',
      '-l',
      '--labels',
      '-p',
      '--parent',
      '-i',
      '--interactive',
    ],
    update: [
      '-s',
      '--subject',
      '-d',
      '--description',
      '-a',
      '--assigned-to',
      '--status',
      '--sprint',
      '-l',
      '--labels',
      '-i',
      '--interactive',
    ],
  },
  comment: {
    add: ['-c', '--content', '-p', '--parent-id'],
    list: ['-j', '--json'],
  },
  config: {
    get: [],
    set: [],
    list: ['-j', '--json'],
    path: [],
  },
};

// Bash 补全脚本
const bashCompletion = `
_yunxiao_completions()
{
    local cur prev opts
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"

    # 全局选项
    if [[ \${cur} == -* ]] ; then
        opts="--version --verbose --debug --help"
        COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
        return 0
    fi

    # 命令补全
    if [ \${COMP_CWORD} -eq 1 ]; then
        opts="auth workitem comment config help"
        COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
        return 0
    fi

    # 子命令补全
    case "\${COMP_WORDS[1]}" in
        auth)
            opts="login logout status"
            COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
            ;;
        workitem|wi)
            opts="list view create update"
            COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
            ;;
        comment)
            opts="add list"
            COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
            ;;
        config)
            opts="get set list path"
            COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
            ;;
    esac
}

complete -F _yunxiao_completions yunxiao
complete -F _yunxiao_completions yx
`;

// Zsh 补全脚本
const zshCompletion = `
#compdef yunxiao yx

_yunxiao() {
    local line state

    _arguments -C \\
        "1: :->cmds" \\
        "*::arg:->args"

    case "$state" in
        cmds)
            _values 'yunxiao commands' \\
                'auth[Manage authentication]' \\
                'workitem[Manage workitems]' \\
                'wi[Manage workitems (alias)]' \\
                'comment[Manage comments]' \\
                'config[Manage configuration]' \\
                'help[Display help]'
            ;;
        args)
            case $line[1] in
                auth)
                    _values 'auth commands' \\
                        'login[Login to Yunxiao]' \\
                        'logout[Logout from Yunxiao]' \\
                        'status[Show authentication status]'
                    ;;
                workitem|wi)
                    _values 'workitem commands' \\
                        'list[List workitems]' \\
                        'ls[List workitems (alias)]' \\
                        'view[View workitem details]' \\
                        'create[Create a workitem]' \\
                        'update[Update a workitem]'
                    ;;
                comment)
                    _values 'comment commands' \\
                        'add[Add a comment]' \\
                        'list[List comments]' \\
                        'ls[List comments (alias)]'
                    ;;
                config)
                    _values 'config commands' \\
                        'get[Get configuration value]' \\
                        'set[Set configuration value]' \\
                        'list[List all configuration]' \\
                        'ls[List all configuration (alias)]' \\
                        'path[Show config file path]'
                    ;;
            esac
            ;;
    esac
}

_yunxiao
`;

// Fish 补全脚本
const fishCompletion = `
# Yunxiao CLI completions for fish shell

# Remove old completions
complete -c yunxiao -e
complete -c yx -e

# Global options
complete -c yunxiao -s h -l help -d 'Display help'
complete -c yunxiao -s v -l version -d 'Display version'
complete -c yunxiao -l verbose -d 'Show verbose output'
complete -c yunxiao -l debug -d 'Show debug information'

# Auth command
complete -c yunxiao -f -n '__fish_use_subcommand' -a auth -d 'Manage authentication'
complete -c yunxiao -f -n '__fish_seen_subcommand_from auth' -a login -d 'Login to Yunxiao'
complete -c yunxiao -f -n '__fish_seen_subcommand_from auth' -a logout -d 'Logout from Yunxiao'
complete -c yunxiao -f -n '__fish_seen_subcommand_from auth' -a status -d 'Show authentication status'

# Workitem command
complete -c yunxiao -f -n '__fish_use_subcommand' -a workitem -d 'Manage workitems'
complete -c yunxiao -f -n '__fish_use_subcommand' -a wi -d 'Manage workitems (alias)'
complete -c yunxiao -f -n '__fish_seen_subcommand_from workitem wi' -a list -d 'List workitems'
complete -c yunxiao -f -n '__fish_seen_subcommand_from workitem wi' -a ls -d 'List workitems (alias)'
complete -c yunxiao -f -n '__fish_seen_subcommand_from workitem wi' -a view -d 'View workitem details'
complete -c yunxiao -f -n '__fish_seen_subcommand_from workitem wi' -a create -d 'Create a workitem'
complete -c yunxiao -f -n '__fish_seen_subcommand_from workitem wi' -a update -d 'Update a workitem'

# Comment command
complete -c yunxiao -f -n '__fish_use_subcommand' -a comment -d 'Manage comments'
complete -c yunxiao -f -n '__fish_seen_subcommand_from comment' -a add -d 'Add a comment'
complete -c yunxiao -f -n '__fish_seen_subcommand_from comment' -a list -d 'List comments'
complete -c yunxiao -f -n '__fish_seen_subcommand_from comment' -a ls -d 'List comments (alias)'

# Config command
complete -c yunxiao -f -n '__fish_use_subcommand' -a config -d 'Manage configuration'
complete -c yunxiao -f -n '__fish_seen_subcommand_from config' -a get -d 'Get configuration value'
complete -c yunxiao -f -n '__fish_seen_subcommand_from config' -a set -d 'Set configuration value'
complete -c yunxiao -f -n '__fish_seen_subcommand_from config' -a list -d 'List all configuration'
complete -c yunxiao -f -n '__fish_seen_subcommand_from config' -a ls -d 'List all configuration (alias)'
complete -c yunxiao -f -n '__fish_seen_subcommand_from config' -a path -d 'Show config file path'

# Copy for 'yx' alias
complete -c yx -w yunxiao
`;

// 生成补全脚本文件
const completionsDir = path.join(__dirname, '../completions');
if (!fs.existsSync(completionsDir)) {
  fs.mkdirSync(completionsDir, { recursive: true });
}

fs.writeFileSync(path.join(completionsDir, 'yunxiao.bash'), bashCompletion.trim());
fs.writeFileSync(path.join(completionsDir, 'yunxiao.zsh'), zshCompletion.trim());
fs.writeFileSync(path.join(completionsDir, 'yunxiao.fish'), fishCompletion.trim());

console.log('✓ Shell completion scripts generated:');
console.log('  - completions/yunxiao.bash (for Bash)');
console.log('  - completions/yunxiao.zsh (for Zsh)');
console.log('  - completions/yunxiao.fish (for Fish)');
console.log('\nTo enable completions:');
console.log('  Bash: source completions/yunxiao.bash');
console.log('  Zsh:  source completions/yunxiao.zsh');
console.log('  Fish: cp completions/yunxiao.fish ~/.config/fish/completions/');
