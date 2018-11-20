// @flow

import {Node} from 'prosemirror-model';
import convertToCSSPTValue from './convertToCSSPTValue';

import type {MarkSpec} from 'prosemirror';

const FontSizeMarkSpec: MarkSpec = {
  attrs: {
    pt: {default: null},
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      style: 'font-size',
      getAttrs: getAttrs,
    },
  ],
  toDOM(node: Node) {
    const {pt} = node.attrs;
    const style = pt ? `font-size: ${pt}pt` : '';
    return ['span', {style}, 0];
  },
};

function getAttrs(fontSize: string): Object {
  const attrs = {};
  if (!fontSize) {
    return attrs;
  }

  const ptValue = convertToCSSPTValue(fontSize);
  if (!ptValue) {
    return attrs;
  }
  return {
    pt: ptValue,
  };
}


export default FontSizeMarkSpec;
