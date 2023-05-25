
import { Visitor, visit } from 'unist-util-visit'
import { h } from 'hastscript'
import { HTML_DIRECTIVE_MODES, nodeDirectiveTypes } from 'src/constants'
import { NodeDirectiveObject, RemarkHTMLDirectivesConfig } from 'src/types'
import {
  throwErrorIfANodeIsNotAViableNodeForArticles,
  throwErrorIfANodeIsNotAViableNodeForPages,
  overrideNodeDirectiveAttributesWithClassesAppendedToEachOtherAndTheRestOverWritten
} from 'src/utils'




// attributes:



export default function HTMLDirectives(config: Partial<RemarkHTMLDirectivesConfig> = { mode: HTML_DIRECTIVE_MODES.ARTICLE }) {

  return (tree: Parameters<Visitor>[0]) => {


    visit(tree, (node) => {

      const nodeDirectiveObject = node as NodeDirectiveObject

      const nodeTypeIsAnyOfTheseDirectives = nodeDirectiveTypes.includes(node.type as any)


      if (!nodeTypeIsAnyOfTheseDirectives) return "skip";



      if (config.mode === "page") {
  
        
        
        if (config?.elements && nodeDirectiveObject.name in config.elements) {
          
          if (nodeDirectiveObject.type !== "containerDirective") {
            

            throw new Error(`
              The node with this ${nodeDirectiveObject.name} must be a containerDirective.
              in line ${nodeDirectiveObject.position ?? ""}   
            `)

          }

          overrideNodeDirectiveAttributesWithClassesAppendedToEachOtherAndTheRestOverWritten(nodeDirectiveObject, config.elements)
          
           
          Object.assign(nodeDirectiveObject.attributes, { dataElement: nodeDirectiveObject.name, dataForAstroRemarkDirective:true })
          

          nodeDirectiveObject.name = "div"
          
        }


        throwErrorIfANodeIsNotAViableNodeForPages(nodeDirectiveObject)

      }

      
      if (config.mode === "article") {
     
        
        throwErrorIfANodeIsNotAViableNodeForArticles(nodeDirectiveObject)
        

        if (config?.elements && nodeDirectiveObject.name in config.elements) {
  

          overrideNodeDirectiveAttributesWithClassesAppendedToEachOtherAndTheRestOverWritten(nodeDirectiveObject, config.elements)

          
          Object.assign(nodeDirectiveObject.attributes, { dataForAstroRemarkDirective: true })

  
  
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