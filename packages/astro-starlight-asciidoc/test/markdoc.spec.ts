import { describe, it, expect } from 'vitest'

// Import schema from sibling package source directly to avoid unresolved package alias in tests
import { tags, nodes } from '../../starlight-asciidoc/src/markdoc/index'
// Import components mapping from this package under test (components-only helper)
import { components } from '../src/markdoc/components-only'

describe('Markdoc schema: tags attribute definitions', () => {
  it('admonition: defines expected attributes', () => {
    const admonition = tags.admonition
    expect(admonition.attributes?.type).toEqual({
      type: String,
      matches: ['note', 'tip', 'caution', 'warning', 'important']
    })
    expect(admonition.attributes?.title).toEqual({ type: String })
  })

  it('card: defines title, href, icon attributes as strings', () => {
    const card = tags.card
    expect(card.attributes?.title).toEqual({ type: String })
    expect(card.attributes?.href).toEqual({ type: String })
    expect(card.attributes?.icon).toEqual({ type: String })
  })

  it('cards: defines columns as number', () => {
    const cards = tags.cards
    expect(cards.attributes?.columns).toEqual({ type: Number })
  })

  it('details: defines summary (string) and open (boolean)', () => {
    const details = tags.details
    expect(details.attributes?.summary).toEqual({ type: String })
    expect(details.attributes?.open).toEqual({ type: Boolean })
  })

  it('figure: defines src, alt, caption as strings', () => {
    const figure = tags.figure
    expect(figure.attributes?.src).toEqual({ type: String })
    expect(figure.attributes?.alt).toEqual({ type: String })
    expect(figure.attributes?.caption).toEqual({ type: String })
  })

  it('kbd: defines keys and class as strings', () => {
    const kbd = tags.kbd
    expect(kbd.attributes?.keys).toEqual({ type: String })
    expect(kbd.attributes?.class).toEqual({ type: String })
  })

  it('menu: defines items and class as strings', () => {
    const menu = tags.menu
    expect(menu.attributes?.items).toEqual({ type: String })
    expect(menu.attributes?.class).toEqual({ type: String })
  })

  it('tabs: defines id as string and children constraint', () => {
    const tabs = tags.tabs
    expect(tabs.attributes?.id).toEqual({ type: String })
    expect(tabs.children).toEqual(['tab'])
  })

  it('tab: defines label and id as strings', () => {
    const tab = tags.tab
    expect(tab.attributes?.label).toEqual({ type: String })
    expect(tab.attributes?.id).toEqual({ type: String })
  })
})

describe('Markdoc schema: node attribute contracts', () => {
  it('heading node exposes expected attributes', () => {
    const heading = nodes.heading
    expect(heading).toBeDefined()
    expect(heading.attributes).toMatchObject({
      level: expect.any(Object),
      id: expect.any(Object),
    })
  })
})

describe('Component interop: mapping consistency with tag render targets', () => {
  it('components contains loaders for all component-rendering tags', () => {
    // Collect tag render names that look like components (PascalCase)
    const componentTagRenderNames = Object.values(tags)
      .map((t: any) => t.render)
      .filter((name): name is string => typeof name === 'string')
      .filter((name) => /^[A-Z]/.test(name))

    // Some Markdoc tags render to sub-components managed by a parent component
    // that is exported (e.g., Tab is rendered as a child of Tabs).
    const handledInternally = new Set(['Tab', 'AttrList'])

    // Ensure each render target has a component loader unless handled internally
    for (const compName of componentTagRenderNames) {
      if (handledInternally.has(compName)) continue;
      expect(components, `Missing component loader for ${compName}`).toHaveProperty(compName)
      const loader = (components as any)[compName]
      expect(typeof loader).toBe('function')
    }
  })

  it('snapshot: list of component keys', () => {
    expect(Object.keys(components).sort()).toMatchInlineSnapshot(
      `
      [
        "Admonition",
        "Card",
        "Cards",
        "Details",
        "Figure",
        "Tabs",
      ]
      `,
    )
  })
})

