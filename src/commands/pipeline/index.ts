/**
 * Pipeline 命令组
 */

import { Command } from 'commander';
import { createListCommand } from './list';
import { createViewCommand } from './view';
import { createCreateCommand } from './create';
import { createUpdateCommand } from './update';
import { createHistoryCommand } from './history';
import { createRunCommand } from './run';
import { createRunsCommand } from './runs';
import { createRunViewCommand } from './run-view';
import { createRunLatestCommand } from './run-latest';
import { createJobRunCommand } from './job-run';
import { createJobLogCommand } from './job-log';
import { createGroupListCommand } from './group-list';
import { createGroupViewCommand } from './group-view';
import { createGroupAddCommand } from './group-add';
import { createGroupPipelinesCommand } from './group-pipelines';

export function createPipelineCommand(): Command {
  const cmd = new Command('pipeline');

  cmd
    .alias('pl')
    .description('Manage pipelines')
    .addCommand(createListCommand())
    .addCommand(createViewCommand())
    .addCommand(createCreateCommand())
    .addCommand(createUpdateCommand())
    .addCommand(createHistoryCommand())
    .addCommand(createRunCommand())
    .addCommand(createRunsCommand())
    .addCommand(createRunViewCommand())
    .addCommand(createRunLatestCommand())
    .addCommand(createJobRunCommand())
    .addCommand(createJobLogCommand())
    .addCommand(createGroupListCommand())
    .addCommand(createGroupViewCommand())
    .addCommand(createGroupAddCommand())
    .addCommand(createGroupPipelinesCommand());

  return cmd;
}
