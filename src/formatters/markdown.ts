/**
 * Markdown 格式化器
 */

import { Workitem } from '../types/yunxiao';
import { formatDate } from '../utils/date';

export function formatWorkitemMarkdown(workitems: Workitem[]): string {
  if (workitems.length === 0) {
    return '# Workitems\n\nNo workitems found.';
  }

  let markdown = '# Workitems\n\n';
  markdown += `Total: ${workitems.length}\n\n`;

  // 生成表格
  markdown += '| ID | Subject | Status | Type | Assigned To | Created |\n';
  markdown += '|----|---------|--------|------|-------------|----------|\n';

  workitems.forEach((item) => {
    const row = [
      item.serialNumber,
      escapeMarkdown(item.subject),
      item.status.name,
      item.workitemType.name,
      item.assignedTo?.name || '-',
      formatDate(item.gmtCreate),
    ];
    markdown += `| ${row.join(' | ')} |\n`;
  });

  return markdown;
}

export function formatWorkitemDetailMarkdown(workitem: Workitem): string {
  let markdown = `# ${workitem.serialNumber}: ${escapeMarkdown(workitem.subject)}\n\n`;

  // 基本信息
  markdown += '## Basic Information\n\n';
  markdown += `- **Status**: ${workitem.status.name}\n`;
  markdown += `- **Type**: ${workitem.workitemType.name}\n`;
  markdown += `- **Assigned To**: ${workitem.assignedTo?.name || 'Unassigned'}\n`;
  markdown += `- **Creator**: ${workitem.creator.name}\n`;
  markdown += `- **Created**: ${formatDate(workitem.gmtCreate)}\n`;
  markdown += `- **Modified**: ${formatDate(workitem.gmtModified)}\n`;

  if (workitem.sprint) {
    markdown += `- **Sprint**: ${workitem.sprint.name}\n`;
  }

  // 描述
  if (workitem.description) {
    markdown += '\n## Description\n\n';
    markdown += workitem.description + '\n';
  }

  // 标签
  if (workitem.labels && workitem.labels.length > 0) {
    markdown += '\n## Labels\n\n';
    workitem.labels.forEach((label) => {
      markdown += `- ${label}\n`;
    });
  }

  return markdown;
}

function escapeMarkdown(text: string): string {
  if (!text) return '';

  // 转义 Markdown 特殊字符
  return text
    .replace(/\|/g, '\\|')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_');
}
