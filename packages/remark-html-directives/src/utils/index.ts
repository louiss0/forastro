import { NodeDirectiveObject, RemarkHTMLDirectivesConfig } from 'src/types';
import {
  headings,
  supportedBlockLevelTags,
  supportedInlineLevelTags,
  supportedBlockTableTags,
  supportedInlineTableTags,
  supportedTextBasedTags
} from 'src/constants';





const checkIfNodeTypeIsAViableContainerDirective = (node: NodeDirectiveObject) => [
  node.type === "containerDirective" && supportedBlockLevelTags.includes(node.name as any),
  node.type === "containerDirective" && supportedBlockTableTags.includes(node.name as any),
].some((value) => value)



const checkIfNodeTypeIsAViableLeafDirective = (node: NodeDirectiveObject) => [
  node.type === "leafDirective" && supportedInlineLevelTags.includes(node.name as any),
  node.type === "leafDirective" && headings.includes(node.name as any),
  node.type === "leafDirective" && supportedTextBasedTags.includes(node.name as any),
  node.type === "leafDirective" && supportedInlineTableTags.includes(node.name as any),
].some((value) => value)




const checkIfNodeTypeIsAViableTextDirective = (node: NodeDirectiveObject) =>
  node.type === "textDirective" && supportedTextBasedTags.includes(node.name as any)



function throwErrorIfANodeIsNotAViableNodeForPages(node: NodeDirectiveObject) {


  const directiveIsViable = [
    checkIfNodeTypeIsAViableContainerDirective(node),
    checkIfNodeTypeIsAViableLeafDirective(node),
    checkIfNodeTypeIsAViableTextDirective(node),
  ].some((value) => value)


  if (!directiveIsViable) {

    throw Error(`

    A container directive must be written using these tag names 
    ${supportedBlockLevelTags.join(' , ')}${supportedBlockTableTags.join(' , ')}.
    
    Remember to use ::: a name then put ::: at the bottom for them  

    A leaf directive must use these tag names 
    ${supportedInlineLevelTags.join(',')}${headings.join(",")}
    ${supportedTextBasedTags.join(' , ')}${supportedInlineLevelTags.join(' , ')}

    Remember to use :: for them 

    A text based directive must contain these tags ${supportedTextBasedTags.join(' , ')}
    
    Remember to use : for them 

  `)

  }

}

function throwErrorIfANodeIsNotAViableNodeForArticles(node: NodeDirectiveObject) {



  const directiveIsViable = [
    supportedBlockTableTags.includes(node.name as any),
    checkIfNodeTypeIsAViableLeafDirective(node),
    checkIfNodeTypeIsAViableTextDirective(node),
  ].some((value) => value)


  if (!directiveIsViable) {

    throw Error(`

    A leaf directive must use these tag names 
    ${supportedInlineLevelTags.join(',')}${headings.join(",")}
    ${supportedTextBasedTags.join(' , ')}${supportedInlineLevelTags.join(' , ')}

    Remember to use :: for them 

    A text based directive must contain these tags ${supportedTextBasedTags.join(' , ')}
    
    Remember to use : for them 

  `)


  }

}

  function overrideNodeDirectiveAttributesWithClassesAppendedToEachOtherAndTheRestOverWritten(
        nodeDirectiveObject: NodeDirectiveObject,
        elementAttrs: Exclude<RemarkHTMLDirectivesConfig["elements"], undefined>
        ) {
          
        const nodeDirectiveObjectEntries = Object.entries(nodeDirectiveObject.attributes)
  
        const elementWithAttrs = elementAttrs[nodeDirectiveObject.name as keyof typeof elementAttrs]
        
      Object.assign(
        nodeDirectiveObject.attributes,
        nodeDirectiveObjectEntries.reduce(
          generateObjectWithAppendedClassAndOverriddenAttrs(),
          elementWithAttrs
        )
      ) 
          

      function generateObjectWithAppendedClassAndOverriddenAttrs() {
        
        return (carry: typeof elementWithAttrs, item: [string, string]) => {
    
          if (!carry)
            return {};
    
          const [key, value] = item;
    
          return key === "class" ? { [key]: `${value} ${carry[key]}` } : Object.assign(carry, { [key]: value });
    
    
    
        };
      }


  }


export {
  throwErrorIfANodeIsNotAViableNodeForArticles,
  throwErrorIfANodeIsNotAViableNodeForPages,
  overrideNodeDirectiveAttributesWithClassesAppendedToEachOtherAndTheRestOverWritten
}