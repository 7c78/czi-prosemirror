'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _prosemirrorModel = require('prosemirror-model');

var _ListItemNodeSpec = require('./ListItemNodeSpec');

var _NodeNames = require('./NodeNames');

var _ParagraphNodeSpec = require('./ParagraphNodeSpec');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var babelPluginFlowReactPropTypes_proptype_NodeSpec = require('./Types').babelPluginFlowReactPropTypes_proptype_NodeSpec || require('prop-types').any;

var AUTO_LIST_STYLE_TYPES = ['decimal', 'lower-alpha', 'lower-roman'];

var OrderedListNodeSpec = {
  attrs: {
    id: { default: 1 },
    indent: { default: _ParagraphNodeSpec.MIN_INDENT_LEVEL },
    listStyleType: { default: null },
    start: { default: 1 }
  },
  group: 'block',
  content: _NodeNames.LIST_ITEM + '+',
  parseDOM: [{
    tag: 'ol',
    getAttrs: function getAttrs(dom) {
      var listStyleType = dom.getAttribute(_ListItemNodeSpec.ATTRIBUTE_LIST_STYLE_TYPE) || null;

      var start = dom.hasAttribute('start') ? parseInt(dom.getAttribute('start'), 10) : 1;

      var indent = dom.hasAttribute(_ParagraphNodeSpec.ATTRIBUTE_INDENT) ? parseInt(dom.getAttribute(_ParagraphNodeSpec.ATTRIBUTE_INDENT), 10) : _ParagraphNodeSpec.MIN_INDENT_LEVEL;

      return {
        indent: indent,
        listStyleType: listStyleType,
        start: start
      };
    }
  }],
  toDOM: function toDOM(node) {
    var _node$attrs = node.attrs,
        start = _node$attrs.start,
        indent = _node$attrs.indent,
        listStyleType = _node$attrs.listStyleType;

    var attrs = (0, _defineProperty3.default)({}, _ParagraphNodeSpec.ATTRIBUTE_INDENT, indent);

    if (listStyleType) {
      attrs[_ListItemNodeSpec.ATTRIBUTE_LIST_STYLE_TYPE] = listStyleType;
    }

    if (start !== _ParagraphNodeSpec.MIN_INDENT_LEVEL) {
      attrs.start = start;
    }

    var cssListStyleType = listStyleType;

    if (!cssListStyleType) {
      // If list style isn't explicitly specified, compute the list style type
      // based on the indent level.
      cssListStyleType = AUTO_LIST_STYLE_TYPES[indent % AUTO_LIST_STYLE_TYPES.length];
    }

    var cssCounterName = 'czi-counter-' + indent;

    attrs.style = '--czi-counter-name: ' + cssCounterName + ';' + ('--czi-counter-reset: ' + (start - 1) + ';') + ('--czi-list-style-type: ' + cssListStyleType);

    attrs.type = cssListStyleType;

    return ['ol', attrs, 0];
  }
};

exports.default = OrderedListNodeSpec;