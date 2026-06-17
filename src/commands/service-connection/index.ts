/**
 * Service connection 命令组
 */

import { Command } from 'commander';
import { createListCommand } from './list';

export function createServiceConnectionCommand(): Command {
  const cmd = new Command('service-connection');

  cmd
    .alias('svc-conn')
    .description('Manage Flow service connections')
    .addCommand(createListCommand());

  return cmd;
}
