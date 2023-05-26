
import { visit,Node,  } from 'unist-util-visit'
import { h } from 'hastscript'
import { HTML_DIRECTIVE_MODES, nodeDirectiveTypes } from 'src/constants'
import { NodeDirectiveObject, RemarkHTMLDirectivesConfig } from 'src/types'
import {
  failFileIfANodeIsNotAViableNodeForArticles,
  failFileIfANodeIsNotAViableNodeForPages,
  overrideNodeDirectiveAttributesWithClassesAppendedToEachOtherAndTheRestOverWritten,
  throwIfAnyElementKeyIsOneOfTheSupportedOnes
} from 'src/utils'







export default function HTMLDirectives(config: Partial<RemarkHTMLDirectivesConfig>) {


  const { mode = HTML_DIRECTIVE_MODES.ARTICLE, elements} = config

  return () => (tree: Node, file: {fail(message: string, node: Node):void}) => {



    visit(tree, (node) => {

      const nodeDirectiveObject = node as NodeDirectiveObject

      const nodeTypeIsAnyOfTheseDirectives = nodeDirectiveTypes.includes(node.type as any)
    


      if (!nodeTypeIsAnyOfTheseDirectives) return null;



      if (mode === "page") {
  

        
        if (elements && nodeDirectiveObject.name in elements) {
          
          throwIfAnyElementKeyIsOneOfTheSupportedOnes(elements)
          
          
          if (nodeDirectiveObject.type !== "containerDirective") {
            

            file.fail(`
              In pages Mode The node with this ${nodeDirectiveObject.name} must be a containerDirective.
              in line ${nodeDirectiveObject.position ?? ""}   
            `, node)

          }

          overrideNodeDirectiveAttributesWithClassesAppendedToEachOtherAndTheRestOverWritten(nodeDirectiveObject, elements)
          
           
          Object.assign(
            nodeDirectiveObject.attributes,
            { dataElement: nodeDirectiveObject.name, dataForAstroRemarkHtmlDirective: true }
          )
          

          nodeDirectiveObject.name = "div"
          
        }


        failFileIfANodeIsNotAViableNodeForPages(nodeDirectiveObject, file)

      }

      
      
      if (mode === "article") {
        
        failFileIfANodeIsNotAViableNodeForArticles(nodeDirectiveObject, file)
        

        
        if (elements && nodeDirectiveObject.name in elements) {
  
          overrideNodeDirectiveAttributesWithClassesAppendedToEachOtherAndTheRestOverWritten(nodeDirectiveObject, elements)

          
          Object.assign(
            nodeDirectiveObject.attributes,
            { dataForAstroRemarkHtmlDirective: true }
          )

  
  
        }
        
      
      }




      const data = nodeDirectiveObject.data || (nodeDirectiveObject.data = {})


      const hast = h(nodeDirectiveObject.name, nodeDirectiveObject.attributes)

      
      data.hName = hast.tagName

      data.hProperties = hast.properties

      return null






    })
  }
}