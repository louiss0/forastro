# @forastro/test-publish

A test package created to demonstrate and validate the correct Nx publishing setup for the forastro monorepo.

## Purpose

This package serves as a reference implementation and validation tool for:

- Proper package.json configuration with all required publishing fields
- tsup configuration matching patterns used in other forastro packages
- Correct Nx release configuration in project.json
- Integration with the `nx:lib:ongoing` tag for inclusion in the release process
- TypeScript compilation and ESM module exports
- Comprehensive test coverage

## Features

- **TypeScript Support**: Full TypeScript with type definitions
- **ESM Modules**: Modern ES module format
- **tsup Bundling**: Fast bundling with tsup
- **Nx Integration**: Proper Nx workspace integration for releases
- **Test Coverage**: Comprehensive unit tests with Vitest

## API

### `testPublish()`

Returns a simple string identifier to validate basic functionality.

```typescript
import { testPublish } from '@forastro/test-publish';

console.log(testPublish()); // 'test-publish'
```

### `validatePublishSetup(config: PublishConfig)`

Validates package configuration for publishing readiness.

```typescript
import { validatePublishSetup } from '@forastro/test-publish';

const result = validatePublishSetup({
  packageName: '@forastro/my-package',
  version: '1.0.0',
  registry: 'https://registry.npmjs.org/'
});

console.log(result.isValid); // true/false
```

### `PACKAGE_INFO`

Constants containing package metadata.

```typescript
import { PACKAGE_INFO } from '@forastro/test-publish';

console.log(PACKAGE_INFO.name); // '@forastro/test-publish'
console.log(PACKAGE_INFO.features); // ['TypeScript', 'ESM', 'tsup bundling', 'Nx release']
```

## Development

### Building

```bash
# Build using tsup (configured in package.json)
pnpm nx build:test-publish

# Or run the script directly
cd packages/test-publish
pnpm build
```

### Testing

```bash
# Run unit tests
pnpm nx test test-publish
```

### Publishing

This package is included in the Nx release process via the `nx:lib:ongoing` tag.

```bash
# Release all ongoing packages
pnpm nx release
```

## Configuration Files

- `package.json` - Publishing configuration with proper exports and metadata
- `tsup.config.ts` - Build configuration using the forastro tsup pattern
- `project.json` - Nx project configuration with release settings

## License

See the main forastro repository for license information.
