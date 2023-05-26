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
} from "src/constants";

import { Visitor } from "unist-util-visit";

import { HTMLAttributes } from "astro/types"

export type {
  RemarkHTMLDirectivesConfig,
  NodeDirectiveTypes,
  supportedRegionTags,
  supportedComponentTags,
  InlineElementNames,
  NodeDirectiveObject
};

type ViableArticleTags = TextTags | InlineElementNames | InlineTableTagNames | BlockTableTagNames | Headings;

type ViablePageTags = ComponentElementNames | RegionElementNames | ViableArticleTags;

type RemarkHTMLDirectivesConfig = {
  mode: typeof HTML_DIRECTIVE_MODES.PAGE
  elements?: Record<string, HTMLAttributes<"div">> & {[K in ViablePageTags]: never}
} | {
  mode: typeof HTML_DIRECTIVE_MODES.ARTICLE
  elements?: Partial<{
    [K in ViableArticleTags]:HTMLAttributes<K>
  }>
}


type NodeDirectiveTypes = typeof nodeDirectiveTypes[number];

type Node = Parameters<Visitor>[0]

type ComponentElementNames = typeof supportedComponentTags[number];

type RegionElementNames = typeof supportedRegionTags[number];


type Headings = typeof headings[number];

type InlineElementNames = typeof supportedInlineLevelTags[number];

type InlineTableTagNames = typeof supportedInlineTableTags[number];

type BlockTableTagNames = typeof supportedBlockTableTags[number];

type TextTags = typeof supportedTextBasedTags[number]

type RareNodeTypes = "root" | "paragraph" | "listItem" | "thematicBreak" | "text"

// type Optional<T extends PropertyKey, U=string> = T | Omit<U, T>  

  type NodeDirectiveObject = Node & {
  type: NodeDirectiveTypes | RareNodeTypes
  children: Array<Node>
  name: string 
  attributes: Record<string, string>
}



