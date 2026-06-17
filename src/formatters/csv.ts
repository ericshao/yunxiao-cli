/**
 * CSV 格式化器
 */

import { Workitem } from '../types/yunxiao';

export function formatWorkitemCSV(workitems: Workitem[]): string {
  if (workitems.length === 0) {
    return '';
  }

  // CSV 头部
  const headers = [
    'ID',
    'Serial Number',
    'Subject',
    'Status',
    'Type',
    'Assigned To',
    'Creator',
    'Created',
    'Modified',
  ];

  // CSV 行
  const rows = workitems.map((item) => [
    escapeCSV(item.id),
    escapeCSV(item.serialNumber),
    escapeCSV(item.subject),
    escapeCSV(item.status.name),
    escapeCSV(item.workitemType.name),
    escapeCSV(item.assignedTo?.name || ''),
    escapeCSV(item.creator.name),
    escapeCSV(item.gmtCreate),
    escapeCSV(item.gmtModified),
  ]);

  // 生成 CSV
  const lines = [headers, ...rows];
  return lines.map((row) => row.join(',')).join('\n');
}

function escapeCSV(value: string): string {
  if (!value) return '""';

  // 如果包含逗号、引号或换行符，需要用引号包裹
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // 引号需要转义为两个引号
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}
