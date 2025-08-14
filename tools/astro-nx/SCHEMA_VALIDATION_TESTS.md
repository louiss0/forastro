# Schema Validation Tests

## Overview

This document describes the comprehensive schema validation tests that have been implemented for the Astro-NX generator schemas. The tests ensure that all generator schemas properly validate required fields, provide appropriate defaults for optional fields, and reject invalid inputs with clear error messages.

## Test Coverage

### ✅ Implemented Tests

1. **Component Generator Schema Tests** (13 tests)
   - Required fields validation (`name`, `project`)
   - Optional fields with defaults (`ext`, `style`, `language`, `skipFormat`)
   - Invalid input rejection (patterns, enum values, additional properties)

2. **Page Generator Schema Tests** (11 tests)
   - Required fields validation (`name`, `project`)
   - Dynamic route name support
   - Complex frontmatter objects
   - Invalid input rejection (patterns, layouts, date formats)

3. **Content File Generator Schema Tests** (11 tests)
   - Required fields validation (`name`, `project`)
   - Collection vs directory requirement (oneOf validation)
   - Frontmatter with arrays support
   - Invalid input rejection (patterns, length limits)

4. **Astro File Generator Schema Tests** (2 tests)
   - Schema loading validation
   - Required fields validation

5. **Cross-Schema Consistency Tests** (6 tests)
   - Version number consistency
   - JSON Schema version consistency
   - Required fields consistency
   - Additional properties prohibition
   - SkipFormat field definition consistency
   - Name field validation pattern consistency

6. **Error Message Quality Tests** (3 tests)
   - Clear error messages for missing required fields
   - Clear error messages for pattern violations
   - Clear error messages for enum violations

## Test Results

```
✓ 44 tests passed
✓ 0 tests failed
✓ Test execution time: ~76ms
```

## Key Validation Features Tested

### Required Field Validation
- ✅ `name` field is required across all schemas
- ✅ `project` field is required across all schemas
- ✅ Content File Generator requires either `collection` OR `directory`

### Optional Field Defaults
- ✅ Component Generator: `ext: "astro"`, `style: "scoped"`, `language: "ts"`, `skipFormat: false`
- ✅ Page Generator: `ext: "astro"`, `skipFormat: false`
- ✅ Content File Generator: `ext: "md"`, `skipFormat: false`
- ✅ Astro File Generator: `ext: "astro"`, `skipFormat: false`, `bulk: false`, `minimalFrontmatter: true`

### Input Validation Patterns
- ✅ **Name patterns**: Must start with letter, no spaces/special characters
- ✅ **Directory patterns**: Letters, numbers, forward slashes, hyphens, underscores only
- ✅ **Props patterns**: Valid TypeScript interface syntax
- ✅ **Layout patterns**: Valid file path patterns
- ✅ **Collection patterns**: Must start with letter
- ✅ **Date formats**: ISO date format validation in frontmatter

### Error Handling
- ✅ Clear error messages for missing required properties
- ✅ Specific validation error paths and schema references
- ✅ Pattern mismatch error reporting
- ✅ Enum violation error reporting
- ✅ Additional property rejection

## Technical Implementation

### Dependencies
- `ajv` v8.17.1 - JSON Schema validator
- `ajv-formats` v2.1.1 - Additional format validators for dates, etc.

### Schema Files Validated
1. `src/generators/component/schema.json`
2. `src/generators/page/schema.json`
3. `src/generators/content-file/schema.json`
4. `src/generators/astro-file/schema.json`

### Test Structure
```typescript
describe('Generator Schema Validation', () => {
  // Individual generator schema tests
  describe('Component Generator Schema', () => { /* ... */ });
  describe('Page Generator Schema', () => { /* ... */ });
  describe('Content File Generator Schema', () => { /* ... */ });
  describe('Astro File Generator Schema', () => { /* ... */ });
  
  // Cross-cutting concerns
  describe('Cross-Schema Consistency', () => { /* ... */ });
  describe('Error Message Quality', () => { /* ... */ });
});
```

## Benefits

1. **Schema Integrity**: Ensures all schemas follow consistent patterns and validation rules
2. **Error Prevention**: Catches invalid configurations before they reach generator logic
3. **Developer Experience**: Validates that error messages are clear and actionable
4. **Maintenance**: Prevents schema drift and inconsistencies across generators
5. **Documentation**: Tests serve as living documentation of expected schema behavior

## Running the Tests

```bash
# Run all schema validation tests
pnpm nx test astro-nx --testNamePattern="Generator Schema Validation"

# Run just the schema validation test file
pnpm vitest run src/generators/schema-validation.spec.ts
```

## Future Enhancements

- [ ] Add performance benchmarking for schema validation
- [ ] Test schema migration scenarios
- [ ] Add integration tests with actual generator execution
- [ ] Test schema validation error recovery scenarios
- [ ] Add schema documentation generation from tests
