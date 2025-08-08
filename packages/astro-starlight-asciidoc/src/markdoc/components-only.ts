// Test-only helper: export only the component loaders without re-exporting tags/nodes
export const components = {
  Admonition: () => import('../components/Admonition.astro'),
  Tabs: () => import('../components/Tabs.astro'),
  Details: () => import('../components/Details.astro'),
  Card: () => import('../components/Card.astro'),
  Cards: () => import('../components/Cards.astro'),
  Figure: () => import('../components/Figure.astro'),
} as const;
