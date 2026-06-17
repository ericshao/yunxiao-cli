/**
 * Auth 命令组
 */

import { Command } from 'commander';
import { createLoginCommand } from './login';
import { createLogoutCommand } from './logout';
import { createStatusCommand } from './status';

export function createAuthCommand(): Command {
  const cmd = new Command('auth');

  cmd
    .description('Manage authentication')
    .addCommand(createLoginCommand())
    .addCommand(createLogoutCommand())
    .addCommand(createStatusCommand());

  return cmd;
}
