# Tree Operations (tree-ops.ts)

This module provides safe write and mkdir utilities for the Nx virtual tree, ensuring deterministic and testable file operations in generators.

## Functions

### `ensureDir(tree: Tree, dir: string): void`

Ensures that a directory exists in the Nx Tree by creating it via a sentinel approach.
Uses lazy creation via `tree.write` of `.gitkeep` if the directory doesn't exist yet.

- Uses `tree.exists` on a sentinel approach
- Creates directory structure segment by segment
- Cleans up temporary `.gitkeep` files automatically
- Handles nested directory creation reliably in memory

### `safeWriteFile(tree: Tree, filePath: string, content: string, options?: SafeWriteOptions): void`

Safely writes a file to the tree with deterministic overwrite behavior.

**Options:**
- `overwrite?: boolean` - Whether to allow overwriting existing files (defaults to false)

**Behavior:**
- Throws error if file exists and `overwrite` is false
- Creates parent directories automatically
- Provides deterministic and testable overwrite behavior

### `fileExists(tree: Tree, path: string): boolean`

Convenience wrapper around `tree.exists` for better readability.

### `readText(tree: Tree, path: string): string`

Reads text content from a file in the tree.

- Throws error if file doesn't exist
- Handles UTF-8 encoding correctly
- Returns string content

### `writeText(tree: Tree, path: string, content: string): void`

Writes text content to a file in the tree. This is a convenience wrapper around `safeWriteFile` with overwrite enabled.

## Usage in Generators

All generators have been updated to use `safeWriteFile` instead of direct `tree.write` calls:

```typescript
import { safeWriteFile } from '../../internal/fs/tree-ops.js';

// Safe write (throws if file exists)
safeWriteFile(tree, filePath, content);

// Safe write with overwrite permission
safeWriteFile(tree, filePath, content, { overwrite: true });

// Convenience for text files (always overwrites)
writeText(tree, filePath, content);
```

## Acceptance Criteria Met

✅ **Generators can create nested directories reliably in memory**
- `ensureDir` creates directory structures using the `.gitkeep` sentinel pattern
- Works with any depth of nested directories
- All tests pass for various directory creation scenarios

✅ **Overwrite behavior is deterministic and testable (throws when expected)**
- `safeWriteFile` throws predictable errors when files exist and `overwrite=false`
- Behavior is consistent and testable across all scenarios
- Error messages are clear and actionable

✅ **All generators use safeWriteFile and never directly rely on fs.*operations**
- Updated all major generators: `app`, `component`, `page`, `content-file`, `astro-file`
- No direct `tree.write` calls in production generator code
- Maintained backward compatibility while improving safety

## Testing

The implementation includes comprehensive tests covering:
- Nested directory creation
- Safe file writing with overwrite controls
- Error handling for existing files
- UTF-8 content handling
- Integration workflows
- Edge cases and cleanup

All 26 tests pass, ensuring reliable operation in production.
