/**
 * JSON 格式化器
 */

import { Workitem } from '../types/yunxiao';

/**
 * 格式化工作项为 JSON
 */
export function formatWorkitemJson(workitems: Workitem | Workitem[]): string {
  return JSON.stringify(workitems, null, 2);
}

/**
 * 格式化工作项为紧凑 JSON
 */
export function formatWorkitemJsonCompact(workitems: Workitem | Workitem[]): string {
  return JSON.stringify(workitems);
}

/**
 * 通用 JSON 格式化
 */
export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
