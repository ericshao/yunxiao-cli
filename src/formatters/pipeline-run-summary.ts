/**
 * 流水线运行摘要格式化器
 */

import Table from 'cli-table3';
import chalk from 'chalk';
import { PipelineRunDetail } from '../types/yunxiao';
import { formatDate } from '../utils/date';

export interface PipelineRunSummary {
  pipelineId: number;
  pipelineRunId: number;
  status: string;
  triggerMode: number;
  triggerModeName: string;
  pipelineType: string | null;
  creatorAccountId: string;
  createTime: number;
  updateTime: number;
  durationSeconds: number | null;
  ref: string | null;
  commitId: string | null;
  commitSha: string | null;
  commitTitle: string | null;
  commitAuthor: string | null;
  source: {
    name: string | null;
    type: string | null;
    repo: string | null;
    branch: string | null;
  } | null;
  stages: PipelineRunStageSummary[];
}

interface PipelineRunStageSummary {
  name: string;
  status: string;
  startTime: number | null;
  endTime: number | null;
  durationSeconds: number | null;
  jobs: PipelineRunJobSummary[];
}

interface PipelineRunJobSummary {
  name: string;
  status: string;
  startTime: number | null;
  endTime: number | null;
  durationSeconds: number | null;
}

const TRIGGER_MODE_NAMES: Record<number, string> = {
  1: '人工触发',
  2: '定时触发',
  3: '代码提交',
  5: '流水线触发',
  6: 'WEBHOOK',
};

export function summarizePipelineRun(run: PipelineRunDetail): PipelineRunSummary {
  const source = run.sources?.[0];

  return {
    pipelineId: run.pipelineId,
    pipelineRunId: run.pipelineRunId,
    status: run.status,
    triggerMode: run.triggerMode,
    triggerModeName: formatTriggerModeName(run.triggerMode),
    pipelineType: run.pipelineType ?? null,
    creatorAccountId: run.creatorAccountId,
    createTime: run.createTime,
    updateTime: run.updateTime,
    durationSeconds: calculateDurationSeconds(run.createTime, run.updateTime),
    ref: getGlobalParam(run, 'CI_COMMIT_REF_NAME'),
    commitId: getGlobalParam(run, 'CI_COMMIT_ID'),
    commitSha: getGlobalParam(run, 'CI_COMMIT_SHA'),
    commitTitle: getGlobalParam(run, 'CI_COMMIT_TITLE'),
    commitAuthor: getGlobalParam(run, 'CI_COMMIT_AUTHOR'),
    source: source
      ? {
          name: source.name ?? null,
          type: source.type ?? null,
          repo: source.data?.repo ?? null,
          branch: source.data?.branch ?? null,
        }
      : null,
    stages: (run.stages || []).map((stage) => {
      const stageInfo = stage.stageInfo;
      const stageName = stage.name || stageInfo?.name || stage.index;

      return {
        name: stageName,
        status: stageInfo?.status || 'UNKNOWN',
        startTime: stageInfo?.startTime ?? null,
        endTime: stageInfo?.endTime ?? null,
        durationSeconds: calculateDurationSeconds(stageInfo?.startTime, stageInfo?.endTime),
        jobs: (stageInfo?.jobs || []).map((job) => ({
          name: job.name,
          status: job.status,
          startTime: job.startTime ?? null,
          endTime: job.endTime ?? null,
          durationSeconds: calculateDurationSeconds(job.startTime, job.endTime),
        })),
      };
    }),
  };
}

export function formatPipelineRunSummary(summary: PipelineRunSummary): string {
  const lines: string[] = [];

  lines.push(chalk.bold.cyan(`\n流水线运行摘要 #${summary.pipelineRunId}`));
  lines.push('');
  lines.push(chalk.bold('基本信息'));
  lines.push(`  流水线 ID: ${summary.pipelineId}`);
  lines.push(`  状态:      ${formatPipelineStatus(summary.status)}`);
  lines.push(`  触发方式:  ${summary.triggerModeName}`);
  lines.push(`  创建人:    ${summary.creatorAccountId}`);
  lines.push(`  开始时间:  ${formatDate(summary.createTime, 'YYYY-MM-DD HH:mm:ss')}`);
  lines.push(`  更新时间:  ${formatDate(summary.updateTime, 'YYYY-MM-DD HH:mm:ss')}`);
  lines.push(`  耗时:      ${formatDuration(summary.durationSeconds)}`);

  if (summary.ref || summary.commitId || summary.commitTitle) {
    lines.push('');
    lines.push(chalk.bold('代码版本'));
    lines.push(`  Ref:       ${summary.ref || 'N/A'}`);
    lines.push(`  Commit:    ${summary.commitId || summary.commitSha || 'N/A'}`);
    lines.push(`  标题:      ${summary.commitTitle || 'N/A'}`);
    if (summary.commitAuthor) {
      lines.push(`  作者:      ${summary.commitAuthor}`);
    }
  }

  if (summary.stages.length > 0) {
    lines.push('');
    lines.push(chalk.bold('阶段'));
    lines.push(formatStageTable(summary.stages));
  }

  lines.push('');
  return lines.join('\n');
}

function getGlobalParam(run: PipelineRunDetail, key: string): string | null {
  return run.globalParams?.find((param) => param.key === key)?.value ?? null;
}

function calculateDurationSeconds(
  startTime: number | null | undefined,
  endTime: number | null | undefined
): number | null {
  if (!startTime || !endTime || endTime < startTime) {
    return null;
  }

  return Math.round((endTime - startTime) / 1000);
}

function formatTriggerModeName(mode: number): string {
  return TRIGGER_MODE_NAMES[mode] || `未知(${mode})`;
}

function formatPipelineStatus(status: string): string {
  const statusColors: Record<string, (text: string) => string> = {
    SUCCESS: chalk.green,
    RUNNING: chalk.blue,
    FAIL: chalk.red,
    CANCELED: chalk.gray,
    WAITING: chalk.yellow,
  };

  return (statusColors[status] || chalk.white)(status);
}

function formatStageTable(stages: PipelineRunStageSummary[]): string {
  const table = new Table({
    head: [chalk.cyan('阶段'), chalk.cyan('状态'), chalk.cyan('耗时'), chalk.cyan('任务')],
    colWidths: [22, 12, 10, 48],
    wordWrap: true,
    style: {
      head: [],
      border: [],
    },
  });

  for (const stage of stages) {
    table.push([
      stage.name,
      formatPipelineStatus(stage.status),
      formatDuration(stage.durationSeconds),
      stage.jobs.length > 0
        ? stage.jobs
            .map((job) => `${job.name}: ${job.status} (${formatDuration(job.durationSeconds)})`)
            .join('\n')
        : 'N/A',
    ]);
  }

  return table.toString();
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) {
    return 'N/A';
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
