/**
 * Workitem 命令组
 */

import { Command } from 'commander';
import { createListCommand } from './list';
import { createViewCommand } from './view';
import { createCreateCommand } from './create';
import { createUpdateCommand } from './update';

export function createWorkitemCommand(): Command {
  const cmd = new Command('workitem');

  cmd
    .alias('wi')
    .description('Manage workitems')
    .addCommand(createListCommand())
    .addCommand(createViewCommand())
    .addCommand(createCreateCommand())
    .addCommand(createUpdateCommand());

  return cmd;
}
