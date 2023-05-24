import {
  supportedBlockLevelTags,
  nodeDirectiveTypes,
  supportedInlineLevelTags,
  supportedTableTags,
  HTML_DIRECTIVE_MODES,
  supportedTextBasedTags

} from "src/constants";

import { Visitor } from "unist-util-visit";

import { HTMLAttributes } from "astro/types"

export type {
  RemarkHTMLDirectivesConfig,
  NodeDirectiveTypes,
  BlockElementNames,
  InlineElementNames,
  NodeDirectiveObject
};

type RemarkHTMLDirectivesConfig = {
  mode: keyof typeof HTML_DIRECTIVE_MODES
  elements: Record<string, HTMLAttributes<"div">>
}

type NodeDirectiveTypes = typeof nodeDirectiveTypes[number];

type Node = Parameters<Visitor>[0]

type BlockElementNames = typeof supportedBlockLevelTags[number];

type InlineElementNames = typeof supportedInlineLevelTags[number];

type TableTagNames = typeof supportedTableTags[number];

type TextTags = typeof supportedTextBasedTags[number]

type RareNodeTypes = "root" | "paragraph" | "listItem" | "thematicBreak" | "text"

type NodeDirectiveObject = Node & {
type NodeDirectiveObject = Node & {
  type: NodeDirectiveTypes | RareNodeTypes
  children: Array<Node>
  name: BlockElementNames | InlineElementNames | TableTagNames | TextTags
  attributes: Record<string, string>
}



