# @forastro/starlight-asciidoc

Starlight-compatible Astro components and Markdoc schema for @forastro/asciidoc output.

- Purpose: Provide Starlight-ready UI pieces along with a Markdoc schema that maps @forastro/asciidoc AST to Starlight content.
- Nx: Kept graph-driven via package.json exports/imports. No Nx generators required.

## Usage

Import from the root entry:

```ts
import { /* components, schema */ } from '@forastro/starlight-asciidoc';
```

## Development

- Build tooling will be aligned with the monorepo defaults when implementation starts.
- Entry point is src/index.ts.

