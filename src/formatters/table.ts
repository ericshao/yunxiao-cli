/**
 * 表格格式化器
 */

import Table from 'cli-table3';
import chalk from 'chalk';
import {
  Workitem,
  Pipeline,
  PipelineDetail,
  PipelineJobHistory,
  PipelineRun,
  PipelineRunDetail,
  PipelineGroup,
  PipelineGroupPipeline,
} from '../types/yunxiao';
import { formatRelativeTime } from '../utils/date';
import wrapAnsi from 'wrap-ansi';

/**
 * 格式化工作项列表为表格
 */
export function formatWorkitemTable(workitems: Workitem[]): string {
  const table = new Table({
    head: [
      chalk.cyan('ID'),
      chalk.cyan('标题'),
      chalk.cyan('状态'),
      chalk.cyan('类型'),
      chalk.cyan('负责人'),
      chalk.cyan('更新时间'),
    ],
    colWidths: [15, 40, 12, 10, 15, 15],
    wordWrap: true,
    style: {
      head: [],
      border: [],
    },
  });

  for (const wi of workitems) {
    const subject = wrapAnsi(wi.subject, 38, { hard: true, trim: true });
    const status = formatStatus(wi.status?.name || 'N/A');

    table.push([
      wi.serialNumber || wi.id,
      subject,
      status,
      wi.workitemType?.name || 'N/A',
      wi.assignedTo?.name || chalk.gray('未分配'),
      formatRelativeTime(wi.gmtModified),
    ]);
  }

  return table.toString();
}

/**
 * 格式化工作项详情
 */
export function formatWorkitemDetail(workitem: Workitem): string {
  const lines: string[] = [];

  // 标题
  lines.push(chalk.bold.cyan(`\n${workitem.subject} ${chalk.gray(`#${workitem.serialNumber}`)}`));
  lines.push('');

  // 基本信息
  lines.push(chalk.bold('基本信息'));
  lines.push(`  状态:     ${formatStatus(workitem.status?.name || 'N/A')}`);
  lines.push(`  类型:     ${workitem.workitemType?.name || 'N/A'}`);
  lines.push(`  负责人:   ${workitem.assignedTo?.name || chalk.gray('未分配')}`);
  lines.push(`  创建人:   ${workitem.creator?.name || 'N/A'}`);
  lines.push(`  创建时间: ${formatRelativeTime(workitem.gmtCreate)}`);
  lines.push(`  更新时间: ${formatRelativeTime(workitem.gmtModified)}`);

  // 迭代信息
  if (workitem.sprint) {
    lines.push(`  迭代:     ${workitem.sprint.name}`);
  }

  // 标签
  if (workitem.labels && workitem.labels.length > 0) {
    lines.push(`  标签:     ${workitem.labels.map((l) => chalk.blue(l)).join(', ')}`);
  }

  // 描述
  if (workitem.description) {
    lines.push('');
    lines.push(chalk.bold('描述'));
    const wrappedDesc = wrapAnsi(workitem.description, 80, { hard: true, trim: true });
    lines.push(
      wrappedDesc
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n')
    );
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * 格式化状态（带颜色）
 */
function formatStatus(status: string): string {
  const statusColors: Record<string, (text: string) => string> = {
    待处理: chalk.gray,
    进行中: chalk.blue,
    开发中: chalk.blue,
    测试中: chalk.yellow,
    已完成: chalk.green,
    已关闭: chalk.gray,
    已拒绝: chalk.red,
  };

  const colorFn = statusColors[status] || chalk.white;
  return colorFn(status);
}

/**
 * 格式化流水线状态（带颜色）
 */
function formatPipelineStatus(status: string): string {
  const statusColors: Record<string, (text: string) => string> = {
    SUCCESS: chalk.green,
    RUNNING: chalk.blue,
    FAIL: chalk.red,
    CANCELED: chalk.gray,
    WAITING: chalk.yellow,
  };
  const colorFn = statusColors[status] || chalk.white;
  return colorFn(status);
}

/**
 * 格式化流水线列表为表格
 */
export function formatPipelineTable(pipelines: Pipeline[]): string {
  const table = new Table({
    head: [chalk.cyan('ID'), chalk.cyan('名称'), chalk.cyan('创建人'), chalk.cyan('创建时间')],
    colWidths: [12, 40, 20, 20],
    wordWrap: true,
    style: {
      head: [],
      border: [],
    },
  });

  for (const pl of pipelines) {
    table.push([
      pl.pipelineId.toString(),
      pl.pipelineName,
      pl.createAccountId,
      formatRelativeTime(pl.createTime.toString()),
    ]);
  }

  return table.toString();
}

/**
 * 格式化流水线详情
 */
export function formatPipelineDetail(pipeline: PipelineDetail): string {
  const lines: string[] = [];

  lines.push(chalk.bold.cyan(`\n${pipeline.name}`));
  lines.push('');

  // 基本信息
  lines.push(chalk.bold('基本信息'));
  lines.push(`  类型:     ${pipeline.type === 'PIPELINEASCODE' ? 'YAML 流水线' : 'UI 流水线'}`);
  lines.push(`  环境:     ${pipeline.envName || 'N/A'} (ID: ${pipeline.envId})`);
  lines.push(`  分组 ID:  ${pipeline.groupId}`);
  lines.push(`  创建人:   ${pipeline.creatorAccountId}`);
  lines.push(`  修改人:   ${pipeline.modifierAccountId}`);
  lines.push(`  创建时间: ${formatRelativeTime(pipeline.createTime.toString())}`);
  lines.push(`  更新时间: ${formatRelativeTime(pipeline.updateTime.toString())}`);

  // 标签
  if (pipeline.tagList && pipeline.tagList.length > 0) {
    lines.push(`  标签:     ${pipeline.tagList.map((t) => chalk.blue(t.name)).join(', ')}`);
  }

  // 代码源
  if (pipeline.pipelineConfig?.sources && pipeline.pipelineConfig.sources.length > 0) {
    lines.push('');
    lines.push(chalk.bold('代码源'));
    for (const source of pipeline.pipelineConfig.sources) {
      lines.push(`  类型: ${source.type}`);
      lines.push(`  仓库: ${source.data?.repo || 'N/A'}`);
      lines.push(`  分支: ${source.data?.branch || 'N/A'}`);
      if (source.data?.isTrigger) {
        lines.push(`  触发: 已启用 (过滤: ${source.data.triggerFilter || '.*'})`);
      }
      lines.push('');
    }
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * 格式化流水线执行历史为表格
 */
export function formatPipelineJobHistoryTable(histories: PipelineJobHistory[]): string {
  const table = new Table({
    head: [
      chalk.cyan('执行次数'),
      chalk.cyan('任务名称'),
      chalk.cyan('状态'),
      chalk.cyan('流水线运行 ID'),
      chalk.cyan('操作人'),
    ],
    colWidths: [12, 30, 12, 18, 20],
    wordWrap: true,
    style: {
      head: [],
      border: [],
    },
  });

  for (const h of histories) {
    table.push([
      h.executeNumber.toString(),
      h.jobName,
      formatPipelineStatus(h.status),
      h.pipelineRunId.toString(),
      h.operatorAccountId,
    ]);
  }

  return table.toString();
}

/**
 * 格式化触发模式
 */
function formatTriggerMode(mode: number): string {
  const modes: Record<number, string> = {
    1: '人工触发',
    2: '定时触发',
    3: '代码提交',
    5: '流水线触发',
    6: 'WEBHOOK',
  };
  return modes[mode] || `未知(${mode})`;
}

/**
 * 格式化流水线运行实例列表为表格
 */
export function formatPipelineRunTable(runs: PipelineRun[]): string {
  const table = new Table({
    head: [
      chalk.cyan('运行 ID'),
      chalk.cyan('流水线 ID'),
      chalk.cyan('触发方式'),
      chalk.cyan('创建人'),
      chalk.cyan('开始时间'),
      chalk.cyan('结束时间'),
    ],
    colWidths: [10, 12, 14, 22, 20, 20],
    wordWrap: true,
    style: {
      head: [],
      border: [],
    },
  });

  for (const run of runs) {
    table.push([
      run.pipelineRunId.toString(),
      run.pipelineId.toString(),
      formatTriggerMode(run.triggerMode),
      run.creatorAccountId,
      run.startTime ? formatRelativeTime(run.startTime.toString()) : 'N/A',
      run.endTime ? formatRelativeTime(run.endTime.toString()) : 'N/A',
    ]);
  }

  return table.toString();
}

/**
 * 格式化流水线运行实例详情
 */
export function formatPipelineRunDetail(run: PipelineRunDetail): string {
  const lines: string[] = [];

  lines.push(chalk.bold.cyan(`\n流水线运行 #${run.pipelineRunId}`));
  lines.push('');

  // 基本信息
  lines.push(chalk.bold('基本信息'));
  lines.push(`  流水线 ID: ${run.pipelineId}`);
  lines.push(`  运行 ID:   ${run.pipelineRunId}`);
  lines.push(`  状态:      ${formatPipelineStatus(run.status)}`);
  lines.push(`  触发方式:  ${formatTriggerMode(run.triggerMode)}`);
  lines.push(`  类型:      ${run.pipelineType || 'default'}`);
  lines.push(`  创建人:    ${run.creatorAccountId}`);
  lines.push(`  创建时间:  ${formatRelativeTime(run.createTime.toString())}`);
  lines.push(`  更新时间:  ${formatRelativeTime(run.updateTime.toString())}`);

  // 全局参数
  if (run.globalParams && run.globalParams.length > 0) {
    lines.push('');
    lines.push(chalk.bold('运行参数'));
    for (const param of run.globalParams) {
      const value = param.encrypted ? '******' : param.value;
      lines.push(`  ${param.key}: ${value}`);
    }
  }

  // 代码源
  if (run.sources && run.sources.length > 0) {
    lines.push('');
    lines.push(chalk.bold('代码源'));
    for (const source of run.sources) {
      lines.push(
        `  ${source.name || source.type}: ${source.data?.repo || 'N/A'} (${source.data?.branch || 'N/A'})`
      );
    }
  }

  // 阶段信息
  if (run.stages && run.stages.length > 0) {
    lines.push('');
    lines.push(chalk.bold('阶段'));
    for (const stage of run.stages) {
      const stageStatus = stage.stageInfo?.status
        ? formatPipelineStatus(stage.stageInfo.status)
        : 'N/A';
      lines.push(`  ${stage.name}: ${stageStatus}`);
      if (stage.stageInfo?.jobs) {
        for (const job of stage.stageInfo.jobs) {
          const jobStatus = formatPipelineStatus(job.status);
          lines.push(`    - ${job.name}: ${jobStatus}`);
        }
      }
    }
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * 格式化流水线分组列表为表格
 */
export function formatPipelineGroupTable(groups: PipelineGroup[]): string {
  const table = new Table({
    head: [chalk.cyan('ID'), chalk.cyan('名称'), chalk.cyan('创建时间')],
    colWidths: [12, 40, 20],
    wordWrap: true,
    style: {
      head: [],
      border: [],
    },
  });

  for (const group of groups) {
    table.push([group.id.toString(), group.name, formatRelativeTime(group.gmtCreate.toString())]);
  }

  return table.toString();
}

/**
 * 格式化流水线分组详情
 */
export function formatPipelineGroupDetail(group: PipelineGroup): string {
  const lines: string[] = [];

  lines.push(chalk.bold.cyan(`\n${group.name}`));
  lines.push('');
  lines.push(chalk.bold('基本信息'));
  lines.push(`  ID:       ${group.id}`);
  lines.push(`  名称:     ${group.name}`);
  lines.push(`  创建时间: ${formatRelativeTime(group.gmtCreate.toString())}`);
  lines.push('');

  return lines.join('\n');
}

/**
 * 格式化分组下的流水线列表为表格
 */
export function formatPipelineGroupPipelineTable(pipelines: PipelineGroupPipeline[]): string {
  const table = new Table({
    head: [chalk.cyan('流水线 ID'), chalk.cyan('名称'), chalk.cyan('创建时间')],
    colWidths: [12, 50, 20],
    wordWrap: true,
    style: {
      head: [],
      border: [],
    },
  });

  for (const pl of pipelines) {
    table.push([
      pl.pipelineId.toString(),
      pl.pipelineName,
      formatRelativeTime(pl.gmtCreate.toString()),
    ]);
  }

  return table.toString();
}
