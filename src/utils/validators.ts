/**
 * 输入验证工具
 */

/**
 * 验证工作项 ID 格式
 */
export function isValidWorkitemId(id: string): boolean {
  // 工作项 ID 格式: PROJECTCODE-NUMBER (例如: CLOD-1013)
  return /^[A-Z]+-\d+$/.test(id);
}

/**
 * 验证组织 ID
 */
export function isValidOrganizationId(id: string): boolean {
  return id.length > 0 && id.length <= 64;
}

/**
 * 验证项目 ID/空间 ID
 */
export function isValidProjectId(id: string): boolean {
  return id.length > 0 && id.length <= 64;
}

/**
 * 验证输出格式
 */
export function isValidOutputFormat(
  format: string
): format is 'table' | 'json' | 'csv' | 'markdown' {
  return ['table', 'json', 'csv', 'markdown'].includes(format);
}

/**
 * 验证页码
 */
export function isValidPage(page: number): boolean {
  return Number.isInteger(page) && page > 0;
}

/**
 * 验证每页数量
 */
export function isValidPerPage(perPage: number): boolean {
  return Number.isInteger(perPage) && perPage > 0 && perPage <= 100;
}
