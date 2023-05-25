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
    
] as const;


const HTML_DIRECTIVE_MODES = Object.freeze({
    PAGE: "page",
    ARTICLE: "article"
})


const supportedBlockTableTags = [
    'table',
    'tfoot',
    'thead',
    'tbody',
] as const

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

const supportedInlineTableTags = [
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

export {
    supportedBlockLevelTags,
    supportedBlockTableTags,
    supportedInlineLevelTags,
    supportedInlineTableTags,
    headings,
    HTML_DIRECTIVE_MODES,
    nodeDirectiveTypes,
    supportedTextBasedTags
}