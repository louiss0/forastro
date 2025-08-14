# Test Failures Baseline - Step 1

**Date:** January 12, 2025
**Command:** `npx nx run-many --target=test --all`

## Summary

**Total Failed Tests:** 27
**Projects with Failures:** 2 out of 3 projects tested
- ✖ astro-nx: 27 failed tests across 2 test files
- ✖ utilities: No test files found (exiting with code 1)
- ✖ astro-circle: No test specified, using echo command

## Project-by-Project Breakdown

### 1. astro-nx Project
**Test Files:** 2 failed | 5 passed (7 total)
**Tests:** 27 failed | 155 passed (182 total)
**Duration:** 7.10s

#### File: `src/executors/executor.smoke.spec.ts` (10 failed tests)

##### Build Executor Issues:
1. **should spawn astro build with custom outDir** - Expected `--outDir` flag in spawn args but uses env var `ASTRO_BUILD_OUTDIR`
2. **should spawn astro build with config and verbose flags** - Missing `--silent` flag in generated args
3. **should return output path information** - `result.outputPath` is undefined, expected `/workspace/apps/test-app/dist`

##### Preview Executor Issues:
4. **should spawn astro preview with custom outDir** - Expected `--outDir` and `build` flags missing

##### Check Executor Issues:
5. **should spawn astro check with watch mode** - Missing `--watch` flag
6. **should spawn astro check with TypeScript config** - Argument order differs, missing expected flags

##### Binary Resolution Issues:
7. **should handle missing project configuration gracefully** - Expected success=true, got false

##### Validation Issues:
8. **should validate file paths and fail gracefully** - Expected success=false, got true

##### Command Line Argument Construction Issues:
9. **should properly handle boolean flags** - Missing `--silent` flag in args array
10. **should properly handle string arguments with values** - Missing `--outDir` and `custom-build` args

#### File: `src/generators/generator.integration.spec.ts` (17 failed tests)

##### Component Generator Issues:
1. **should generate basic Astro component** - Generated content doesn't contain `class="my-button"`
2. **should generate component in subdirectory** - Generated content doesn't contain `class="modal"`

##### Page Generator Issues:
3. **should generate basic Astro page** - Page file doesn't exist at expected path
4. **should generate page with custom title and description** - Content is null, can't check for strings
5. **should generate page in subdirectory** - Page file doesn't exist at expected path
6. **should generate MDX page** - Page file doesn't exist at expected path
7. **should generate page with layout** - Content is null, can't check for BaseLayout

##### Content File Generator Issues:
8. **should generate basic content file** - Missing `title: First Post` in frontmatter
9. **should generate content file with custom frontmatter** - Missing `title: Getting Started` in frontmatter
10. **should generate MDX content file** - Content file doesn't exist at expected path
11. **should detect project type for content extension** - Content file doesn't exist at expected path
12. **should generate AsciiDoc content file** - Content file doesn't exist at expected path

##### Astro File Generator Issues:
13. **should generate page using astro-file generator** - Page file doesn't exist at expected path

##### Extension Decision Logic Issues:
14. **should use correct extension based on project dependencies - MDX** - MDX file not generated
15. **should use correct extension based on project dependencies - Markdoc** - Markdoc file not generated
16. **should use correct extension based on project dependencies - AsciiDoc** - AsciiDoc file not generated

##### File Path and Content Validation Issues:
17. **should generate files with correct kebab-case names** - Component name case transformation issue (`MyAwesome` → `Myawesome`)

### 2. utilities Project
**Issue:** No test files found
**Path Pattern:** `src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`
**Status:** Exits with code 1

### 3. astro-circle Project
**Issue:** No test command defined
**Command:** `echo "Error: no test specified" && exit 1`
**Status:** Missing proper test setup

## Environment Information
- **Node Version:** v20.18.0
- **Package Manager:** pnpm v10.11.0 (via JPD)
- **Test Framework:** Vitest v3.2.4
- **NX Version:** 21.2.3
- **Test Duration:** ~11s total

## Dependencies Status
✅ Dependencies installed successfully with `jpd install`
✅ Lockfile up to date
✅ Test runner (Vitest) available

## Next Steps
This baseline establishes the current state of 27 failing test specifications that need to be addressed as fixes are implemented. Each failure has been categorized by:
- Project (astro-nx, utilities, astro-circle)
- Test file
- Failure type (missing files, incorrect content, wrong arguments, etc.)
- Expected vs actual behavior

The majority of failures (27/27) are in the astro-nx project and relate to:
1. Executor argument construction and validation
2. File generation in various generators
3. Content formatting and template issues
4. Project type detection logic
