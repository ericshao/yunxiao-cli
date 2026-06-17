/**
 * 日期格式化工具
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * 解析输入为 dayjs 对象
 * 支持：
 * - 毫秒时间戳数字（如 1729178040000）
 * - 毫秒时间戳字符串（13位纯数字字符串，如 "1729178040000"）
 * - ISO 日期字符串（如 "2024-10-17T12:00:00Z"）
 * - Date 对象
 */
function parseDateInput(input: string | number | Date | null | undefined): dayjs.Dayjs {
  if (input === null || input === undefined || input === '') {
    return dayjs(NaN);
  }

  // 数字类型直接当作毫秒时间戳处理
  if (typeof input === 'number') {
    return dayjs(input);
  }

  // 字符串类型：纯数字（10或13位）当作 Unix 时间戳
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (/^\d{13}$/.test(trimmed)) {
      // 13位毫秒时间戳
      return dayjs(Number(trimmed));
    }
    if (/^\d{10}$/.test(trimmed)) {
      // 10位秒级时间戳
      return dayjs(Number(trimmed) * 1000);
    }
    return dayjs(trimmed);
  }

  return dayjs(input);
}

/**
 * 格式化日期为相对时间 (e.g., "2天前", "1小时前")
 */
export function formatRelativeTime(dateInput: string | number | Date | null | undefined): string {
  const date = parseDateInput(dateInput);
  if (!date.isValid()) return 'N/A';

  const now = dayjs();
  const diffDays = now.diff(date, 'day');

  if (diffDays === 0) {
    const diffHours = now.diff(date, 'hour');
    if (diffHours === 0) {
      const diffMinutes = now.diff(date, 'minute');
      if (diffMinutes < 1) return '刚刚';
      return `${diffMinutes}分钟前`;
    }
    return `${diffHours}小时前`;
  }

  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}周前`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}个月前`;
  }

  return date.format('YYYY-MM-DD');
}

/**
 * 格式化日期为标准格式
 */
export function formatDate(
  dateInput: string | number | Date | null | undefined,
  format = 'YYYY-MM-DD HH:mm'
): string {
  const date = parseDateInput(dateInput);
  if (!date.isValid()) return 'N/A';
  return date.format(format);
}

/**
 * 格式化日期为短格式
 */
export function formatShortDate(dateInput: string | number | Date | null | undefined): string {
  const date = parseDateInput(dateInput);
  if (!date.isValid()) return 'N/A';
  return date.format('MM-DD HH:mm');
}
