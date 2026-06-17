# Yunxiao CLI - 快速开始指南

## 项目概述

Yunxiao CLI 是一个参考 GitHub CLI 设计的命令行工具，用于管理阿里云云效（Yunxiao）的工作项、评论、流水线与配置。

## 技术栈

- **框架**: Commander.js v11（命令行解析）
- **语言**: TypeScript v5.3
- **输出**: chalk v4（彩色输出）、cli-table3（表格）
- **交互**: inquirer v9（交互式提示）
- **配置**: conf v11（配置存储）
- **测试**: Jest v29
- **Node**: >= 18.0.0

## 安装和开发

### 1. 安装依赖

```bash
cd yunxiao-cli
npm install
```

### 2. 开发模式

```bash
# 开发模式运行（使用 ts-node）
npm run dev -- auth status
npm run dev -- workitem list --verbose

# 或使用 ts-node 直接运行
npx ts-node src/index.ts auth status
```

### 3. 本地测试（npm link）

```bash
# 链接到全局
npm link

# 现在可以全局使用 yunxiao 命令
yunxiao --version
yunxiao auth login
yunxiao workitem list

# 取消链接
npm unlink -g yunxiao-cli
```

### 4. 构建

```bash
# 清理并构建
npm run build

# 监听模式构建
npm run build:watch
```

### 5. 测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 覆盖率报告
npm run test:coverage
```

### 6. 代码质量

```bash
# Lint 检查
npm run lint

# 自动修复
npm run lint:fix

# 格式化代码
npm run format

# 类型检查
npm run typecheck
```

## 使用示例

### 认证

```bash
# 登录
yunxiao auth login
# 提示输入:
# - Organization ID
# - Access Token
# - API Base URL（默认值）

# 查看状态
yunxiao auth status

# 登出
yunxiao auth logout
```

### 工作项管理

```bash
# 列出所有工作项
yunxiao workitem list

# 别名使用
yunxiao wi ls

# 过滤器
yunxiao wi list --status=InDev
yunxiao wi list --assigned-to=@me
yunxiao wi list --type=Task
yunxiao wi list --page=2 --per-page=50

# 查看详情
yunxiao workitem view CLOD-1013
yunxiao wi view CLOD-1013 --json
yunxiao wi view CLOD-1013 --comments --activities

# 创建与更新
yunxiao workitem create
yunxiao workitem update CLOD-1013 --subject "New title"

# JSON 输出
yunxiao wi list --json | jq '.[] | .subject'
```

### 评论管理

```bash
yunxiao comment add CLOD-1013 "Great work!"
yunxiao comment list CLOD-1013
```

### 流水线管理

```bash
# 列出流水线
yunxiao pipeline list
yunxiao pipeline list --status=SUCCESS,RUNNING

# 查看流水线详情
yunxiao pipeline view 12345

# 更新流水线
yunxiao pipeline update 12345 --name "My Pipeline" --file pipeline.yaml

# 查看执行历史
yunxiao pipeline history 12345 --category DEPLOY --identifier deploy-job

# 触发运行
yunxiao pipeline run 12345

# 查看运行记录
yunxiao pipeline runs 12345
yunxiao pipeline run-view 12345 67890
yunxiao pipeline run-latest 12345

# 流水线组
yunxiao pipeline group-list
yunxiao pipeline group-view <group-id>
yunxiao pipeline group-pipelines <group-id>
```

### 配置管理

```bash
yunxiao config set defaults.organization_id <your-org-id>
yunxiao config set defaults.project_id <your-project-id>
yunxiao config get defaults.project_id
yunxiao config list
yunxiao config path
```

### 调试

```bash
# 详细输出
yunxiao --verbose workitem list

# 调试模式
yunxiao --debug workitem view CLOD-1013
```

## 配置文件

配置默认存储在 `~/.config/yunxiao-cli/config.json`：

```json
{
  "defaults": {
    "organization_id": "your-org-id",
    "project_id": "your-project-id",
    "output_format": "table",
    "editor": "vim"
  },
  "auth": {
    "access_token": "your-token",
    "organization_id": "your-org-id",
    "base_url": "https://openapi-rdc.aliyuncs.com/oapi/v1/projex"
  },
  "aliases": {
    "wi": "workitem",
    "pl": "pipeline",
    "ls": "list"
  }
}
```

> 注意：实际存储方式由 `conf` 管理，请勿直接编辑。

## VS Code 调试

已配置 `.vscode/launch.json`：

1. **Debug CLI**: 调试 auth status 命令
2. **Debug Workitem List**: 调试 workitem list 命令
3. **Debug Current Test**: 调试当前测试文件
4. **Run All Tests**: 运行所有测试（带覆盖率）

使用方法：按 F5 或在 Run and Debug 面板选择配置。

## 项目结构

```
yunxiao-cli/
├── src/
│   ├── commands/          # 命令实现
│   │   ├── auth/          # 认证命令
│   │   ├── workitem/      # 工作项命令
│   │   ├── comment/       # 评论命令
│   │   ├── config/        # 配置命令
│   │   └── pipeline/      # 流水线命令
│   ├── formatters/        # 输出格式化
│   │   ├── table.ts       # 表格格式
│   │   ├── json.ts        # JSON 格式
│   │   ├── csv.ts         # CSV 格式
│   │   └── markdown.ts    # Markdown 格式
│   ├── lib/               # API 客户端
│   │   └── yunxiao-client.ts
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   │   ├── auth.ts        # 认证工具
│   │   ├── config.ts      # 配置管理
│   │   ├── logger.ts      # 日志工具
│   │   ├── validators.ts  # 验证器
│   │   └── ...
│   └── index.ts           # 主入口
├── tests/                 # 测试文件
├── bin/yunxiao            # 可执行入口
├── completions/           # Shell 补全脚本
└── dist/                  # 编译输出
```

## 常见问题

### Q: 如何获取 Organization ID？

A: 登录云效 Web 界面，URL 中包含组织 ID。

### Q: 如何获取 Access Token？

A: 云效个人设置 → 访问令牌 → 创建新令牌。

### Q: 如何设置默认项目？

A: 使用 `yunxiao config set defaults.project_id <your-project-id>`。

### Q: 为什么需要 Node.js 18+？

A: 使用了原生 fetch API 和其他现代 Node.js 特性。

## 贡献

欢迎提交 Issue 和 Pull Request！请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## License

MIT
