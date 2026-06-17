# Contributing to Yunxiao CLI

Thank you for your interest in contributing to Yunxiao CLI! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Your environment (OS, Node.js version, yunxiao-cli version)
- Any relevant logs or error messages

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- A detailed description of the proposed feature
- Why this enhancement would be useful
- Possible implementation approach (optional)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes**:
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed
4. **Run tests**: `npm test`
5. **Lint your code**: `npm run lint`
6. **Format your code**: `npm run format`
7. **Commit your changes** using conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for test additions/changes
   - `chore:` for maintenance tasks
8. **Push to your fork** and submit a pull request

### Development Workflow

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/yunxiao-cli.git
cd yunxiao-cli

# Install dependencies
npm install

# Create a branch
git checkout -b feature/my-new-feature

# Make changes and test
npm run dev -- workitem list  # Test your changes
npm test                       # Run tests
npm run lint                   # Lint code

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/my-new-feature
```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code structure and patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Testing

- Write unit tests for new features
- Maintain or improve test coverage
- Test on multiple platforms (macOS, Linux, Windows) if possible
- Include both positive and negative test cases

### Documentation

- Update README.md for user-facing changes
- Update CHANGELOG.md following Keep a Changelog format
- Add JSDoc comments for new functions and classes
- Update command help text for new options

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Examples:

```
feat(workitem): add delete command
fix(auth): handle expired tokens correctly
docs: update installation instructions
```

## Project Structure

```
yunxiao-cli/
├── src/
│   ├── commands/        # Command implementations
│   ├── formatters/      # Output formatters
│   ├── lib/            # External API clients
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── tests/              # Test files
├── scripts/            # Build and utility scripts
└── docs/               # Additional documentation
```

## Testing Guidelines

### Running Tests

```bash
npm test                # Run all tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # With coverage
```

### Writing Tests

- Place tests in `tests/unit/` or `tests/integration/`
- Name test files with `.test.ts` suffix
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

Example:

```typescript
describe('formatWorkitemTable', () => {
  it('should format workitems as a table', () => {
    // Arrange
    const workitems = [
      /* test data */
    ];

    // Act
    const result = formatWorkitemTable(workitems);

    // Assert
    expect(result).toContain('ID');
    expect(result).toContain('Subject');
  });
});
```

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git tag: `git tag -a v0.x.x -m "Release v0.x.x"`
4. Push tag: `git push origin v0.x.x`
5. GitHub Actions will automatically publish to npm

## Getting Help

- Check the [documentation](./README.md)
- Search [existing issues](https://github.com/c2cloud/yunxiao-cli/issues)
- Ask in [discussions](https://github.com/c2cloud/yunxiao-cli/discussions)

## Recognition

Contributors will be recognized in:

- CHANGELOG.md
- GitHub contributors page
- Release notes

Thank you for contributing to Yunxiao CLI! 🎉
