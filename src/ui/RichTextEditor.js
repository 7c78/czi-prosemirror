// @flow

import cx from 'classnames';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import React from 'react';
import ReactDOM from 'react-dom';

import createEmptyEditorState from '../createEmptyEditorState';
import Editor from './Editor';
import EditorToolbar from './EditorToolbar';
import ResizeObserver from './ResizeObserver';
import uuid from './uuid';

import './czi-rte.css';
import './czi-vars.css';

import type {EditorRuntime} from '../Types';
import type {ResizeObserverEntry} from './ResizeObserver';

type Props = {
  className?: ?string,
  disabled?: ?boolean,
  editorState?: ?EditorState,
  embedded?: ?boolean,
  header?: ?React.Element<any>,
  height?: ?(string | number),
  id?: ?string,
  onBlur?: () => void,
  onChange?: (e: EditorState) => void,
  onReady?: (editorView: EditorView) => void,
  placeholder?: ?(string | React.Element<any>),
  readOnly?: ?boolean,
  runtime?: ?EditorRuntime,
  width?: ?(string | number),
};

type State = {
  contentHeight: number,
  contentOverflowHidden: boolean,
  editorView: ?EditorView,
};

const EMPTY_EDITOR_STATE = createEmptyEditorState();
const EMPTY_EDITOR_RUNTIME = {};

class RichTextEditor extends React.PureComponent<any, any, any> {

  props: Props;

  state: State;

  _id: string;
  _editor: ?Editor;

  constructor(props: any, context: any) {
    super(props, context);
    this._id = uuid();
    this.state = {
      contentHeight: NaN,
      contentOverflowHidden: false,
      editorView: null,
    };
  }

  render(): React.Element<any> {
    const {
      className,
      disabled,
      embedded,
      header,
      height,
      onChange,
      placeholder,
      readOnly,
      width,
    } = this.props;

    let {
      editorState,
      runtime,
    } = this.props;

    editorState = editorState || EMPTY_EDITOR_STATE;
    runtime = runtime || EMPTY_EDITOR_RUNTIME;

    const useFixedLayout = width !== undefined || height !== undefined;

    const mainClassName = cx(className, {
      'czi-rte': true,
      'with-fixed-layout': useFixedLayout,
      'disabled': disabled,
      'embedded': embedded,
    });

    const mainStyle = {
      width: toCSS(width === undefined && useFixedLayout ? 'auto' : width),
      height: toCSS(height === undefined && useFixedLayout ? 'auto' : height),
    };

    const {editorView} = this.state;

    const toolbar = (!!readOnly === true) ? null :
      <EditorToolbar
        disabled={disabled}
        editorState={editorState}
        editorView={editorView}
        onChange={onChange}
        readOnly={readOnly}
      />;

    return (
      <div className={mainClassName} style={mainStyle}>
        <div className="czi-rte-frameset">
          <div className="czi-rte-frame-head">
            {header}
            {toolbar}
          </div>
          <div className="czi-rte-frame-body">
            <div className="czi-rte-frame-body-scroll">
              <Editor
                disabled={disabled}
                editorState={editorState}
                embedded={embedded}
                id={this._id}
                onChange={onChange}
                onReady={this._onReady}
                placeholder={placeholder}
                readOnly={readOnly}
                ref={this._onEditorRef}
                runtime={runtime}
              />
            </div>
          </div>
          <div className="czi-rte-frame-footer" />
        </div>
      </div>
    );
  }

  _onEditorRef = (ref: any) => {
    if (ref) {
      // Mounting
      const el = ReactDOM.findDOMNode(ref);
      if (el instanceof HTMLElement) {
        ResizeObserver.observe(el, this._onContentResize);
      }
    } else {
      // Unmounting.
      const el = ReactDOM.findDOMNode(this._editor);
      if (el instanceof HTMLElement) {
        ResizeObserver.unobserve(el);
      }
    }
    this._editor = ref;
  };

  _onReady = (editorView: EditorView): void => {
    if (editorView !== this.state.editorView) {
      this.setState({editorView});
      const {onReady} = this.props;
      onReady && onReady(editorView);
    }
  };

  _onContentOverflowToggle = (contentOverflowHidden: boolean): void => {
    this.setState({
      contentOverflowHidden,
    });
  };

  _onContentResize = (info: ResizeObserverEntry): void => {
    this.setState({
      contentHeight: info.contentRect.height,
    });
  };
}

function toCSS(val: ?(number|string)): string {
  if (typeof val === 'number') {
    return val + 'px';
  }
  if (val === undefined || val === null) {
    return 'auto';
  }
  return String(val);
}

export default RichTextEditor;
