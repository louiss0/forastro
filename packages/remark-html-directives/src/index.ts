
import { Visitor, visit } from 'unist-util-visit'
import { h } from 'hastscript'
import { nodeDirectiveTypes } from 'src/constants'
import { NodeDirectiveObject } from 'src/types'
import { throwErrorIfANodeIsNotAViableNode } from 'src/utils'




// attributes: 



export default function HTMLDirectives() {

  return (tree: Parameters<Visitor>[0]) => {


    visit(tree, (node) => {

      const nodeDirectiveObject = node as NodeDirectiveObject

      const nodeTypeIsAnyOfTheseDirectives = nodeDirectiveTypes.includes(node.type as any)


      if (!nodeTypeIsAnyOfTheseDirectives) return "skip";


      throwErrorIfANodeIsNotAViableNode(nodeDirectiveObject)


      const data = nodeDirectiveObject.data || (nodeDirectiveObject.data = {})


      const hast = h(nodeDirectiveObject.name, nodeDirectiveObject.attributes)

      data.hName = hast.tagName

      data.hProperties = hast.properties

      return null






    })
  }
}