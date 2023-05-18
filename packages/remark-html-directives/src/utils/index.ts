import { NodeDirectiveObject } from 'src/types';


const nodeDirectiveTypes = [
  'textDirective',
  'leafDirective',
  'containerDirective',
] as const;

const supportedBlockLevelTags = [
  'address',
  'code',
  'article',
  'aside',
  'blockquote',
  "details",
  "summary",
  'div',
  'dl',
  'picture',
  'figcaption',
  'figure',
  'footer',
  'header',
  'hr',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'ul',
  'video',
  'audio',
  "hgroup",
  'table',
  'tfoot',
  'thead',
  'tbody',
] as const;

const supportedInlineLevelTags = [
  'br',
  'button',
  'i',
  'img',
  'map',
  'iframe',
  "source",
  'span',
] as const;

const supportedTableTags = [
  "tr",
  "th",
  "td",
  "col",
  "caption",
  "colgroup",
] as const

const headings = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
] as const

const supportedTextBasedTags = [
  'cite',
  'code',
  'dfn',
  'em',
  'strong',
  'sub',
  'sup',
  'time',
  'var',
  'mark',
  'q',
  'small',
  'kbd',
  'samp',
  'a',
  'abbr',
  'bdo',
  "data",
  'dd',
  'dt',
] as const;




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
  supportedInlineLevelTags,
  supportedTextBasedTags,
  supportedTableTags,
  supportedBlockLevelTags,
  nodeDirectiveTypes,
  throwErrorIfANodeIsNotAViableNode,
  checkIfNodeTypeIsAViableContainerDirective,
  checkIfNodeTypeIsAViableTextDirective,
  checkIfNodeTypeIsAViableLeafDirective,
}