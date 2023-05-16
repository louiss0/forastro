import { supportedBlockLevelTags, nodeDirectiveTypes, supportedInlineLevelTags, supportedTableTags, supportedTextBasedTags } from "src/utils";

import {Node,} from 'unist-util-visit'

type NodeDirectiveTypes = typeof nodeDirectiveTypes[number];

type BlockElementNames = typeof supportedBlockLevelTags[number];

type InlineElementNames = typeof supportedInlineLevelTags[number];

type TableTagNames= typeof supportedTableTags[number];

type TextTags = typeof supportedTextBasedTags[number]

type RareNodeTypes =  "root" | "paragraph" | "listItem" | "thematicBreak"| "text"

interface NodeDirectiveObject extends Node {
  type: NodeDirectiveTypes | RareNodeTypes
  children: Array<Node>
  name: BlockElementNames | InlineElementNames | TableTagNames | TextTags
  attributes: Record<string, string>
}


export type { NodeDirectiveTypes, BlockElementNames, InlineElementNames, NodeDirectiveObject };

