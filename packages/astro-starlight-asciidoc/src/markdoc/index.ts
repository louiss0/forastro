// Re-export schema pieces from the shared starlight-asciidoc package
// Avoid TypeScript following the workspace source by using an ambient type and runtime import only.
export { tags, nodes } from 'starlight-asciidoc';

// Provide component loaders expected by the schema and Starlight conventions
export const components = {
  Admonition: () => import('../components/Admonition.astro'),
  Tabs: () => import('../components/Tabs.astro'),
  Tab: () => import('../components/Tab.astro'),
  Details: () => import('../components/Details.astro'),
  Card: () => import('../components/Card.astro'),
  Cards: () => import('../components/Cards.astro'),
  Figure: () => import('../components/Figure.astro'),
} as const;
