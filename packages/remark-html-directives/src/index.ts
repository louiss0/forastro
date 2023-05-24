
import { Visitor, visit } from 'unist-util-visit'
import { h } from 'hastscript'
import { nodeDirectiveTypes } from 'src/constants'
import { NodeDirectiveObject, RemarkHTMLDirectivesConfig } from 'src/types'
import { throwErrorIfANodeIsNotAViableNodeForArticles, throwErrorIfANodeIsNotAViableNodeForPages } from 'src/utils'




// attributes:



export default function HTMLDirectives(config: Partial<RemarkHTMLDirectivesConfig> = { mode: "article" }) {

  return (tree: Parameters<Visitor>[0]) => {


    visit(tree, (node) => {

      const nodeDirectiveObject = node as NodeDirectiveObject

      const nodeTypeIsAnyOfTheseDirectives = nodeDirectiveTypes.includes(node.type as any)


      if (!nodeTypeIsAnyOfTheseDirectives) return "skip";



      if (config.mode === "page") {
        throwErrorIfANodeIsNotAViableNodeForPages(nodeDirectiveObject)

      }

      if (config.mode === "article") {
        throwErrorIfANodeIsNotAViableNodeForArticles(nodeDirectiveObject)

      }


      if (config?.elements && nodeDirectiveObject.name in config.elements) {

      }

      const data = nodeDirectiveObject.data || (nodeDirectiveObject.data = {})


      const hast = h(nodeDirectiveObject.name, nodeDirectiveObject.attributes)

      data.hName = hast.tagName

      data.hProperties = hast.properties

      return null






    })
  }
}