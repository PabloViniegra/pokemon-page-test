# Contributing

Thank you for your interest in contributing to this project. This document outlines the process for submitting contributions.

## How to Contribute

### 1. Fork the Repository

Click the **Fork** button at the top right of the repository page on GitHub to create your own copy of the project.

### 2. Clone Your Fork

```bash
git clone https://github.com/your-username/pokemon-page-test.git
cd pokemon-page-test
```

### 3. Set Up the Project

```bash
pnpm install
```

### 4. Create an Issue

Before starting work, check the [Issues](https://github.com/your-username/pokemon-page-test/issues) page to see if a related issue already exists. If not, create a new issue describing the bug, feature request, or improvement you want to address. This helps maintainers provide feedback early and avoid duplicated effort.

### 5. Create a Branch

Create a new branch from the `main` branch. Use a descriptive branch name that reflects the work you are doing:

```bash
git checkout main
git pull origin main
git checkout -b fix/login-bug
# or
git checkout -b feat/add-dark-mode
```

Branch naming conventions:

- `fix/` for bug fixes
- `feat/` for new features
- `docs/` for documentation changes
- `refactor/` for code refactoring
- `test/` for adding or updating tests
- `chore/` for maintenance tasks

### 6. Make Your Changes

Implement your changes following the project's code style and conventions. Make sure to:

- Follow the existing code style (Prettier is configured)
- Add or update tests where applicable
- Keep commits focused and atomic

Run the following commands before committing:

```bash
# Format your code
pnpm format

# Run tests
pnpm test

# Typecheck and build
pnpm build
```

### 7. Commit Your Changes

Write clear, concise commit messages that explain the purpose of the change:

```bash
git add .
git commit -m "fix: resolve scroll restoration on back navigation"
```

### 8. Push and Create a Pull Request

Push your branch to your fork and open a pull request against the `main` branch of the upstream repository:

```bash
git push origin your-branch-name
```

When creating the pull request:

- Reference the related issue number in the description (e.g., "Closes #12")
- Provide a clear summary of the changes and the reasoning behind them
- Include screenshots or screen recordings for UI changes
- List any manual testing steps you performed

### 9. Address Review Feedback

A maintainer will review your pull request and may request changes. Make the requested updates in the same branch and push them — the pull request will update automatically.

## Development Guidelines

- Always use the Composition API with `<script setup lang="ts">`
- Run `pnpm build` before submitting to ensure type checking passes
- Do not commit generated files or secrets
- Keep dependencies up to date and avoid adding unnecessary packages

## Reporting Bugs

When reporting a bug, include:

- A clear description of the expected vs. actual behavior
- Steps to reproduce the issue
- Browser and OS information
- Screenshots or console errors if applicable

## Feature Requests

When proposing a feature, include:

- A description of the problem the feature solves
- How the feature would work from a user's perspective
- Any relevant mockups or examples
