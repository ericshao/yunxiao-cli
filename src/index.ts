#!/usr/bin/env node

/**
 * Yunxiao CLI 主入口
 */

import { Command } from 'commander';
import { logger } from './utils/logger';
import { configManager } from './utils/config';
import { createAuthCommand } from './commands/auth';
import { createWorkitemCommand } from './commands/workitem';
import { createCommentCommand } from './commands/comment';
import { createConfigCommand } from './commands/config';
import { createPipelineCommand } from './commands/pipeline';
import * as packageJson from '../package.json';

const program = new Command();

async function main() {
  try {
    // 配置全局选项
    program
      .name('yunxiao')
      .description(
        'Aliyun Yunxiao (云效) CLI tool for workitem, comment, config and pipeline management'
      )
      .version(packageJson.version, '-v, --version', 'Output the version number')
      .option('--verbose', 'Show verbose output', false)
      .option('--debug', 'Show debug information', false)
      .hook('preAction', (thisCommand) => {
        const opts = thisCommand.opts();
        if (opts.debug) {
          logger.setLevel('debug');
        } else if (opts.verbose) {
          logger.setLevel('verbose');
        }
      })
      .addHelpText(
        'after',
        `
Examples:
  $ yunxiao auth login
  $ yunxiao workitem list --status=InDev
  $ yunxiao workitem view CLOD-1013
  $ yunxiao workitem create
  $ yunxiao workitem update CLOD-1013 --subject "New title"
  $ yunxiao comment add CLOD-1013 -c "Great work!"
  $ yunxiao comment list CLOD-1013
  $ yunxiao wi list --assigned-to=@me
  $ yunxiao pipeline list --status=SUCCESS,RUNNING
  $ yunxiao pipeline view 12345
  $ yunxiao pipeline update 12345 --name "My Pipeline" --file pipeline.yaml
  $ yunxiao pipeline history 12345 --category DEPLOY --identifier deploy-job

Configuration:
  ${configManager.getConfigPath()}

Learn more:
  https://github.com/ericshao/yunxiao-cli
`
      );

    // 注册命令
    program.addCommand(createAuthCommand());
    program.addCommand(createWorkitemCommand());
    program.addCommand(createCommentCommand());
    program.addCommand(createConfigCommand());
    program.addCommand(createPipelineCommand());

    // 解析命令
    await program.parseAsync(process.argv);
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Unexpected error:', error.message);
      if (logger['level'] === 'debug') {
        logger.debug(error.stack || '');
      }
    }
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  logger.info('\nGoodbye!');
  process.exit(0);
});

// 启动
main();
