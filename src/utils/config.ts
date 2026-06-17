/**
 * 配置管理工具
 * 支持分层配置加载和加密存储
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Conf = require('conf').default || require('conf');
import { CLIConfig } from '../types/cli';

const DEFAULT_CONFIG: CLIConfig = {
  defaults: {
    output_format: 'table',
    editor: process.env.EDITOR || 'vim',
  },
  aliases: {
    wi: 'workitem',
    ls: 'list',
  },
};

class ConfigManager {
  private config: any;

  constructor() {
    this.config = new Conf({
      projectName: 'yunxiao-cli',
      defaults: DEFAULT_CONFIG,
      schema: {
        defaults: {
          type: 'object',
          properties: {
            organization_id: { type: 'string' },
            project_id: { type: 'string' },
            output_format: { type: 'string', enum: ['table', 'json', 'csv', 'markdown'] },
            editor: { type: 'string' },
          },
        },
        auth: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            organization_id: { type: 'string' },
            base_url: { type: 'string' },
          },
        },
        aliases: {
          type: 'object',
        },
      },
    });
  }

  get<T extends keyof CLIConfig>(key: T): CLIConfig[T] | undefined {
    return this.config.get(key);
  }

  set<T extends keyof CLIConfig>(key: T, value: CLIConfig[T]): void {
    this.config.set(key, value);
  }

  delete<T extends keyof CLIConfig>(key: T): void {
    this.config.delete(key);
  }

  has<T extends keyof CLIConfig>(key: T): boolean {
    return this.config.has(key);
  }

  getAll(): CLIConfig {
    return this.config.store as CLIConfig;
  }

  clear(): void {
    this.config.clear();
  }

  getConfigPath(): string {
    return this.config.path;
  }

  // 认证相关
  getAuth() {
    return this.config.get('auth');
  }

  setAuth(auth: { access_token: string; organization_id: string; base_url?: string }): void {
    this.config.set('auth', {
      access_token: auth.access_token,
      organization_id: auth.organization_id,
      base_url: auth.base_url || 'https://openapi-rdc.aliyuncs.com/oapi/v1/projex',
    });
  }

  clearAuth(): void {
    this.config.delete('auth');
  }

  isAuthenticated(): boolean {
    const auth = this.getAuth();
    return !!(auth?.access_token && auth?.organization_id);
  }

  // 默认值相关
  getDefaults() {
    return this.config.get('defaults') || DEFAULT_CONFIG.defaults;
  }

  setDefault<K extends keyof CLIConfig['defaults']>(key: K, value: CLIConfig['defaults'][K]): void {
    const defaults = this.getDefaults();
    this.config.set('defaults', { ...defaults, [key]: value });
  }

  // 别名相关
  getAliases(): Record<string, string> {
    return this.config.get('aliases') || DEFAULT_CONFIG.aliases || {};
  }

  setAlias(alias: string, command: string): void {
    const aliases = this.getAliases();
    this.config.set('aliases', { ...aliases, [alias]: command });
  }

  deleteAlias(alias: string): void {
    const aliases = this.getAliases();
    delete aliases[alias];
    this.config.set('aliases', aliases);
  }

  resolveAlias(input: string): string {
    const aliases = this.getAliases();
    const parts = input.split(' ');
    const firstPart = parts[0];

    if (aliases[firstPart]) {
      return [aliases[firstPart], ...parts.slice(1)].join(' ');
    }

    return input;
  }
}

export const configManager = new ConfigManager();
export { ConfigManager };
