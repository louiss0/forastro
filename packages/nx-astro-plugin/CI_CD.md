# CI/CD Setup

This project uses GitHub Actions for continuous integration and deployment with semantic-release for automated versioning and publishing.

## Workflows

### 1. CI/CD (`ci.yml`)
- **Triggers**: Push to `main`/`develop` branches, Pull requests
- **Node.js**: Matrix testing with Node.js 20.x
- **Package Manager**: pnpm with caching
- **Steps**:
  - Install dependencies with `pnpm install --frozen-lockfile`
  - Run linting with `npm run lint`
  - Run tests with `npm run test`
  - Run E2E tests with `npm run test:e2e`
  - Build the project with `npm run build`
  - Automated release on `main` branch using semantic-release

### 2. Publish (`publish.yml`)
- **Triggers**: Version tags (`v*`)
- **Purpose**: Manual publish to npm registry
- **Steps**:
  - Build and publish to npm using `npm publish`

### 3. Dependencies (`dependencies.yml`)
- **Triggers**: Weekly schedule (Monday midnight), Manual dispatch
- **Purpose**: Security audits and dependency updates
- **Steps**:
  - Run `pnpm audit` for security checks
  - Check for outdated packages
  - Create PR for dependency updates (manual trigger only)

## Semantic Release

The project uses semantic-release with Conventional Commits for automated versioning and releases.

### Commit Message Format
Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types:
- `feat`: New feature (minor version bump)
- `fix`: Bug fix (patch version bump)
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `BREAKING CHANGE`: Breaking changes (major version bump)

### Release Process
1. Commits to `main` trigger semantic-release
2. Semantic-release analyzes commits since last release
3. Determines version bump based on commit types
4. Generates changelog
5. Creates GitHub release
6. Publishes to npm

### Branches
- `main`: Production releases
- `develop`: Pre-release versions (alpha/beta)

## Setup Requirements

### GitHub Secrets
Add these secrets to your GitHub repository:

1. **NPM_TOKEN**: npm authentication token for publishing
   - Go to [npm](https://www.npmjs.com/) → Account → Access Tokens
   - Generate new token with "Automation" type
   - Add to GitHub repository secrets

2. **GITHUB_TOKEN**: Automatically provided by GitHub Actions

### Repository Settings
1. Ensure branch protection rules are set for `main` branch
2. Require status checks to pass before merging
3. Enable "Allow auto-merge" for automated releases

## Package Management

The project uses pnpm as the primary package manager with:
- `pnpm install --frozen-lockfile` for clean installs in CI/CD
- `pnpm update` for dependency updates
- `pnpm audit` for security checks
- `pnpm outdated` for checking outdated packages

## Cache Strategy

GitHub Actions cache pnpm dependencies to speed up builds:
- Cache key includes pnpm-lock.yaml hash
- Restores from partial matches for efficiency
- Caches ~/.pnpm-store directory

## Nix Environment Compatibility

- No `.yarnrc*` files to avoid conflicts with nix environments
- Uses pnpm as the primary package manager
- Compatible with nix-shell environments
