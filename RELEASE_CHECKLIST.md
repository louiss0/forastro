# 🚀 Release Checklist for @forastro/monorepo

## Pre-Release Preparation

### 📋 Environment Setup
- [ ] **NPM Authentication**
  - [ ] NPM_TOKEN is set in GitHub repository secrets
  - [ ] Token has publish access to `@forastro/*` packages
  - [ ] Test npm authentication: `npm whoami`

- [ ] **GitHub Authentication**
  - [ ] GITHUB_TOKEN has required permissions (Contents: write, Pull Requests: write)
  - [ ] Repository settings allow GitHub releases creation
  - [ ] Branch protection rules are configured for `main` branch

### 🔧 Code Quality Checks
- [ ] **All Tests Pass**
  - [ ] Unit tests: `pnpm nx run-many --target test --all`
  - [ ] E2E tests: `pnpm nx run-many --target e2e --all`
  - [ ] Linting: `pnpm nx run-many --target lint --all`

- [ ] **Build Verification**
  - [ ] All packages build successfully: `pnpm nx run-many --target build --all`
  - [ ] Check built packages in `/dist/packages/`
  - [ ] Verify package.json files have correct information

- [ ] **Documentation**
  - [ ] README files are up to date
  - [ ] API documentation is current
  - [ ] CHANGELOG entries are accurate (auto-generated)

### 📦 Package Validation
- [ ] **Version Consistency**
  - [ ] Check current versions: `pnpm nx release version --dry-run`
  - [ ] Verify dependency versions between packages
  - [ ] Ensure peer dependency ranges are correct

- [ ] **Package Content**
  - [ ] All required files are included in `files` array
  - [ ] Main and exports fields point to correct built files
  - [ ] TypeScript definitions are generated and included

## Release Execution

### 🎯 Automated Release (Recommended)
If using GitHub Actions:
- [ ] Create release PR with conventional commit messages
- [ ] Merge PR to `main` branch
- [ ] Monitor GitHub Actions workflow execution
- [ ] Verify release completion in GitHub releases page

### 🔧 Manual Release Process
If running releases manually:

#### Step 1: Version Bump
```bash
# Dry run to preview changes
pnpm nx release version --dry-run

# Execute version bump (creates tags and changelogs)
pnpm nx release version
```
- [ ] Verify version numbers are correct
- [ ] Check generated CHANGELOG.md files
- [ ] Confirm git tags were created

#### Step 2: Build Packages
```bash
# Build all packages
pnpm exec nx run-many --target build --projects 'tag:nx:lib:ongoing'
```
- [ ] All builds complete successfully
- [ ] Check `/dist/packages/` contents
- [ ] Verify built package.json versions match tags

#### Step 3: Publish to npm
```bash
# Dry run first
pnpm nx release publish --dry-run

# Publish to npm
pnpm nx release publish
```
- [ ] All packages publish successfully
- [ ] Verify packages appear on npmjs.com
- [ ] Check package installation: `npm info @forastro/[package-name]`

#### Step 4: GitHub Release
- [ ] GitHub releases are created automatically (configured in nx.json)
- [ ] Release notes include generated changelogs
- [ ] Release artifacts are properly attached

## Post-Release Verification

### ✅ Publication Checks
- [ ] **NPM Registry**
  - [ ] All packages visible at https://www.npmjs.com/~[username]
  - [ ] Version numbers match release tags
  - [ ] Package metadata is correct (description, keywords, etc.)

- [ ] **GitHub Releases**
  - [ ] Releases created for each package with version tags
  - [ ] Release notes include relevant changes
  - [ ] Release assets are properly attached

### 🔍 Integration Testing
- [ ] **Package Installation**
  - [ ] Test installation in fresh project: `npm install @forastro/[package]`
  - [ ] Verify imports work correctly
  - [ ] Check TypeScript definitions are available

- [ ] **Documentation Updates**
  - [ ] Update main repository README if needed
  - [ ] Notify documentation site of new versions
  - [ ] Update example projects if needed

### 📢 Communication
- [ ] **Team Notification**
  - [ ] Announce release in team channels
  - [ ] Update internal documentation
  - [ ] Share breaking changes if any

- [ ] **Community Updates**
  - [ ] Social media announcements (if applicable)
  - [ ] Update project website/blog
  - [ ] Notify major users of breaking changes

## Troubleshooting

### 🔧 Common Issues

#### NPM Publishing Fails
- Check NPM_TOKEN is valid and has proper permissions
- Verify package name isn't already taken
- Ensure version number is higher than existing

#### GitHub Release Creation Fails
- Verify GITHUB_TOKEN permissions
- Check repository settings allow release creation
- Ensure git tags exist and are pushed

#### Package Not Found After Publishing
- Wait 5-10 minutes for npm registry propagation
- Clear npm cache: `npm cache clean --force`
- Check package privacy settings

### 📞 Emergency Procedures
If a release needs to be reverted:
- [ ] Unpublish from npm (only within 72 hours): `npm unpublish @forastro/[package]@[version]`
- [ ] Delete GitHub release and tags if needed
- [ ] Revert version changes in source code
- [ ] Communicate issue to users

## Next Release Preparation
After successful release:
- [ ] Review release process and update checklist if needed
- [ ] Plan next release cycle
- [ ] Update project roadmap
- [ ] Set up monitoring for new version usage

---

## Package List
Current packages in the monorepo:
- `@forastro/asciidoc` - Asciidoc integration for Astro
- `@forastro/utilities` - Utility components and functions
- `@forastro/nx-astro-plugin` - Nx plugin for Astro projects
- `@forastro/test-publish` - Test package for publishing workflow
- `@forastro/starlight-asciidoc` - Starlight integration for Asciidoc

## Useful Commands
```bash
# Check current versions
pnpm nx release version --dry-run

# Build all packages
pnpm nx run-many --target build --all

# Test all packages
pnpm nx run-many --target test --all

# Publish dry run
pnpm nx release publish --dry-run

# Full release process
pnpm nx release
```

---

**Last Updated**: January 7, 2025  
**For Questions**: Contact repository maintainers or check the automation setup documentation.
