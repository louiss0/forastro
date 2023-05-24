
import { visit } from 'unist-util-visit'
import { h } from 'hastscript'
import {
  nodeDirectiveTypes,
  throwErrorIfANodeIsNotAViableNode,
} from './utils'
import type {
  Node,
  NodeDirectiveObject,
} from "./types"




// attributes: 



export default function HTMLDirectives() {

  return (tree: Node) => {


    visit(tree, (node) => {

      const nodeDirectiveObject = node as NodeDirectiveObject

      const nodeTypeIsAnyOfTheseDirectives = nodeDirectiveTypes.includes(node.type as any)


      if (!nodeTypeIsAnyOfTheseDirectives) return;


      throwErrorIfANodeIsNotAViableNode(nodeDirectiveObject)


      const data = nodeDirectiveObject.data || (nodeDirectiveObject.data = {})


      const hast = h(nodeDirectiveObject.name, nodeDirectiveObject.attributes)

      data.hName = hast.tagName

      data.hProperties = hast.properties







    })
  }
}