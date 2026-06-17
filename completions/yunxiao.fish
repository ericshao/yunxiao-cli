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