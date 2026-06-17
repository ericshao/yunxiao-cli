# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-06-17

### Added

- Pipeline command group for pipeline, group, run, and history management
- Config command group for configuration management
- CSV and Markdown output formats
- Shell completion scripts for Bash, Zsh, and Fish
- GitHub Actions CI/CD workflows

### Changed

- Improved error messages and user feedback
- Enhanced type safety across codebase
- Updated README and QUICKSTART for open-source release

### Fixed

- Type conversion issues in config commands
- ESLint warnings in various files

## [0.2.0] - 2026-01-11

### Added

- Workitem create command with interactive mode
- Workitem update command with field-level updates
- Comment add command with editor integration
- Comment list command with threaded display
- Support for comment replies
- Configuration management for defaults (space_id)
- 5 new unit tests for commands (total 15 tests)

### Changed

- Updated all dependencies to latest versions
- Improved interactive prompts with better UX
- Enhanced table formatting for comments

### Fixed

- Configuration manager type safety issues
- Editor integration for long text inputs

## [0.1.0] - 2026-01-10

### Added

- Initial release
- Authentication commands (login, logout, status)
- Workitem list command with filtering and pagination
- Workitem view command with details
- Table and JSON output formats
- Encrypted configuration storage
- Colorful CLI output with progress indicators
- Input validation for all commands
- 10 unit tests for validators

### Infrastructure

- TypeScript setup with strict mode
- Jest testing framework
- ESLint and Prettier configuration
- VS Code debugging configuration
- Comprehensive documentation

[Unreleased]: https://github.com/c2cloud/yunxiao-cli/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/c2cloud/yunxiao-cli/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/c2cloud/yunxiao-cli/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/c2cloud/yunxiao-cli/releases/tag/v0.1.0
