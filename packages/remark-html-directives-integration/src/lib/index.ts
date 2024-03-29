
import { visit } from 'unist-util-visit'
import { type Node } from 'unist-util-visit/lib'
import { h } from 'hastscript'
import { HTML_DIRECTIVE_MODES, nodeDirectiveTypes } from 'packages/remark-html-directives-integration/src/lib/constants'
import type { NodeDirectiveObject, RemarkHTMLDirectivesConfig } from 'packages/remark-html-directives-integration/src/lib/types'
import { overrideNodeDirectiveAttributesWithClassesAppendedToEachOtherAndTheRestOverWritten, isASupportedTag, failFileIfANodeIsNotAViableNodeForPages, failFileIfANodeIsNotAViableNodeForArticles } from 'packages/remark-html-directives-integration/src/lib/utils'





export default function HTMLDirectives(config: Partial<RemarkHTMLDirectivesConfig> = { mode: HTML_DIRECTIVE_MODES.ARTICLE, }) {


  const { mode, elements } = config

  return () => (tree: Node, file: { fail(message: string, node: Node): void }) => {



    visit(tree, (node) => {

      const nodeDirectiveObject = node as NodeDirectiveObject

      const nodeTypeIsAnyOfTheseDirectives = nodeDirectiveTypes.includes(node.type as any)



      if (!nodeTypeIsAnyOfTheseDirectives) return;



      if (mode === "page") {



        if (elements && nodeDirectiveObject.name in elements) {



          if (isASupportedTag(nodeDirectiveObject.name)) {

            overrideNodeDirectiveAttributesWithClassesAppendedToEachOtherAndTheRestOverWritten(nodeDirectiveObject, elements)


            Object.assign(
              nodeDirectiveObject.attributes,
              { dataForAstroRemarkHtmlDirective: true }
            )

          }

          if (!isASupportedTag(nodeDirectiveObject.name) && nodeDirectiveObject.type === "containerDirective") {



            overrideNodeDirectiveAttributesWithClassesAppendedToEachOtherAndTheRestOverWritten(nodeDirectiveObject, elements)


            Object.assign(
              nodeDirectiveObject.attributes,
              { dataElement: nodeDirectiveObject.name, dataForAstroRemarkHtmlDirective: true }
            )

            nodeDirectiveObject.name = "div"
          }




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


      const hast = h(nodeDirectiveObject.name, nodeDirectiveObject.attributes,)


      data["hName"] = hast.tagName

      data["hProperties"] = hast.properties

      // The changes are experimental.

      // data.hType = hast.type

      // data.hPosition = hast.position



    })
  }
}