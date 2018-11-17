// @flow

import toHexColor from './ui/toHexColor';
import {Node} from 'prosemirror-model';

import type {MarkSpec} from 'prosemirror';

const TextColorMarkSpec: MarkSpec = {
  attrs: {
    color: '',
  },
  inline: true,
  group: 'inline',
  parseDOM: [
    {
      style: 'color',
      getAttrs: (color) => {
        return {
          color: toHexColor(color),
        };
      },
    },
  ],
  toDOM(node: Node) {
    const {color} = node.attrs;
    let style = '';
    if (color) {
      style += `color: ${color};`;
    }
    return [
      'span',
      {style},
      0,
    ];
  },
};

export default TextColorMarkSpec;
