/**
 * 日志工具类
 * 提供彩色输出和不同日志级别
 */

import chalk from 'chalk';
import { LogLevel } from '../types/cli';

class Logger {
  private level: LogLevel = 'info';
  private readonly levels: Record<LogLevel, number> = {
    debug: 0,
    verbose: 1,
    info: 2,
    warn: 3,
    error: 4,
  };

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.level];
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(chalk.gray('[DEBUG]'), ...args);
    }
  }

  verbose(...args: unknown[]): void {
    if (this.shouldLog('verbose')) {
      console.log(chalk.blue('[VERBOSE]'), ...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(chalk.cyan('ℹ'), ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(chalk.yellow('⚠'), ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(chalk.red('✗'), ...args);
    }
  }

  success(...args: unknown[]): void {
    console.log(chalk.green('✓'), ...args);
  }

  // 实用方法
  title(text: string): void {
    console.log('\n' + chalk.bold.cyan(text) + '\n');
  }

  item(label: string, value: string): void {
    console.log(`  ${chalk.gray(label + ':')} ${value}`);
  }

  section(title: string): void {
    console.log('\n' + chalk.bold(title));
  }

  divider(): void {
    console.log(chalk.gray('─'.repeat(50)));
  }

  newline(): void {
    console.log();
  }
}

export const logger = new Logger();
