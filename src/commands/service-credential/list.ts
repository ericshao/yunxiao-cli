/**
 * Service credential 命令 - 列出服务凭据
 */

import { Command } from 'commander';
import { getAuthenticatedClient } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { formatJson } from '../../formatters/json';
import { formatServiceCredentialTable } from '../../formatters/table';
import { withProgress } from '../../utils/progress';
import { ListServiceCredentialsOptions } from '../../types/cli';

export function createListCommand(): Command {
  return new Command('list')
    .alias('ls')
    .description('List Flow service credentials')
    .option('-t, --type <type>', 'Filter by service credential type (for example: Codeup)')
    .option('-o, --output <format>', 'Output format (table|json)', 'table')
    .option('--json', 'Shorthand for --output=json')
    .action(async (options: ListServiceCredentialsOptions) => {
      try {
        await listServiceCredentials(options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to list service credentials:', error.message);
          logger.debug(error.stack || '');
        }
        process.exit(1);
      }
    });
}

async function listServiceCredentials(options: ListServiceCredentialsOptions): Promise<void> {
  const client = await getAuthenticatedClient();
  const outputFormat = options.json ? 'json' : options.output || 'table';

  logger.verbose('Fetching service credentials...');

  const credentials = await withProgress(
    'Fetching service credentials...',
    async () => {
      return client.listServiceCredentials({ serviceCredentialType: options.type });
    },
    { silent: outputFormat === 'json' }
  );

  if (credentials.length === 0) {
    if (outputFormat === 'json') {
      console.log(formatJson([]));
      return;
    }

    logger.info('No service credentials found');
    return;
  }

  switch (outputFormat) {
    case 'json':
      console.log(formatJson(credentials));
      break;
    default:
      console.log(formatServiceCredentialTable(credentials));
  }
}
