import { definePreset, type Preset } from 'unocss';
import type { Theme } from 'unocss/preset-mini';
import plugin from 'tailwindcss/plugin';

const CSS_abstracts_Classes = {
  '@property --faa-prose-color-950': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#020617',
  },
  '@property --faa-prose-color-900': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#0f172a',
  },
  '@property --faa-prose-color-800': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#1e293b',
  },
  '@property --faa-prose-color-700': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#334155',
  },
  '@property --faa-prose-color-600': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#475569',
  },
  '@property --faa-prose-color-500': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#64748b',
  },
  '@property --faa-prose-color-400': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#94a3b8',
  },
  '@property --faa-prose-color-300': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#cbd5e1',
  },
  '@property --faa-prose-color-200': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#e2e8f0',
  },
  '@property --faa-prose-color-100': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#f1f5f9',
  },
  '@property --faa-prose-color-50': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#f8fafc',
  },
  '@property --faa-prose-tip-color': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#10b981',
  },
  '@property --faa-prose-warning-color': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#eab308',
  },
  '@property --faa-prose-caution-color': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#ef4444',
  },
  '@property --faa-prose-note-color': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#06b6d4',
  },
  '@property --faa-prose-important-color': {
    syntax: '<color>',
    inherits: "false",
    'initial-value': '#71717a',
  },
};

const CSS_BaseClasses = {
  a: {
    color: 'var(--faa-prose-color-500)',
    'text-decoration': 'underline',
    'line-height': 'inherit',
  },
  'a:hover, a:focus, a:active': {
    color: 'var(--faa-prose-color-600)',
    outline: '0',
  },
  h1: {
    'font-size': 'var(--faa-prose-step-5)',
  },
  h2: {
    'font-size': 'var(--faa-prose-step-4)',
  },
  h3: {
    'font-size': 'var(--faa-prose-step-3)',
  },
  h4: {
    'font-size': 'var(--faa-prose-step-2)',
  },
  h5: {
    'font-size': 'var(--faa-prose-step-1)',
  },
  abbr: {
    cursor: 'help',
    'padding-inline': 'var(--faa-prose-space-neg-1)',
    'font-size': 'var(--faa-prose-step-neg-1)',
  },
  details: {
    padding: 'var(--faa-prose-space-5) var(--faa-prose-space-6)',
    background: 'var(--faa-prose-color-100)',
  },
  ul: {
    'list-style-type': 'circle',
  },
  'ul ul': {
    'list-style-type': 'disc',
  },
  ol: {
    'list-style-type': 'decimal',
  },
  'p:has(.keyseq)': {
    display: 'flex',
    gap: 'var(--faa-prose-space-4)',
  },
  'h1 > small, h2 > small, h3 > small, h4 > small, h5 > small': {
    'font-size': '60%',
    padding: 'var(--faa-prose-space-2) var(--faa-prose-space-4)',
  },
  'code, kbd, pre, samp': {
    'font-size': 'var(--faa-prose-step-neg-1)',
  },
  pre: {
    'white-space': 'pre-wrap',
    'line-height': '1.45',
    'text-rendering': 'optimizeSpeed',
  },
  small: {
    'font-size': 'var(--faa-prose-step-neg-2)',
  },
  mark: {
    padding: 'var(--faa-prose-space-2)',
    'background-color': 'var(--faa-prose-color-200)',
  },
  'ul, ol, dl': {
    'line-height': '1.6',
    display: 'flex',
    'flex-direction': 'column',
    gap: 'var(--faa-prose-space-6)',
    'padding-inline': 'var(--faa-prose-space-3)',

  },
  'ul li ul, ul li ol, ol li ul, ol li ol': {
    'padding-inline': 'var(--faa-prose-space-9)',
    gap: 'var(--faa-prose-space-5)',
  },
};

const CSS_LayoutClasses = {
  '#content': {
    margin: 'var(--faa-prose-space-8) 0 var(--faa-prose-space-4)',
  },
  '#footer': {
    'max-width': 'none',
    padding: 'var(--faa-prose-space-8)',
  },
  '#footer-text': {
    'line-height': '1.5',
  },
  '#header, #content, #footnotes, #footer': {
    width: '100%',
    'max-width': '62.5rem',
    position: 'relative',
    padding: 'var(--faa-prose-space-2) var(--faa-prose-space-6)',
  },
  '#header::before, #content::before, #footnotes::before, #footer::before, #header::after, #content::after, #footnotes::after, #footer::after':
  {
    content: '" "',
    display: 'table',
    clear: 'both',
  },
};

const CSS_ComponentClasses = {
  'table.tableblock': {
    'font-size': 'var(--faa-prose-step-neg-1)',
    'color': "var(--faa-prose-color-500)",
    'border-bottom': "3px solid var(--faa-prose-color-600)"
  },
  '.tableblock tr:nth-child(2n)': {
    'background-color': "var(--faa-prose-color-200)",
    'color': "var(--faa-prose-color-700)",
    'border-bottom': "2px solid var(--faa-prose-color-600)"
  },
  '.tableblock th': {
    'background-color': "var(--faa-prose-color-400)",
    'color': "var(--faa-prose-color-700)",
    'border-bottom': "1px solid var(--faa-prose-color-500)"
  },
  '.qlist ol': {
    'list-style-type': 'none',
    'display': 'flex',
    'flex-direction': 'column',
    'row-gap': 'var(--faa-prose-space-2)',
  },

  '.qlist li::before': {
    content: "'\\0051'", /* Unicode for uppercase 'Q' */
    color: 'var(--faa-prose-color-400)',
    'font-size': 'var(--faa-prose-step-neg-1)',
    'padding-inline': 'var(--faa-prose-space-2)',

  },
  '.paragraph': {
    'line-height': '1.6',
    'max-width': '65ch',
    'text-rendering': 'optimizeLegibility',
  },
  '.toc': {
    display: 'flex',
    'flex-direction': 'column',
    gap: 'var(--faa-prose-space-4)',
    'padding-inline': 'var(--faa-prose-space-15)',
    'padding-block': 'var(--faa-prose-space-5)',
  },
  '.toc #toctitle': {
    'font-weight': '500',
    'padding-block': 'var(--faa-prose-space-2)',
  },
  '.toc ul': {
    'font-size': 'var(--faa-prose-step-neg-1)',
  },
  '.toc ul li:has(ul)': {
    display: 'flex',
    'flex-direction': 'column',
    'column-gap': 'var(--faa-prose-space-2)',
  },
  '.sectionbody': {
    display: 'flex',
    'flex-direction': 'column',
    'row-gap': 'var(--faa-prose-space-12)',
  },
  '.sect1': {
    display: 'flex',
    'flex-direction': 'column',
    'row-gap': 'var(--faa-prose-space-9)',
  },
  '.admonitionblock > table:not(:has(td.content .paragraph)) tr': {
    'border-inline': '1px solid currentColor',
  },
  '.admonitionblock > table:not(:has(td.content .paragraph)) td.icon': {
    'padding-inline': 'var(--faa-prose-space-3)',
  },
  '.admonitionblock > table:not(:has(td.content .paragraph)) td.content': {
    'border-left': '1px solid currentColor',
  },
  '.admonitionblock > table:has(td.content .paragraph) tr': {
    display: 'flex',
    'flex-direction': 'column',
    'border-inline': '4px solid currentColor',
    background: '#fff',
  },
  '.admonitionblock > table:has(td.content .paragraph) td': {
    'padding-inline': '1.5em',
  },
  '.admonitionblock > table:has(td.content .paragraph) td.content': {
    'padding-inline': '0.75em',
    'word-wrap': 'anywhere',
    display: 'flex',
    'flex-direction': 'column',
    gap: 'var(--faa-prose-space-3)',
  },
  '.admonitionblock > table:has(td.content .paragraph) td.content .title': {
    'font-size': '1.25rem',
  },
  '.admonitionblock > table:has(td.content .paragraph) td.content .paragraph': {
    'padding-inline': 'var(--faa-prose-space-3)',
    'font-size': 'var(--faa-prose-step-neg-1)',
  },
  '.admonitionblock.tip': {
    color: 'var(--faa-prose-tip-color)',
  },
  '.admonitionblock.note': {
    color: 'var(--faa-prose-note-color)',
  },
  '.admonitionblock.important': {
    color: 'var(--faa-prose-important-color)',
  },
  '.admonitionblock.warning': {
    color: 'var(--faa-prose-warning-color)',
  },
  '.admonitionblock.caution': {
    color: 'var(--faa-prose-caution-color)',
  },
  '.button': {
    'padding-inline': 'var(--faa-prose-space-2)',
    'padding-block': 'var(--faa-prose-space-1)',
    color: 'var(--faa-prose-color-700)',
    display: 'flex inline',
    'column-gap': 'var(--faa-prose-space-2)',
  },
  '.button::before': {
    content: "'['",
  },
  '.button::after': {
    content: "']'",
  },
  '.menuseq': {
    color: 'var(--faa-prose-color-700)',
  },
  '.menuseq .caret': {
    color: 'var(--faa-prose-color-400)',
  },
  '.menuseq .menuitem': {
    color: 'var(--faa-prose-color-500)',
  },
  '.sidebarblock': {
    border: '1px solid currentColor',
    padding: 'var(--faa-prose-space-7)',
    'border-radius': '4px',
    'background-color': 'var(--faa-prose-color-300)',
    'font-size': 'var(--faa-prose-step-neg-1)',
  },
  '.sidebarblock .content': {
    'flex-direction': 'column',
    display: 'flex',
    'row-gap': 'var(--faa-prose-space-7)',
  },
  '.sidebarblock .content > .title': {
    'font-size': 'var(--faa-prose-step-1)',
    'text-align': 'center',
    'font-weight': '700',
    color: 'var(--faa-prose-color-700)',
  },
  '.listingblock': {
    display: 'flex',
    'flex-direction': 'column',
    'row-gap': 'var(--faa-prose-space-3)',
    'background-color': 'var(--faa-prose-color-100)',
    'padding-inline': 'var(--faa-prose-space-9)',
    'padding-block': 'var(--faa-prose-space-6)',
    'border-radius': 'var(--faa-prose-space-3)',
    color: 'var(--faa-prose-color-700)',
    'font-size': 'var(--faa-prose-step-neg-1)',
  },
  '.literalblock': {
    display: 'flex',
    'flex-direction': 'column',
    'row-gap': 'var(--faa-prose-space-3)',
    'background-color': 'var(--faa-prose-color-200)',
    'padding-inline': 'var(--faa-prose-space-9)',
    'padding-block': 'var(--faa-prose-space-6)',
    'border-radius': 'var(--faa-prose-space-3)',
    color: 'var(--faa-prose-color-700)',
    'font-size': 'var(--faa-prose-step-neg-1)',
  },
  '.exampleblock': {
    display: 'flex',
    'flex-direction': 'column',
    'row-gap': 'var(--faa-prose-space-9)',
    border: '3px solid currentColor',
    'border-radius': '1rem',
    'font-size': 'var(--faa-prose-step-neg-1)',
    'padding-inline': 'var(--faa-prose-space-6)',
    'padding-block': 'var(--faa-prose-step-3)',
  },
  '.exampleblock .title': {
    'padding-inline': 'var(--faa-prose-step-1)',
    'font-size': 'var(--faa-prose-step-1)',
    'font-weight': '600',
  },
  '.quoteblock': {
    display: 'flex',
    'flex-direction': 'column',
    gap: 'var(--faa-prose-space-4)',
  },
  '.quoteblock blockquote': {
    gap: 'var(--faa-prose-space-2)',
  },
  '.quoteblock .attribution': {
    'font-size': 'var(--faa-prose-step-neg-1)',
  },
  '.dlist dl': {
    display: 'flex',
    'flex-direction': 'column',
    gap: 'var(--faa-prose-space-4)',
  },
  '.dlist dl dt': {
    'font-weight': 'bold',
  },
  '.dlist dl dd': {
    'padding-inline': 'var(--faa-prose-space-5)',
    'max-width': '50ch',
  },
  blockquote: {
    'padding-top': 'var(--faa-prose-space-4)',
    'padding-inline': 'var(--faa-prose-space-8)',
    'padding-bottom': 'var(--faa-prose-space-7)',
    'border-left': '1px solid currentColor',
  },
  'blockquote, quote p': {
    'line-height': '1.6',
  },
  table: {
    'border-collapse': 'collapse',
    'border-spacing': '0',
    'word-wrap': 'normal',
  },
  'thead th, thead td, tfoot th, tfoot td': {
    padding: 'var(--faa-prose-space-3) var(--faa-prose-space-4)',
    'font-size': 'inherit',
    'text-align': 'left',
  },
  'th, td': {
    padding: 'var(--faa-prose-space-3) var(--faa-prose-space-5)',
    'font-size': 'inherit',
  },
  kbd: {
    'padding-block': 'var(--faa-prose-space-3)',
    border: '1px solid currentColor',
    'border-radius': 'var(--faa-prose-space-3)',
    'padding-inline': 'var(--faa-prose-space-5)',
    'background-color': 'var(--faa-prose-color-200)',
  },
  '.keyseq': {
    display: 'flex',
    gap: 'var(--faa-prose-space-2)',
    'align-items': 'center',
  },
};

const CSS_UtilitiesClasses = {
  '.hide': {
    display: 'none',
  },
  '.text-left': {
    'text-align': 'left',
  },
  '.text-center': {
    'text-align': 'center',
  },
  '.text-right': {
    'text-align': 'right',
  },
  '.text-justify': {
    'text-align': 'justify',
  },
  '.underline': {
    'text-decoration': 'underline',
    'text-underline-offset': 'var(--faa-prose-space-2)',
  },
  '.line-through': {
    'text-decoration': 'line-through',
  },
  '.overline': {
    'text-decoration': 'overline',
  },
  'pre.nobreak, :not(pre).nobreak': {
    'word-wrap': 'normal',
  },
  'pre.nowrap, :not(pre).nowrap': {
    'white-space': 'nowrap',
  },
  'pre.pre-wrap, :not(pre).pre-wrap': {
    'white-space': 'pre-wrap',
  },
  'div.unbreakable': {
    'page-break-inside': 'avoid',
  },
  '.stretch': {
    width: '100%',
  },
};

const preflights = {
  ...CSS_abstracts_Classes,
  ...CSS_BaseClasses,
  ...CSS_LayoutClasses,
  ...CSS_ComponentClasses,
  ...CSS_UtilitiesClasses,
};

export const presetAdocTypograhy = definePreset(() => {
  const TYPOGRAPHY_SELECTOR_NAME = 'prose';
  const typographySelectorNameRE = new RegExp(`^${TYPOGRAPHY_SELECTOR_NAME}$`);
  const selectorColorRE = new RegExp(`^${TYPOGRAPHY_SELECTOR_NAME}-([a-z-]+)$`);

  const selectorInvertColorColorRE = new RegExp(
    `^${TYPOGRAPHY_SELECTOR_NAME}-invert-([a-z-]+)$`,
  );

  return {
    name: 'forastro/asciidoc:typography',
    enforce: 'post',
    layer: "typography",
    rules: [
      [
        typographySelectorNameRE,
        () => {
          return {
            '--faa-prose-step-neg-2':
              'clamp(0.6944rem, 0.6913rem + 0.0157vw, 0.7035rem)',
            '--faa-prose-step-neg-1':
              'clamp(0.8333rem, 0.797rem + 0.1816vw, 0.9377rem)',
            '--faa-prose-step-0': 'clamp(1rem, 0.913rem + 0.4348vw, 1.25rem)',
            '--faa-prose-step-1':
              'clamp(1.2rem, 1.0378rem + 0.8109vw, 1.6663rem)',
            '--faa-prose-step-2':
              'clamp(1.44rem, 1.1683rem + 1.3585vw, 2.2211rem)',
            '--faa-prose-step-3':
              'clamp(1.728rem, 1.2992rem + 2.1439vw, 2.9607rem)',
            '--faa-prose-step-4':
              'clamp(2.0736rem, 1.4221rem + 3.2575vw, 3.9467rem)',
            '--faa-prose-step-5':
              'clamp(2.4883rem, 1.5239rem + 4.8219vw, 5.2609rem)',
            '--faa-prose-space-1': '0.15em',
            '--faa-prose-space-2': '0.3em',
            '--faa-prose-space-3': '0.45em',
            '--faa-prose-space-4': '0.6em',
            '--faa-prose-space-5': '0.75em',
            '--faa-prose-space-6': '0.9em',
            '--faa-prose-space-7': '1.05em',
            '--faa-prose-space-8': '1.2em',
            '--faa-prose-space-9': '1.35em',
            '--faa-prose-space-10': '1.5em',
            '--faa-prose-space-11': '1.65em',
            '--faa-prose-space-12': '1.8em',
            '--faa-prose-space-13': '1.95em',
            '--faa-prose-space-14': '2.1em',
            '--faa-prose-space-15': '2.25em',
            display: 'flex',
            'flex-direction': 'column',
            'row-gap': 'var(--faa-prose-space-9)',
            padding: 'var(--faa-prose-space-7) var(--faa-prose-space-12)',
            'font-size': 'var(--faa-prose-step-0)',
            'max-width': '56rem',
            'margin-inline': 'auto',
          };
        },
        {
          layer: 'typography',
        },
      ],
      [
        selectorColorRE,
        ([, color], { theme }) => {
          if (!color) return;

          const colorObject = theme.colors?.[color];

          if (!colorObject || typeof colorObject === 'string') {
            return;
          }

          return {
            '--faa-prose-color-50': colorObject[50] as string,
            '--faa-prose-color-100': colorObject[100] as string,
            '--faa-prose-color-200': colorObject[200] as string,
            '--faa-prose-color-300': colorObject[300] as string,
            '--faa-prose-color-400': colorObject[400] as string,
            '--faa-prose-color-500': colorObject[500] as string,
            '--faa-prose-color-600': colorObject[600] as string,
            '--faa-prose-color-700': colorObject[700] as string,
            '--faa-prose-color-800': colorObject[800] as string,
            '--faa-prose-color-900': colorObject[900] as string,
          };
        },
        {
          layer: 'typography',
        },
      ],
      [
        selectorInvertColorColorRE,
        ([, color], { theme }) => {
          if (!color) return;

          const colorObject = theme.colors?.[color];

          if (!colorObject || typeof colorObject === 'string') {
            return;
          }

          return {
            '--faa-prose-color-invert-50': colorObject[900] as string,
            '--faa-prose-color-invert-100': colorObject[800] as string,
            '--faa-prose-color-invert-200': colorObject[700] as string,
            '--faa-prose-color-invert-300': colorObject[600] as string,
            '--faa-prose-color-invert-400': colorObject[500] as string,
            '--faa-prose-color-invert-500': colorObject[400] as string,
            '--faa-prose-color-invert-600': colorObject[300] as string,
            '--faa-prose-color-invert-700': colorObject[200] as string,
            '--faa-prose-color-invert-800': colorObject[100] as string,
            '--faa-prose-color-invert-900': colorObject[50] as string,
          };
        },
        {
          layer: 'typography',
        },
      ],
    ],
    preflights: [
      {
        layer: 'typography',
        getCSS: getCSSWithSelectorName(TYPOGRAPHY_SELECTOR_NAME),
      },
    ],
  } satisfies Preset<Theme>;
});

export function getCSSWithSelectorName(typographySelectorName: string) {

  const notProseSelector = `:not(:where(.not-${typographySelectorName},.not-${typographySelectorName} *))`;

  const typographySelectorClassName = `.${typographySelectorName}`


  return () => Object.entries(preflights).map(
    ([selectorName, declarationBlock]) => {

      const refinedProperties = Object.entries(declarationBlock).map(([key, value]) =>
        /^\<\w+>$/.test(value)
          ? `\t${key}:'${value}';`
          : `\t${key}:${value};`

      ).join("\n");

      const selectorBlockString = `{\n${refinedProperties}\n}\n`;


      if (selectorName.startsWith('@property')) {

        return `${selectorName} ${selectorBlockString}`
      }

      const selectorWithPseudoSelectorGroups = /^(?<targetSelector>\.?[\w\-]+(?:\s+\w+)+)(?<pseudoSelector>\:{1,2}[\w\-()]+)$/.exec(selectorName)?.groups

      if (selectorWithPseudoSelectorGroups) {

        const { targetSelector, pseudoSelector } = selectorWithPseudoSelectorGroups

        if (targetSelector && pseudoSelector) {

          return `${typographySelectorClassName} :where(${targetSelector})${pseudoSelector}${notProseSelector} ${selectorBlockString}`
        }

      }

      return `${typographySelectorClassName} :where(${selectorName})${notProseSelector} ${selectorBlockString}`;

    },
  ).join("\n");
}



// TODO: Work on this plugin
export const tailwindAsciidocProsePlugin = plugin(({ addBase, addComponents, addUtilities, }) => {


  const TYPOGRAPHY_SELECTOR_NAME = 'prose';

  const notProseSelector = `:not(:where([class~=".not-${TYPOGRAPHY_SELECTOR_NAME}"],[class~=".not-${TYPOGRAPHY_SELECTOR_NAME}"] *))`;



  const generateClassObjectWithProperProseSelectorNamesAsKeys = (
    object: Record<string, Record<string, string>>
  ) => {

    const typographySelectorClassName = `.${TYPOGRAPHY_SELECTOR_NAME}`

    const mapWithProseSelectorKeys = Object.entries(object).reduce(
      (classMap, [classSelector, classProperties]) => {

        const selectorWithPseudoSelectorGroups = /^(?<targetSelector>\.?[\w\-]+(?:\s+\w+)+)(?<pseudoSelector>\:{1,2}[\w\-()]+)$/.exec(classSelector)?.groups;

        if (selectorWithPseudoSelectorGroups) {

          const { targetSelector, pseudoSelector } = selectorWithPseudoSelectorGroups;

          if (targetSelector && pseudoSelector) {


            return classMap.set(
              `${typographySelectorClassName} :where(${targetSelector})${pseudoSelector}${notProseSelector} `,
              classProperties

            );


          }


        }

        return classMap.set(
          `${typographySelectorClassName} :where(${classSelector})${notProseSelector}`,
          classProperties
        );


      }, new Map<string, Record<string, string>>());


    return Object.fromEntries(mapWithProseSelectorKeys)

  }


  addBase([
    CSS_abstracts_Classes,
    {
      [`.${TYPOGRAPHY_SELECTOR_NAME}`]: {
        '--faa-prose-step-neg-2':
          'clamp(0.6944rem, 0.6913rem + 0.0157vw, 0.7035rem)',
        '--faa-prose-step-neg-1':
          'clamp(0.8333rem, 0.797rem + 0.1816vw, 0.9377rem)',
        '--faa-prose-step-0': 'clamp(1rem, 0.913rem + 0.4348vw, 1.25rem)',
        '--faa-prose-step-1':
          'clamp(1.2rem, 1.0378rem + 0.8109vw, 1.6663rem)',
        '--faa-prose-step-2':
          'clamp(1.44rem, 1.1683rem + 1.3585vw, 2.2211rem)',
        '--faa-prose-step-3':
          'clamp(1.728rem, 1.2992rem + 2.1439vw, 2.9607rem)',
        '--faa-prose-step-4':
          'clamp(2.0736rem, 1.4221rem + 3.2575vw, 3.9467rem)',
        '--faa-prose-step-5':
          'clamp(2.4883rem, 1.5239rem + 4.8219vw, 5.2609rem)',
        '--faa-prose-space-1': '0.15em',
        '--faa-prose-space-2': '0.3em',
        '--faa-prose-space-3': '0.45em',
        '--faa-prose-space-4': '0.6em',
        '--faa-prose-space-5': '0.75em',
        '--faa-prose-space-6': '0.9em',
        '--faa-prose-space-7': '1.05em',
        '--faa-prose-space-8': '1.2em',
        '--faa-prose-space-9': '1.35em',
        '--faa-prose-space-10': '1.5em',
        '--faa-prose-space-11': '1.65em',
        '--faa-prose-space-12': '1.8em',
        '--faa-prose-space-13': '1.95em',
        '--faa-prose-space-14': '2.1em',
        '--faa-prose-space-15': '2.25em',
        display: 'flex',
        'flex-direction': 'column',
        'row-gap': 'var(--faa-prose-space-9)',
        padding: 'var(--faa-prose-space-7) var(--faa-prose-space-12)',
        'font-size': 'var(--faa-prose-step-0)',
        'max-width': '56rem',
        'margin-inline': 'auto',
      }
    },
    generateClassObjectWithProperProseSelectorNamesAsKeys(CSS_BaseClasses),

  ])

  addComponents([
    generateClassObjectWithProperProseSelectorNamesAsKeys(CSS_LayoutClasses),
    generateClassObjectWithProperProseSelectorNamesAsKeys(CSS_ComponentClasses)
  ])

  addUtilities(generateClassObjectWithProperProseSelectorNamesAsKeys(CSS_UtilitiesClasses))

},)
