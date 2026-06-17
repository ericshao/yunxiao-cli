/**
 * Auth 命令 - 登录
 */

import { Command } from 'commander';
import { login } from '../../utils/auth';
import { logger } from '../../utils/logger';

export function createLoginCommand(): Command {
  return new Command('login')
    .description('Authenticate with Yunxiao')
    .option('--with-token', 'Login with existing token')
    .action(async (options) => {
      try {
        await login();
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Login failed:', error.message);
        }
        process.exit(1);
      }
    });
}
