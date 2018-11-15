// @flow

import {IMAGE} from './NodeNames';
import {Node} from 'prosemirror-model';

import type {NodeSpec} from 'prosemirror';

export const MIN_INDENT_LEVEL = 0;
export const MAX_INDENT_LEVEL = 7;

const ALIGN_PATTERN = /(left|right|center|justify)/;
const ATTRIBUTE_INDENT = 'data-indent';
const LINE_HEIGHT_PATTERN = /(100\%|115\%|150\%|200\%)/;

// https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
// :: NodeSpec A plain paragraph textblock. Represented in the DOM
// as a `<p>` element.
const ParagraphNodeSpec: NodeSpec = {
  attrs: {
    align: {default: null},
    id: {default: null},
    indent: {default: null},
    lineSpacing: {default: null},
  },
  content: "inline*",
  group: "block",
  parseDOM: [{tag: 'p', getParagraphNodeAttrs}],
  toDOM(node) {
    const {align, indent} = node.attrs;
    const attrs = {};

    if (align) {
      attrs.style = `text-align: ${align}`;
    }

    if (indent) {
      attrs[ATTRIBUTE_INDENT] = String(indent);
    }

    return ['p', attrs, 0];
  },
};

export function getParagraphNodeAttrs(dom: HTMLElement): Object {
  const {lineHeight, textAlign} = dom.style;
  let align = dom.getAttribute('align') || textAlign || '';
  align = ALIGN_PATTERN.test(align) ? align : null;

  const indent = dom.hasAttribute(ATTRIBUTE_INDENT) ?
    parseInt(dom.getAttribute(ATTRIBUTE_INDENT), 10) :
    MIN_INDENT_LEVEL;

  const lineSpacing = LINE_HEIGHT_PATTERN.test(lineHeight) ?
    lineHeight :
    null;

  return {align, indent, lineSpacing};
}

export default ParagraphNodeSpec;
