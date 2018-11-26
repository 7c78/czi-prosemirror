'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = convertFromDOMElement;

var _EditorPlugins = require('./EditorPlugins');

var _EditorPlugins2 = _interopRequireDefault(_EditorPlugins);

var _EditorSchema = require('./EditorSchema');

var _EditorSchema2 = _interopRequireDefault(_EditorSchema);

var _prosemirrorModel = require('prosemirror-model');

var _prosemirrorState = require('prosemirror-state');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function convertFromDOMElement(el) {
  var doc = _prosemirrorModel.DOMParser.fromSchema(_EditorSchema2.default).parse(el);
  return _prosemirrorState.EditorState.create({
    doc: doc,
    plugins: _EditorPlugins2.default
  });
}