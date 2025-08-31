# File System Operations Tests

This directory contains comprehensive tests for file system operations used by the Astro NX generators, specifically focusing on directory creation, project structure setup, and the `apps/` convention.

## Test Files

### `filesystem-operations.spec.ts`
Core tests for the `ensureTreeDirs` utility and directory creation patterns.

**Test Coverage:**
- **Apps Convention Compliance**: Ensures generators respect the `apps/` directory convention
- **Nested Directory Structure**: Tests deeply nested component and content hierarchies
- **Existing Directory Handling**: Verifies safe handling of pre-existing project structures
- **Naming Conflicts and Edge Cases**: Tests special characters, long names, and naming conflicts
- **Project Structure Validation**: Validates standard and custom Astro project layouts
- **Performance and Reliability**: Tests bulk operations and artifact cleanup

### `filesystem-integration.spec.ts`
Integration tests that verify generator functionality with real file system operations.

**Test Coverage:**
- **Generator Integration**: Tests file creation through actual generator calls
- **Directory Conflict Resolution**: Handles existing projects and file conflicts
- **Project Name Edge Cases**: Tests various project naming scenarios
- **Complex Directory Structures**: Validates nested content collections and components
- **Workspace Structure**: Ensures proper separation between apps and packages
- **Error Recovery**: Tests resilience and recovery from partial operations

## Key Features Tested

### Apps Convention
- ✅ Files created in correct `apps/{project-name}` structure
- ✅ Multiple apps coexist independently
- ✅ No interference with `packages/` directory
- ✅ Nested directory structures within apps

### Directory Creation
- ✅ Deeply nested paths (up to 10+ levels)
- ✅ Multiple components with shared parent directories
- ✅ Content collections with date-based organization
- ✅ Mixed routing structures including dynamic routes

### Edge Cases
- ✅ Special characters in project names (`-`, `_`, `.`, numbers)
- ✅ Very long project names (100+ characters)
- ✅ Directory vs. file naming conflicts
- ✅ Empty directory segments in paths
- ✅ Duplicate directory creation calls

### Performance
- ✅ Bulk operations (50+ directories)
- ✅ No `.gitkeep` artifacts left behind
- ✅ Concurrent directory creation
- ✅ File system integrity during bulk operations

### Workspace Integration
- ✅ Multiple project types (marketing, content, application, docs)
- ✅ Coexistence with non-Astro apps (React, Vue)
- ✅ Proper apps/packages separation
- ✅ Monorepo structure validation

## Usage

The tests can be run using:

```bash
# Run all tests
npx nx test astro-nx

# Run only filesystem tests
npx nx test astro-nx --testNamePattern="File System Operations"

# Run only integration tests  
npx nx test astro-nx --testNamePattern="Generator Filesystem Integration"
```

## Implementation Details

### `ensureTreeDirs` Function
The core utility that ensures directory structures exist in the Nx Tree:

- Uses the canonical `.gitkeep` create-then-delete pattern
- Handles existing directories gracefully
- Works segment-by-segment for deep nesting
- No filesystem dependencies (works entirely within Nx Tree)

### Test Patterns
- **Arrange-Act-Assert**: Each test sets up conditions, performs actions, then verifies results
- **Real Generator Integration**: Tests use actual generator functions, not mocks
- **File Content Verification**: Tests verify both file existence and content correctness
- **Isolation**: Each test uses a fresh Nx Tree workspace

## Error Handling

Tests verify proper handling of:
- Invalid directory names
- Missing required parameters  
- Partial directory creation states
- File system conflicts
- Bulk operation failures

## Future Considerations

The test suite provides a foundation for:
- Additional generator types (layouts, middleware, API routes)
- Advanced workspace configurations
- Custom directory structures
- Performance optimizations
- Cross-platform compatibility testing
