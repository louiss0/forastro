import {
  nodeDirectiveTypes,
  supportedInlineLevelTags,
  supportedBlockTableTags,
  supportedInlineTableTags,
  HTML_DIRECTIVE_MODES,
  supportedTextBasedTags,
  headings,
  supportedComponentTags,
  supportedRegionTags
} from "packages/remark-html-directives-integration/src/lib/constants";

import type { Node } from "unist-util-visit/lib";

import type { HTMLAttributes } from "astro/types"

export type {
  RemarkHTMLDirectivesConfig,
  NodeDirectiveTypes,
  supportedRegionTags,
  supportedComponentTags,
  InlineElementNames,
  NodeDirectiveObject
};

type HTMLAttributesWithoutAstroDirectives<Tag extends keyof astroHTML.JSX.DefinedIntrinsicElements> =
  Omit<HTMLAttributes<Tag>, `set:${string}` | "is:raw" | "class:list" | `on${string}`>

type NodeDirectiveTypes = typeof nodeDirectiveTypes[number];


type ComponentElementNames = typeof supportedComponentTags[number];

type RegionElementNames = typeof supportedRegionTags[number];


type Headings = typeof headings[number];

type InlineElementNames = typeof supportedInlineLevelTags[number];

type InlineTableTagNames = typeof supportedInlineTableTags[number];

type BlockTableTagNames = typeof supportedBlockTableTags[number];

type TextTags = typeof supportedTextBasedTags[number]

type ViableArticleTags = ComponentElementNames | TextTags | InlineElementNames | InlineTableTagNames | BlockTableTagNames | Headings;

type ViablePageTags = RegionElementNames | ViableArticleTags;

type RemarkHTMLDirectivesConfig = {
  mode: typeof HTML_DIRECTIVE_MODES.PAGE
  elements?: Record<string, HTMLAttributes<"div">> & { [K in ViablePageTags]?: HTMLAttributesWithoutAstroDirectives<K> }
} | {
  mode: typeof HTML_DIRECTIVE_MODES.ARTICLE
  elements?: Partial<{
    [K in ViableArticleTags]: HTMLAttributesWithoutAstroDirectives<K>
  }>
}



type RareNodeTypes = "root" | "paragraph" | "listItem" | "thematicBreak" | "text"


type NodeDirectiveObject = Node & {
  type: NodeDirectiveTypes | RareNodeTypes
  children: Array<Node>
  name: string
  attributes: Record<string, string>
}



