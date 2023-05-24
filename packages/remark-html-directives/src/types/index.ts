import { supportedBlockLevelTags, nodeDirectiveTypes, supportedInlineLevelTags, supportedTableTags, supportedTextBasedTags } from "src/utils";
import { Child, } from 'hastscript';
import { Visitor } from "unist-util-visit";

export type { Node, NodeDirectiveTypes, BlockElementNames, InlineElementNames, NodeDirectiveObject };

type NodeDirectiveTypes = typeof nodeDirectiveTypes[number];
type Node = Parameters<Visitor>[0]
type BlockElementNames = typeof supportedBlockLevelTags[number];

type InlineElementNames = typeof supportedInlineLevelTags[number];

type TableTagNames = typeof supportedTableTags[number];

type TextTags = typeof supportedTextBasedTags[number]

type RareNodeTypes = "root" | "paragraph" | "listItem" | "thematicBreak" | "text"

type NodeDirectiveObject = Node & {
  type: NodeDirectiveTypes | RareNodeTypes
  children: Array<Child>
  name: BlockElementNames | InlineElementNames | TableTagNames | TextTags
  attributes: Record<string, string>
}



