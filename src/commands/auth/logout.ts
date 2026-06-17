/**
 * Auth 命令 - 登出
 */

import { Command } from 'commander';
import { logout } from '../../utils/auth';
import { logger } from '../../utils/logger';

export function createLogoutCommand(): Command {
  return new Command('logout').description('Remove authentication credentials').action(() => {
    try {
      logout();
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Logout failed:', error.message);
      }
      process.exit(1);
    }
  });
}
