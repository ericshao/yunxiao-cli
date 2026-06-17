/**
 * 认证工具
 * 处理用户认证和 API 客户端创建
 */

import inquirer from 'inquirer';
import { YunxiaoApiClient } from '../lib/yunxiao-client';
import { YunxiaoConfig } from '../types/yunxiao';
import { configManager } from './config';
import { logger } from './logger';

/**
 * 获取已认证的 API 客户端
 */
export async function getAuthenticatedClient(): Promise<YunxiaoApiClient> {
  const auth = configManager.getAuth();

  if (!auth?.access_token || !auth?.organization_id) {
    logger.error('Not authenticated. Please run: yunxiao auth login');
    process.exit(1);
  }

  const config: YunxiaoConfig = {
    organizationId: auth.organization_id,
    accessToken: auth.access_token,
    baseURL: auth.base_url || 'https://openapi-rdc.aliyuncs.com/oapi/v1/projex',
  };

  return new YunxiaoApiClient(config);
}

/**
 * 登录流程
 */
export async function login(): Promise<void> {
  logger.title('🔐 Yunxiao Authentication');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'organizationId',
      message: 'Organization ID:',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Organization ID is required';
        }
        return true;
      },
    },
    {
      type: 'password',
      name: 'accessToken',
      message: 'Access Token:',
      mask: '*',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Access Token is required';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'baseURL',
      message: 'API Base URL:',
      default: 'https://openapi-rdc.aliyuncs.com/oapi/v1/projex',
    },
  ]);

  // 验证凭证
  logger.verbose('Verifying credentials...');
  try {
    const client = new YunxiaoApiClient({
      organizationId: answers.organizationId,
      accessToken: answers.accessToken,
      baseURL: answers.baseURL,
    });

    // 尝试一个简单的 API 调用来验证凭证
    await client.searchWorkitems({
      spaceId: 'test',
      category: 'Task',
      page: 1,
      perPage: 1,
    });

    // 保存认证信息
    configManager.setAuth({
      access_token: answers.accessToken,
      organization_id: answers.organizationId,
      base_url: answers.baseURL,
    });

    logger.success('Authentication successful');
    logger.item('Organization ID', answers.organizationId);
    logger.item('Config file', configManager.getConfigPath());
  } catch (error) {
    logger.error('Authentication failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    throw error;
  }
}

/**
 * 登出
 */
export function logout(): void {
  if (!configManager.isAuthenticated()) {
    logger.warn('Not currently logged in');
    return;
  }

  configManager.clearAuth();
  logger.success('Logged out successfully');
}

/**
 * 获取认证状态
 */
export function getAuthStatus(): {
  authenticated: boolean;
  organizationId?: string;
  baseURL?: string;
} {
  const auth = configManager.getAuth();

  if (!auth?.access_token || !auth?.organization_id) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    organizationId: auth.organization_id,
    baseURL: auth.base_url,
  };
}

/**
 * 显示认证状态
 */
export function showAuthStatus(): void {
  const status = getAuthStatus();

  if (!status.authenticated) {
    logger.info('Not authenticated');
    logger.info('Run "yunxiao auth login" to authenticate');
    return;
  }

  logger.title('Authentication Status');
  logger.item('Status', '✓ Authenticated');
  logger.item('Organization ID', status.organizationId || 'N/A');
  logger.item('API Base URL', status.baseURL || 'N/A');
  logger.item('Config file', configManager.getConfigPath());
}
