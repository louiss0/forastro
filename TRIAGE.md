# Test Failure Triage Report - Astro NX Plugin

**Total Test Results**: 38 failed | 450 passed (488 total)  
**Date**: Generated from test suite run  
**Priority**: Fix critical workflow failures first, then edge cases and utilities

## Full Workflow Integration Tests (11 failures)

### Complete Astro Project Workflow (4 failures)
1. **should generate a complete Astro project structure with all file types**
   - **Error**: `AssertionError: Expected apps/blog-app/src/components/BaseLayout.astro to exist: expected false to be true`
   - **Location**: `src/generators/full-workflow.integration.spec.ts:237:72`
   - **Issue**: Components not being created in expected directory structure

2. **should handle bulk generation across multiple projects**
   - **Error**: `AssertionError: Expected apps/blog-app/src/components/NavBar.astro to exist: expected false to be true`
   - **Location**: `src/generators/full-workflow.integration.spec.ts:304:64`
   - **Issue**: Bulk generation fails to create files across multiple projects

3. **should generate files with different extensions based on project configuration**
   - **Error**: `AssertionError: expected content to contain 'You can use JSX components'`
   - **Location**: `src/generators/full-workflow.integration.spec.ts:348:23`
   - **Issue**: Generated content doesn't match expected template for MDX files

4. **should handle complex nested directory structures**
   - **Error**: `AssertionError: expected false to be true` for nested component path
   - **Location**: `src/generators/full-workflow.integration.spec.ts:425:94`
   - **Issue**: Deep nested directory structures not being created properly

### Error Handling and Edge Cases (2 failures)
5. **should handle invalid file names gracefully**
   - **Error**: `AssertionError: promise resolved instead of rejecting`
   - **Location**: `src/generators/full-workflow.integration.spec.ts:446:60`
   - **Issue**: Validation not throwing errors for invalid file names

6. **should handle missing project gracefully**
   - **Error**: `AssertionError: promise resolved instead of rejecting`  
   - **Location**: `src/generators/full-workflow.integration.spec.ts:456:67`
   - **Issue**: Missing project validation not working

### Template Content Validation (2 failures)
7. **should generate components with correct TypeScript interfaces**
   - **Error**: `AssertionError: the given combination of arguments (null and string) is invalid`
   - **Location**: `src/generators/full-workflow.integration.spec.ts:508:23`
   - **Issue**: Component file not created, so content check fails with null

8. **should generate pages with proper frontmatter and layout imports**
   - **Error**: `AssertionError: expected content to contain import statement`
   - **Location**: `src/generators/full-workflow.integration.spec.ts:528:23`  
   - **Issue**: Page template not generating correct layout imports

### File System Integration (2 failures)
9. **should create directory structure automatically**
   - **Error**: `AssertionError: expected false to be true` for deeply nested component
   - **Location**: `src/generators/full-workflow.integration.spec.ts:574:37`
   - **Issue**: Deep directory structure creation failing

10. **should handle file overwrites correctly**
    - **Error**: `AssertionError: the given combination of arguments (null and string) is invalid`
    - **Location**: `src/generators/full-workflow.integration.spec.ts:597:30`
    - **Issue**: File not created initially, so overwrite test fails

### Cross-Generator Compatibility (1 failure)
11. **should generate files that work together in a complete workflow**
    - **Error**: `AssertionError: expected false to be true` for BlogLayout.astro
    - **Location**: `src/generators/full-workflow.integration.spec.ts:654:76`
    - **Issue**: Cross-generator file creation not working

## Edge Case Integration Tests (12 failures)

### Concurrent Operations (1 failure)
12. **should handle multiple generators running simultaneously**
    - **Error**: `AssertionError: expected false to be true` for ConcurrentComponent1.astro
    - **Location**: `src/generators/edge-cases.integration.spec.ts:171:86`
    - **Issue**: Concurrent generator execution failing

### Error Recovery and Resilience (2 failures)
13. **should handle corrupt or missing configuration files gracefully**
    - **Error**: `AssertionError: expected false to be true` for ResilientComponent.astro
    - **Location**: `src/generators/edge-cases.integration.spec.ts:206:84`
    - **Issue**: Generator not handling corrupt config gracefully

14. **should handle file permission errors gracefully**
    - **Error**: `AssertionError: expected content to contain 'ReadOnlyComponent'`
    - **Location**: `src/generators/edge-cases.integration.spec.ts:245:23`  
    - **Issue**: Read-only file handling not working correctly

### Unicode and Special Characters (1 failure)
15. **should handle Unicode characters in file names and content**
    - **Error**: `AssertionError: the given combination of arguments (null and string) is invalid`
    - **Location**: `src/generators/edge-cases.integration.spec.ts:263:23`
    - **Issue**: Unicode component file not being created

### Large Scale Operations (2 failures)
16. **should handle generation of many files without memory issues**
    - **Error**: `AssertionError: expected false to be true` for Component batch files
    - **Location**: `src/generators/edge-cases.integration.spec.ts:313:39`
    - **Issue**: Bulk file generation failing

17. **should handle deeply nested directory structures**
    - **Error**: `AssertionError: expected false to be true` for deep nested path
    - **Location**: `src/generators/edge-cases.integration.spec.ts:342:41`
    - **Issue**: Deep nesting directory creation failing

### Complex Props and TypeScript Edge Cases (2 failures)
18. **should handle extremely complex TypeScript types**
    - **Error**: `Error: Invalid prop specification: "number". Expected format: "name:type"`
    - **Location**: `src/internal/generate/props.ts:240:15`
    - **Issue**: Props parser doesn't handle complex TypeScript syntax

19. **should handle props with reserved JavaScript keywords**
    - **Error**: `AssertionError: the given combination of arguments (null and string) is invalid`
    - **Location**: `src/generators/edge-cases.integration.spec.ts:392:23`
    - **Issue**: Component with reserved keyword props not created

### File Extension Edge Cases (1 failure)
20. **should handle mixed extension environments**
    - **Error**: `AssertionError: expected content to contain 'JSX components'`
    - **Location**: `src/generators/edge-cases.integration.spec.ts:459:26`
    - **Issue**: MDX content template not generating correctly

### Workspace Configuration Edge Cases (1 failure)
21. **should handle missing workspace configuration**
    - **Error**: `AssertionError: expected false to be true` for NoWorkspaceComponent.astro
    - **Location**: `src/generators/edge-cases.integration.spec.ts:485:86`
    - **Issue**: Generator failing without workspace config

### Bulk Operations Edge Cases (1 failure)
22. **should handle bulk operations with some failing projects**
    - **Error**: `AssertionError: promise resolved instead of rejecting`
    - **Location**: `src/generators/edge-cases.integration.spec.ts:522:57`
    - **Issue**: Bulk operations not throwing expected errors

### Memory and Resource Management (1 failure)
23. **should handle large file content generation without memory leaks**
    - **Error**: `AssertionError: expected false to be true` for LargePropsComponent.astro
    - **Location**: `src/generators/edge-cases.integration.spec.ts:560:85`
    - **Issue**: Large file generation failing

## Utilities Integration Tests (14 failures)

### File System Utilities (1 failure)
24. **should create nested directory structures correctly**
    - **Error**: `AssertionError: expected false to be true` for deep nested component
    - **Location**: `src/generators/utilities.integration.spec.ts:130:62`
    - **Issue**: File system utility not creating nested structure

### Props Parsing and Generation (3 failures)
25. **should handle complex TypeScript prop interfaces**
    - **Error**: `AssertionError: the given combination of arguments (null and string) is invalid`
    - **Location**: `src/generators/utilities.integration.spec.ts:177:23`
    - **Issue**: Complex props component not being created

26. **should handle array and generic types in props**
    - **Error**: `AssertionError: the given combination of arguments (null and string) is invalid`
    - **Location**: `src/generators/utilities.integration.spec.ts:198:23`
    - **Issue**: Array props component not being created

27. **should handle optional props correctly**
    - **Error**: `AssertionError: the given combination of arguments (null and string) is invalid`
    - **Location**: `src/generators/utilities.integration.spec.ts:217:23`
    - **Issue**: Optional props component not being created

### Path Generation and Normalization (3 failures)
28. **should normalize various file name formats consistently**
    - **Error**: `AssertionError: Expected component "XMLHttpRequest" to create file "xml-http-request.astro"`
    - **Location**: `src/generators/utilities.integration.spec.ts:247:11`
    - **Issue**: File name normalization not working correctly

29. **should handle file names with nested paths in the name**
    - **Error**: `AssertionError: expected false to be true` for ui/Button.astro
    - **Location**: `src/generators/utilities.integration.spec.ts:261:75`
    - **Issue**: Nested path handling in names failing

30. **should combine directory option with nested names correctly**
    - **Error**: `AssertionError: expected false to be true` for ui/forms/InputField.astro
    - **Location**: `src/generators/utilities.integration.spec.ts:274:85`
    - **Issue**: Directory + nested name combination failing

### Project Type Detection and Extension Selection (2 failures)
31. **should detect MDX support and use appropriate extension**
    - **Error**: `AssertionError: expected content to contain 'You can use JSX components'`
    - **Location**: `src/generators/utilities.integration.spec.ts:310:23`
    - **Issue**: MDX template content not matching expected output

32. **should detect Markdoc support and use appropriate extension**
    - **Error**: `AssertionError: expected content to contain 'Markdoc tags and components'`
    - **Location**: `src/generators/utilities.integration.spec.ts:343:23`
    - **Issue**: Markdoc template content not matching expected output

### Unified Generator Delegation (1 failure)
33. **should correctly delegate to component generator**
    - **Error**: `AssertionError: expected false to be true` for DelegatedComponent.astro
    - **Location**: `src/generators/utilities.integration.spec.ts:449:84`
    - **Issue**: Astro file generator not delegating correctly to component generator

### Error Handling and Validation (2 failures)
34. **should validate required fields across all generators**
    - **Error**: `AssertionError: promise resolved instead of rejecting`
    - **Location**: `src/generators/utilities.integration.spec.ts:504:64`
    - **Issue**: Validation not throwing errors for missing required fields

35. **should validate file name patterns**
    - **Error**: `AssertionError: promise resolved instead of rejecting`
    - **Location**: `src/generators/utilities.integration.spec.ts:523:64`
    - **Issue**: File name pattern validation not working

### Performance and Scalability (2 failures)
36. **should handle bulk operations efficiently**
    - **Error**: `AssertionError: expected false to be true` for SharedComponent.astro across projects
    - **Location**: `src/generators/utilities.integration.spec.ts:564:85`
    - **Issue**: Bulk operations not creating files

37. **should handle deep directory structures without performance degradation**
    - **Error**: `AssertionError: expected false to be true` for deeply nested component
    - **Location**: `src/generators/utilities.integration.spec.ts:588:96`
    - **Issue**: Deep structure creation performance issue

## Error Handling Tests (1 failure)

### create-astro Not Installed Scenarios (1 failure)
38. **should fallback to npm when pnpm is not available**
    - **Error**: `AssertionError: expected false to be true` for success property
    - **Location**: `src/generators/error-handling.spec.ts:368:30`
    - **Issue**: Package manager fallback logic not working correctly

---

## Top Error Patterns Analysis

### 1. File Creation Failures (Most Critical - 24 occurrences)
**Pattern**: `AssertionError: expected false to be true` when checking if files exist
**Root Cause**: Core file generation mechanism is failing across multiple generators
**Impact**: High - affects basic functionality
**Stack Location**: Various generator files, file system utilities

### 2. Content Validation Failures (9 occurrences)  
**Pattern**: `AssertionError: the given combination of arguments (null and string) is invalid`
**Root Cause**: Files not being created, so content checks fail with null values  
**Impact**: High - cascading from file creation failures
**Stack Location**: Content assertions in test files

### 3. Validation Not Working (6 occurrences)
**Pattern**: `AssertionError: promise resolved instead of rejecting`  
**Root Cause**: Error handling and validation logic not throwing expected errors
**Impact**: Medium - affects error handling robustness
**Stack Location**: Validation logic in generators

### 4. Template Content Issues (4 occurrences)
**Pattern**: Expected specific content not found in generated files
**Root Cause**: Template generation logic not producing expected content
**Impact**: Medium - affects generated file quality  
**Stack Location**: Template generation utilities

### 5. Props Parsing Errors (2 occurrences)
**Pattern**: `Error: Invalid prop specification: "..." Expected format: "name:type"`
**Root Cause**: Props parser cannot handle complex TypeScript syntax
**Impact**: Medium - affects TypeScript integration
**Stack Location**: `src/internal/generate/props.ts:240:15`

## Recommended Fix Priority

### Priority 1: Critical Core Functionality
1. **File Creation Mechanism** - Fix the core file generation system
2. **Directory Structure Creation** - Ensure nested directories are created properly  
3. **Component Generator** - Fix basic component generation functionality

### Priority 2: Integration and Workflow  
4. **Bulk Operations** - Fix multi-project and bulk generation
5. **Cross-Generator Compatibility** - Ensure generators work together
6. **Template Content Generation** - Fix MDX, Markdoc templates

### Priority 3: Validation and Error Handling
7. **Input Validation** - Fix validation logic to properly reject invalid inputs  
8. **Error Recovery** - Implement proper error handling for edge cases
9. **Props Parser** - Enhance TypeScript props parsing

### Priority 4: Performance and Edge Cases
10. **Memory Management** - Fix large-scale operation issues
11. **Unicode Support** - Implement proper Unicode character handling
12. **Package Manager Fallback** - Fix package manager detection logic

**Acceptance Criteria Met**: ✅ Reproducible failing list with error messages and stack locations for all 38 failures captured and organized by test category.
