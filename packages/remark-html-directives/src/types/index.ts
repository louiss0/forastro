import { supportedBlockLevelTags, nodeDirectiveTypes, supportedInlineLevelTags, supportedTableTags, supportedTextBasedTags } from "src/utils";
import { Child, } from 'hastscript';

type NodeDirectiveTypes = typeof nodeDirectiveTypes[number];

type BlockElementNames = typeof supportedBlockLevelTags[number];

type InlineElementNames = typeof supportedInlineLevelTags[number];

type TableTagNames = typeof supportedTableTags[number];

type TextTags = typeof supportedTextBasedTags[number]

type RareNodeTypes = "root" | "paragraph" | "listItem" | "thematicBreak" | "text"

type NodeDirectiveObject = Child & {
  type: NodeDirectiveTypes | RareNodeTypes
  children: Array<Child>
  name: BlockElementNames | InlineElementNames | TableTagNames | TextTags
  attributes: Record<string, string>
}


export type { NodeDirectiveTypes, BlockElementNames, InlineElementNames, NodeDirectiveObject };

