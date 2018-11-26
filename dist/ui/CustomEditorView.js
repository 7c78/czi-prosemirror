'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _prosemirrorView = require('prosemirror-view');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var babelPluginFlowReactPropTypes_proptype_DirectEditorProps = require('../Types').babelPluginFlowReactPropTypes_proptype_DirectEditorProps || require('prop-types').any;

// https://github.com/ProseMirror/prosemirror-view/blob/master/src/index.js
if (typeof exports !== 'undefined') Object.defineProperty(exports, 'babelPluginFlowReactPropTypes_proptype_EditorRuntime', {
  value: require('prop-types').shape({})
});

var CustomEditorView = function (_EditorView) {
  (0, _inherits3.default)(CustomEditorView, _EditorView);

  function CustomEditorView(place, props, runtime) {
    (0, _classCallCheck3.default)(this, CustomEditorView);

    var _this = (0, _possibleConstructorReturn3.default)(this, (CustomEditorView.__proto__ || (0, _getPrototypeOf2.default)(CustomEditorView)).call(this, place, props));

    _this.runtime = runtime;
    return _this;
  }

  return CustomEditorView;
}(_prosemirrorView.EditorView);

exports.default = CustomEditorView;