import { NodeDirectiveObject, RemarkHTMLDirectivesConfig } from 'src/types';
import {
  headings,
  supportedComponentTags,
  supportedRegionTags,
  supportedInlineLevelTags,
  supportedBlockTableTags,
  supportedInlineTableTags,
  supportedTextBasedTags
} from 'src/constants';





const checkIfNodeTypeIsAViableContainerDirective = (node: NodeDirectiveObject) => [
  node.type === "containerDirective" && supportedComponentTags.includes(node.name as any),
  node.type === "containerDirective" && supportedRegionTags.includes(node.name as any),
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



function failFileIfANodeIsNotAViableNodeForPages(node: NodeDirectiveObject, file:{fail(message:string, node:NodeDirectiveObject):void}) {


  const directiveIsViable = [
    checkIfNodeTypeIsAViableContainerDirective(node),
    checkIfNodeTypeIsAViableLeafDirective(node),
    checkIfNodeTypeIsAViableTextDirective(node),
  ].some((value) => value)


  if (!directiveIsViable) {

    file.fail(`
    You are in Pages Mode only the Directives only below are allowed. 

    A container directive must be written using these tag names 
    ${supportedComponentTags.join(' , ')}
    ${supportedRegionTags.join(' , ')}
    ${supportedBlockTableTags.join(' , ')}. 
    Remember to use ::: a name then put ::: at the bottom for them  

    A leaf directive must use these tag names 
    ${supportedInlineLevelTags.join(',')}
    ${headings.join(",")}
    ${supportedTextBasedTags.join(' , ')}
    ${supportedInlineTableTags.join(' , ')}
    Remember to use :: for them.

    A text based directive must contain these tags
    ${supportedTextBasedTags.join(' , ')}
    Remember to use : for them 
  `, node)

  }

}


function throwIfAnyElementKeyIsOneOfTheSupportedOnes(elements: Exclude<RemarkHTMLDirectivesConfig["elements"], undefined>) {
  
  const allSupportedTags = [
    ...supportedBlockTableTags,
    ...supportedInlineLevelTags,
    ...supportedInlineTableTags,
    ...supportedComponentTags,
    ...supportedRegionTags,
    ...supportedTextBasedTags,
    ...headings
  ]
  
  const elementKeys = Object.keys(elements)
  
  if (allSupportedTags.join().includes(elementKeys.join())) {
    

    throw new Error(`Don't use one of these tags in your element keys 
      ${allSupportedTags.map((value, i) => i % 6 === 0 ? `${value}\n` : value).join(",")}
      
      These are the keys used ${elementKeys.join(" , ")}
    `)

  }

}


function failFileIfANodeIsNotAViableNodeForArticles(node: NodeDirectiveObject, file: { fail(message: string, node: NodeDirectiveObject): void }) {



  const directiveIsViable = [
    supportedComponentTags.includes(node.name as any),
    supportedBlockTableTags.includes(node.name as any),
    checkIfNodeTypeIsAViableLeafDirective(node),
    checkIfNodeTypeIsAViableTextDirective(node),
  ].some((value) => value)


  if (!directiveIsViable) {

    file.fail(`
    You are in Article Mode only the Directives only below are allowed. 

    A container tag must use these tag names.
    ${supportedComponentTags.join(",")}
    ${supportedBlockTableTags.join(",")}
    Remember to use ::: a name then put ::: at the bottom for them  

    A leaf directive must use these tag names. 
    ${supportedInlineLevelTags.join(',')} 
    ${headings.join(",")}
    ${supportedTextBasedTags.join(',')} 
    ${supportedInlineLevelTags.join(',')}
    Remember to use :: for them. 

    A text based directive must use these tags.
    ${supportedTextBasedTags.join(',')}
    Remember to use : for them. 
  `, node)


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
  failFileIfANodeIsNotAViableNodeForArticles, 
  failFileIfANodeIsNotAViableNodeForPages,
  throwIfAnyElementKeyIsOneOfTheSupportedOnes,
  overrideNodeDirectiveAttributesWithClassesAppendedToEachOtherAndTheRestOverWritten
}