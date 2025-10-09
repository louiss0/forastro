# TODO: Future Enhancements

## Pending Tasks

### 4. Add Troubleshooting Section to README

**Priority:** Nice-to-have
**Status:** Deferred
**Date Added:** 2025-10-08

**Description:**
Add a comprehensive troubleshooting section to the README.md that covers:

- Common errors and their solutions
- Package manager detection issues
- Binary resolution problems
- Integration installation failures
- Content collection validation errors
- Cross-platform path issues (Windows vs Unix)
- Global vs local Astro installation

**Example sections to include:**
`markdown
## Troubleshooting

### Astro binary not found
**Error:** Astro is not installed locally or in the workspace`n**Solution:** Install astro as a devDependency: pnpm add -D astro`n
### Integration not detected
**Error:** Framework 'react' is not installed`n**Solution:** Add the integration first: 
x g @forastro/nx-astro-plugin:add-integration --project=my-site --names=react`n
### Collection not found
**Error:** Collection 'posts' does not exist`n**Solution:** Check available collections with the error message or create the collection first
``n
---
