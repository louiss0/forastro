# Release Process Documentation

This document outlines the complete release process for the ForAstro monorepo, including conventional commits, versioning strategies, and automation workflows.

## Overview

The ForAstro monorepo uses **Nx Release** with **independent versioning** for packages, following **Angular Conventional Commits** standard. This allows each package to be versioned and released independently based on its individual changes.

## Package Versioning Strategy

### Independent Versioning

Each package in the `packages/` directory maintains its own version number and release cycle:

- **`@forastro/asciidoc`**: Currently at v0.0.3
- **`@forastro/utilities`**: Currently at v5.1.3
- **`@forastro/starlight-asciidoc`**: Independent versioning
- **`@forastro/nx-astro-plugin`**: Independent versioning
- **`@forastro/test-publish`**: Independent versioning

This approach provides:
- Flexibility to release packages at different cadences
- Clear version history per package
- Reduced impact of breaking changes across packages
- Better semantic versioning alignment with actual changes

## Conventional Commits Standard

All commits must follow Angular's Conventional Commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

- **feat**: New features (triggers MINOR version bump)
- **fix**: Bug fixes (triggers PATCH version bump)
- **docs**: Documentation changes
- **style**: Code formatting changes
- **refactor**: Code refactoring without feature changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **BREAKING CHANGE**: Breaking changes (triggers MAJOR version bump)

### Scope Guidelines

For monorepo commits, use the pattern `(package/filename)`:
- `package`: The top-level folder in the root (e.g., `packages`, `apps`, `templates`)
- `filename`: The specific file being modified (without extension)

Examples:
- `feat(packages/asciidoc): add new loader function`
- `fix(apps/docs): resolve navigation issue`
- `docs(templates/astro-minimal): update installation guide`

## Release Workflow

### Automated Release (Recommended)

Use the single command to perform the complete release:

```bash
pnpm exec nx release
```

This command automatically:
1. Analyzes conventional commits since the last release
2. Determines version bumps for affected packages
3. Updates package.json versions
4. Generates/updates CHANGELOG.md files
5. Creates Git tags
6. Publishes packages to npm
7. Creates GitHub releases

### Manual Step-by-Step Release

If the automated process fails, perform these steps individually:

```bash
# 1. Generate changelogs
nx release changelog

# 2. Bump package versions
nx release version

# 3. Publish to npm
nx release publish
```

### Pre-Release Validation

Before running the release process:

1. **Ensure all packages build successfully**:
   ```bash
   pnpm exec nx run-many --target build --projects 'tag:nx:lib:ongoing'
   ```

2. **Run all tests**:
   ```bash
   pnpm exec nx run-many --target test --all
   ```

3. **Verify Git status is clean**:
   ```bash
   git status
   ```

## Git Flow Integration

### Release Branch Workflow

1. **Create release branch from develop**:
   ```bash
   git checkout develop
   git checkout -b release/v1.2.0
   ```

2. **Run release process on release branch**:
   ```bash
   pnpm exec nx release
   ```

3. **Merge release branch to main and develop**:
   ```bash
   # Merge to main
   git checkout main
   git merge release/v1.2.0
   
   # Merge back to develop
   git checkout develop
   git merge release/v1.2.0
   
   # Clean up
   git branch -d release/v1.2.0
   ```

### Hotfix Release Workflow

1. **Create hotfix branch from main**:
   ```bash
   git checkout main
   git checkout -b hotfix/critical-bug
   ```

2. **Make necessary fixes and commit**:
   ```bash
   git add .
   git commit -m "fix(packages/asciidoc): resolve critical security issue"
   ```

3. **Run release process**:
   ```bash
   pnpm exec nx release
   ```

4. **Merge to both main and develop**:
   ```bash
   git checkout main
   git merge hotfix/critical-bug
   
   git checkout develop
   git merge hotfix/critical-bug
   
   git branch -d hotfix/critical-bug
   ```

## Package Tagging Strategy

Packages use Nx tags to control build and release processes:

- **`lib:ongoing`**: Actively maintained packages that should be built and released
- **`lib:paused`**: Deprecated packages that are no longer maintained

### Updating Package Tags

Edit `project.json` in each package directory:

```json
{
  "name": "package-name",
  "tags": ["nx:lib:ongoing"]
}
```

## Publishing Configuration

### NPM Registry

All packages are published to the public NPM registry under the `@forastro` scope:

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

### Package Files

Each package specifies which files to include in the published package:

```json
{
  "files": [
    "*.js",
    "*.d.ts",
    "lib/",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ]
}
```

## GitHub Integration

The release process automatically creates GitHub releases when configured in `nx.json`:

```json
{
  "release": {
    "changelog": {
      "projectChangelogs": {
        "createRelease": "github"
      }
    }
  }
}
```

## Environment Variables

Ensure these environment variables are set for publishing:

- **`NPM_TOKEN`**: NPM authentication token for publishing
- **`GITHUB_TOKEN`**: GitHub token for creating releases (optional)

## Build Process Integration

### Pre-Version Build

The release process automatically builds all ongoing packages before versioning:

```json
{
  "version": {
    "preVersionCommand": "pnpm exec nx run-many --target 'build' --projects 'tag:nx:lib:ongoing'"
  }
}
```

### ESBuild Configuration

Each package uses a custom ESBuild configuration with the `replaceValuesInExportsPlugin` to ensure correct export paths after building.

## Troubleshooting Common Issues

This section covers common problems encountered during the release process and their solutions.

### Authentication Issues

#### NPM Token Problems

**Problem**: `npm publish` fails with authentication error

**Symptoms**:
```bash
npm ERR! 401 Unauthorized - PUT https://registry.npmjs.org/@forastro%2fasciidoc
npm ERR! You must be logged in to publish packages.
```

**Solutions**:
1. **Check NPM_TOKEN environment variable**:
   ```bash
   echo $NPM_TOKEN  # Should return your npm token
   ```

2. **Generate new npm token**:
   - Go to [npmjs.com](https://www.npmjs.com/) → Account → Access Tokens
   - Create "Automation" token
   - Add token to environment: `export NPM_TOKEN=your_token_here`

3. **Verify npm login**:
   ```bash
   npm whoami  # Should return your username
   ```

#### GitHub Token Issues

**Problem**: GitHub releases fail to create

**Solutions**:
1. **In GitHub Actions**: Token is provided automatically
2. **Local development**: Create personal access token with repo permissions
3. **Verify permissions**: Ensure token has `Contents: write` and `Pull requests: write`

### Build Failures

#### Package Build Errors

**Problem**: Packages fail to build before release

**Symptoms**:
```bash
> NX   Running target build for projects:
❌ @forastro/asciidoc
```

**Solutions**:
1. **Build individual package**:
   ```bash
   pnpm nx build asciidoc
   ```

2. **Check dependencies**:
   ```bash
   pnpm install --frozen-lockfile
   ```

3. **Clear Nx cache**:
   ```bash
   pnpm nx reset
   ```

4. **Check TypeScript errors**:
   ```bash
   pnpm nx run asciidoc:check
   ```

#### ESBuild Configuration Issues

**Problem**: Build succeeds but exports are incorrect

**Solution**: Verify `replaceValuesInExportsPlugin` configuration in package's `esbuild.config.cts`

### Version Conflicts

#### No Changes Detected

**Problem**: `nx release` says "No changes to release"

**Solutions**:
1. **Check commit messages**: Ensure they follow conventional commits
   ```bash
   git log --oneline --since="last release"
   ```

2. **Force version bump**:
   ```bash
   nx release version --specifier=patch  # or minor/major
   ```

3. **Check git tags**:
   ```bash
   git tag --list --sort=-version:refname
   ```

#### Dirty Working Directory

**Problem**: Release fails due to uncommitted changes

**Solution**:
```bash
git status  # Check what's uncommitted
git add .
git commit -m "chore(root): prepare for release"
```

### Package-Specific Issues

#### Package Not Found in Build

**Problem**: Package excluded from release

**Solution**: Check package tags in `project.json`:
```json
{
  "tags": ["nx:lib:ongoing"]  // Must include this tag
}
```

#### Incorrect Package Version

**Problem**: Package version doesn't match expected bump

**Solution**: Check conventional commit messages and manually adjust if needed:
```bash
nx release version --dry-run  # Preview changes
nx release version --specifier=minor  # Force specific bump
```

### Registry and Publishing Issues

#### Package Already Exists

**Problem**: Version already published to npm

**Solutions**:
1. **Check published versions**:
   ```bash
   npm view @forastro/asciidoc versions --json
   ```

2. **Bump version manually**:
   ```bash
   nx release version --specifier=patch
   ```

#### Scope Authorization

**Problem**: Cannot publish to `@forastro` scope

**Solution**: Ensure you're a member of the `@forastro` organization on npm

### Git Flow Integration Issues

#### Release Branch Conflicts

**Problem**: Merge conflicts when merging release branch

**Solutions**:
1. **Update develop branch first**:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Rebase release branch**:
   ```bash
   git checkout release/2024-01-07
   git rebase develop
   ```

3. **Resolve conflicts and continue**:
   ```bash
   # Fix conflicts in files
   git add .
   git rebase --continue
   ```

### Automation Issues

#### GitHub Actions Failures

**Problem**: CI/CD pipeline fails during release

**Common causes and solutions**:

1. **Missing secrets**:
   - Add `NPM_TOKEN` to repository secrets
   - Verify `GITHUB_TOKEN` permissions

2. **Node.js version mismatch**:
   - Update `.github/workflows/release.yml` Node version
   - Match version with `.nvmrc` or `package.json`

3. **pnpm cache issues**:
   - Clear cache in workflow
   - Update pnpm version in workflow

4. **Build timeout**:
   - Increase timeout in workflow
   - Optimize build process

### Recovery Procedures

#### Failed Release Recovery

**If release partially completes**:

1. **Check what was published**:
   ```bash
   npm view @forastro/asciidoc version
   npm view @forastro/utilities version
   ```

2. **Complete remaining steps**:
   ```bash
   # If only some packages published
   nx release publish --projects=remaining-package
   
   # If GitHub releases missing
   # They will be created automatically on next release
   ```

3. **Clean up failed state**:
   ```bash
   # Remove local tags if needed
   git tag -d v1.2.3
   
   # Reset to previous state
   git reset --hard HEAD~1
   ```

### Getting Help

#### Debug Information to Collect

When reporting issues, include:

1. **Environment info**:
   ```bash
   node --version
   pnpm --version
   nx --version
   git --version
   ```

2. **Repository state**:
   ```bash
   git status
   git log --oneline -10
   git tag --list --sort=-version:refname | head -5
   ```

3. **Package info**:
   ```bash
   pnpm nx show projects
   cat nx.json | grep -A 10 "release"
   ```

4. **Full error logs** with `--verbose` flag

#### Useful Commands for Debugging

```bash
# Dry run release to see what would happen
nx release --dry-run

# Check package configuration
nx release changelog --dry-run
nx release version --dry-run

# Verify build configuration
nx show project asciidoc --web

# Check git configuration
git config --list | grep -E "(user|core|remote)"
```

For additional help, refer to:
- `PUBLISHING_VERIFICATION_REPORT.md` for configuration verification
- [Nx Release documentation](https://nx.dev/features/manage-releases)
- [Conventional Commits specification](https://www.conventionalcommits.org/)

## Next Steps

- Set up automated release workflows with GitHub Actions (see GitHub Actions workflow section)
- Configure pre-commit hooks for conventional commits validation
- Implement additional quality gates before releases
