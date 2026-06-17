/**
 * Auth 命令 - 状态查看
 */

import { Command } from 'commander';
import { showAuthStatus } from '../../utils/auth';
import { logger } from '../../utils/logger';

export function createStatusCommand(): Command {
  return new Command('status').description('Show authentication status').action(() => {
    try {
      showAuthStatus();
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Failed to get auth status:', error.message);
      }
      process.exit(1);
    }
  });
}
