import type { AstroIntegration, AstroUserConfig } from 'astro';
import markdoc from '@astrojs/markdoc';

// Reuse the schema from the shared starlight-asciidoc package and local components
import { tags, nodes, components } from './markdoc';

export function getMarkdocConfig() {
  return {
    schema: { tags, nodes },
    components,
  } as const;
}

// Option B: Provide an Integration that injects Markdoc config during astro:config:setup
export function starlightAsciidoc(): AstroIntegration {
  return {
    name: '@forastro/starlight-asciidoc',
    hooks: {
      'astro:config:setup': async ({ updateConfig, logger }) => {
        const cfg = getMarkdocConfig();

        // Attempt to include @forastro/asciidoc if available; warn if missing.
        let asciidocIntegration: any | undefined;
        try {
          // Build the import path at runtime to avoid TypeScript following workspace sources during DTS emit
          const mod: any = await import('@forastro/' + 'asciidoc');
          // Support either default export or factory function export
          asciidocIntegration = (mod && (mod.default ?? mod.asciidoc ?? mod.integration)) || undefined;
          if (typeof asciidocIntegration === 'function') {
            asciidocIntegration = asciidocIntegration();
          }
        } catch (e) {
          logger.warn(
            '[starlight-asciidoc] @forastro/asciidoc not found. Install and add it if you want Asciidoc features.'
          );
        }

        updateConfig({
          integrations: [
            ...(asciidocIntegration ? [asciidocIntegration] : []),
            // Cast to any to avoid DTS coupling to @astrojs/markdoc types that may lag schema support
            (markdoc as any)({ schema: cfg.schema as any, components: cfg.components as any }),
          ],
        });
      },
    },
  } satisfies AstroIntegration;
}

// Option A (fallback/preferred when adding integrations from an integration is constrained):
// Merge provided config and inject markdoc + ensure @forastro/asciidoc is present if caller hasn't added it.
export function withStarlightAsciidoc(config: AstroUserConfig): AstroUserConfig {
  const cfg = getMarkdocConfig();

  const existing = config.integrations ?? [];
  const nextIntegrations: any[] = [...existing];

  // Always add our Markdoc integration to ensure required tags/nodes are available,
  // even if another Markdoc integration is present.
  nextIntegrations.push((markdoc as any)({ schema: cfg.schema as any, components: cfg.components as any }));

  return {
    ...config,
    integrations: nextIntegrations,
  };
}
