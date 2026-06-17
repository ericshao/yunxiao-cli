/**
 * Service credential 命令组
 */

import { Command } from 'commander';
import { createListCommand } from './list';

export function createServiceCredentialCommand(): Command {
  const cmd = new Command('service-credential');

  cmd
    .alias('svc-cred')
    .description('Manage Flow service credentials')
    .addCommand(createListCommand());

  return cmd;
}
