/**
 * Service connection 命令 - 列出服务连接
 */

import { Command } from 'commander';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { formatJson } from '../../formatters/json';
import { formatServiceConnectionTable } from '../../formatters/table';
import { withProgress } from '../../utils/progress';
import { ListServiceConnectionsOptions } from '../../types/cli';

export function createListCommand(): Command {
  return new Command('list')
    .alias('ls')
    .description('List Flow service connections')
    .option('-t, --type <type>', 'Filter by service connection type (for example: codeup)')
    .option('-o, --output <format>', 'Output format (table|json)', 'table')
    .option('--json', 'Shorthand for --output=json')
    .action(async (options: ListServiceConnectionsOptions) => {
      try {
        await listServiceConnections(options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to list service connections:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function listServiceConnections(options: ListServiceConnectionsOptions): Promise<void> {
  const client = await getAuthenticatedClient();
  const outputFormat = options.json ? 'json' : options.output || 'table';

  logger.verbose('Fetching service connections...');

  const connections = await withProgress(
    'Fetching service connections...',
    async () => {
      return client.listServiceConnections({ sericeConnectionType: options.type });
    },
    { silent: outputFormat === 'json' }
  );

  if (connections.length === 0) {
    if (outputFormat === 'json') {
      console.log(formatJson([]));
      return;
    }

    logger.info('No service connections found');
    return;
  }

  switch (outputFormat) {
    case 'json':
      console.log(formatJson(connections));
      break;
    default:
      console.log(formatServiceConnectionTable(connections));
  }
}
