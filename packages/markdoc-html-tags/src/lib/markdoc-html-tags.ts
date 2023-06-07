import { Tag, Schema, } from "@markdoc/markdoc";

export const abbrSchema = {
  render: "abbr",
  attributes: {
    primary: {
      type: String,
      render: false,
      required: true
    }
  },
  transform(node, config) {
    const attrs = node.transformAttributes(node.attributes)

    return new Tag("abbr", attrs, [attrs["primary"]])
  },
  validate(node, config) {


    return []

  },
  selfClosing: true
} satisfies Schema

export function markdocHtmlTags(): string {
  return 'markdoc-html-tags';
}
