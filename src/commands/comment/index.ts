/**
 * Comment 命令组
 */

import { Command } from 'commander';
import { createAddCommand } from './add';
import { createListCommand } from './list';

export function createCommentCommand(): Command {
  const cmd = new Command('comment');

  cmd
    .description('Manage workitem comments')
    .addCommand(createAddCommand())
    .addCommand(createListCommand());

  return cmd;
}
