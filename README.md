# Yunxiao CLI（云效命令行工具）

[![CI](https://github.com/c2cloud/yunxiao-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/c2cloud/yunxiao-cli/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/yunxiao-cli.svg)](https://www.npmjs.com/package/yunxiao-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> 面向阿里云云效（Yunxiao）的命令行工具，支持工作项、评论、流水线与配置管理。

## 特性

- 🚀 **工作项管理**：列出、查看、创建、更新工作项
- 💬 **评论操作**：为工作项添加与查看评论
- 🔄 **流水线管理**：管理流水线、流水线组、运行记录与执行历史
- 📊 **多种输出格式**：表格、JSON、CSV、Markdown
- 🔐 **安全认证**：安全的 Token 存储
- 🎨 **美观的 CLI**：彩色输出与进度指示器
- ⚡ **高效**：分页、过滤与缓存支持
- ⌨️ **Shell 自动补全**：支持 Bash、Zsh、Fish

## 安装

```bash
npm install -g yunxiao-cli
```

安装后即可使用 `yunxiao` 或别名 `yx`：

```bash
yunxiao --version
yx --help
```

## 快速开始

```bash
# 登录云效
yunxiao auth login

# 列出工作项
yunxiao workitem list

# 查看工作项详情
yunxiao workitem view CLOD-1013

# 创建新工作项
yunxiao workitem create

# 添加评论
yunxiao comment add CLOD-1013 "This is a comment"

# 列出流水线
yunxiao pipeline list
```

更多示例请参考 [QUICKSTART.md](./QUICKSTART.md)。

## 命令总览

### 认证

```bash
yunxiao auth login              # 使用凭据登录
yunxiao auth status             # 查看认证状态
yunxiao auth logout             # 登出
```

### 工作项管理

```bash
yunxiao workitem list           # 列出工作项
yunxiao wi list --status=InDev  # 按状态过滤
yunxiao wi list --assigned-to=@me  # 按负责人过滤
yunxiao wi view CLOD-1013       # 查看工作项详情
yunxiao wi create               # 交互式创建工作项
yunxiao wi update CLOD-1013 --subject "New title"  # 更新工作项
```

### 评论管理

```bash
yunxiao comment add CLOD-1013 "Comment text"
yunxiao comment list CLOD-1013
```

### 配置管理

```bash
yunxiao config get <key>
yunxiao config set <key> <value>
yunxiao config list
yunxiao config path
```

### 流水线管理

```bash
yunxiao pipeline list                       # 列出流水线
yunxiao pipeline view <pipeline-id>         # 查看流水线详情
yunxiao pipeline update <id> --name "Name" --file pipeline.yaml
yunxiao pipeline history <id> --category DEPLOY --identifier deploy-job
yunxiao pipeline run <id>                   # 触发流水线运行
yunxiao pipeline runs <id>                  # 列出流水线运行记录
yunxiao pipeline run-view <pipeline-id> <run-id>
yunxiao pipeline run-latest <pipeline-id>

# 流水线组
yunxiao pipeline group-list
yunxiao pipeline group-view <group-id>
yunxiao pipeline group-pipelines <group-id>
```

## 配置

配置文件默认存储在 `~/.config/yunxiao-cli/config.json`（由 [`conf`](https://github.com/sindresorhus/conf) 管理）。

你可以通过 `yunxiao config` 命令管理默认配置：

```bash
yunxiao config set defaults.organization_id <your-org-id>
yunxiao config set defaults.project_id <your-project-id>
yunxiao config set defaults.output_format table
```

## Shell 自动补全

项目已在 `completions/` 目录下预生成 Bash、Zsh、Fish 补全脚本。安装后可直接使用：

```bash
# Bash
source completions/yunxiao.bash
# 或复制到系统补全目录
sudo cp completions/yunxiao.bash /usr/local/etc/bash_completion.d/yunxiao

# Zsh
source completions/yunxiao.zsh
# 或复制到 $fpath 中的目录
sudo cp completions/yunxiao.zsh /usr/local/share/zsh/site-functions/_yunxiao

# Fish
mkdir -p ~/.config/fish/completions
cp completions/yunxiao.fish ~/.config/fish/completions/
```

> 提示：本地开发时可通过 `npm run completions` 重新生成补全脚本。

## 开发

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev -- workitem list

# 构建
npm run build

# 运行测试
npm test

# Lint 与格式化
npm run lint:fix
npm run format
```

## 贡献

欢迎提交 Issue 和 Pull Request！请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 许可证

[MIT](./LICENSE)
