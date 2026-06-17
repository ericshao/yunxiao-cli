/**
 * 进度指示工具
 */

import ora, { Ora } from 'ora';

/**
 * 带进度指示的异步操作包装器
 */
export async function withProgress<T>(message: string, fn: () => Promise<T>): Promise<T> {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail();
    throw error;
  }
}

/**
 * 创建进度指示器
 */
export function createSpinner(text?: string): Ora {
  return ora(text);
}
