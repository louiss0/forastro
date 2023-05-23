import { NodeDirectiveObject } from 'src/types';
import {
  headings,
  supportedBlockLevelTags,
  supportedInlineLevelTags,
  supportedTableTags,
  supportedTextBasedTags
} from 'src/constants';





function checkIfNodeTypeIsAViableContainerDirective(node: NodeDirectiveObject) {


  return [
    node.type === "containerDirective" && supportedBlockLevelTags.includes(node.name as any),
    node.type === "containerDirective" && supportedTableTags.includes(node.name as any),
  ].some((value) => value)

}

function checkIfNodeTypeIsAViableLeafDirective(node: NodeDirectiveObject) {

  return [
    node.type === "leafDirective" && supportedInlineLevelTags.includes(node.name as any),
    node.type === "leafDirective" && headings.includes(node.name as any),
    node.type === "leafDirective" && supportedTextBasedTags.includes(node.name as any),
    node.type === "leafDirective" && supportedTableTags.includes(node.name as any),
  ].some((value) => value)


}

function checkIfNodeTypeIsAViableTextDirective(node: NodeDirectiveObject) {

  return node.type === "textDirective" && supportedTextBasedTags.includes(node.name as any)
}


function throwErrorIfANodeIsNotAViableNode(node: NodeDirectiveObject) {


  const directiveIsViable = [
    checkIfNodeTypeIsAViableContainerDirective(node),
    checkIfNodeTypeIsAViableLeafDirective(node),
    checkIfNodeTypeIsAViableTextDirective(node),
  ].some((value) => value)


  if (!directiveIsViable) {

    throw Error(`

    A container directive must be written using these tag names 
    ${supportedBlockLevelTags.join(' , ')}${supportedTableTags.join(' , ')}.
    
    Remember to use ::: a name then put ::: at the bottom for them  

    A leaf directive must use these tag names 
    ${supportedInlineLevelTags.join(',')}${headings.join(",")}
    ${supportedTextBasedTags.join(' , ')}${supportedTableTags.join(' , ')}

    Remember to use :: for them 

    A text based directive must contain these tags ${supportedTextBasedTags.join(' , ')}
    
    Remember to use : for them 

  `)

  }

}

export {
  throwErrorIfANodeIsNotAViableNode,
  checkIfNodeTypeIsAViableContainerDirective,
  checkIfNodeTypeIsAViableTextDirective,
  checkIfNodeTypeIsAViableLeafDirective,
}