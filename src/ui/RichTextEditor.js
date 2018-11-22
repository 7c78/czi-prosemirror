// @flow

import './czi-rte.css';
import Editor from './Editor';
import EditorToolbar from './EditorToolbar';
import React from 'react';
import ReactDOM from 'react-dom';
import ResizeObserver from './ResizeObserver';
import RichTextEditorContentOverflowControl from './RichTextEditorContentOverflowControl';
import createEmptyEditorState from '../createEmptyEditorState';
import cx from 'classnames';
import noop from '../noop';
import uuid from './uuid';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';

import type {ResizeObserverEntry} from './ResizeObserver';

type EditorRuntime = any;

type ContentOverflowInfo = {
  className?: ?string,
  control?: ?React.Element<any>,
  style?: ?Object,
};

type Props = {
  className?: ?string,
  disabled?: ?boolean,
  editorState?: ?EditorState,
  header?: ?React.Element<any>,
  height?: ?(string | number),
  id?: ?string,
  maxContentHeight?: ?number,
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
      header,
      height,
      id,
      onChange,
      placeholder,
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
   });


    const mainStyle = {
      width: toCSS(width === undefined && useFixedLayout ? 'auto' : width),
      height: toCSS(height === undefined && useFixedLayout ? 'auto' : height),
    };

    const contentOverflowInfo = getContentOverflowInfo(
      this.props,
      this.state,
      this._onContentOverflowToggle,
    );

    const {editorView} = this.state;
    return (
      <div className={mainClassName} style={mainStyle}>
        <div className="czi-rte-frameset">
          <div className="czi-rte-frame-head">
            {header}
            <EditorToolbar
              editorState={editorState}
              editorView={editorView}
              onChange={onChange}
            />
          </div>
          <div className="czi-rte-frame-body">
            <div
              className={cx(
                'czi-rte-frame-body-scroll',
                contentOverflowInfo.className,
              )}
              style={contentOverflowInfo.style}>
              <Editor
                id={this._id}
                ref={this._onEditorRef}
                editorState={editorState}
                onChange={onChange}
                onReady={this._onReady}
              />
            </div>
          </div>
          <div className="czi-rte-frame-footer">
            {contentOverflowInfo.control}
          </div>
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

function getContentOverflowInfo(
  props: Props,
  state: State,
  onToggle: (v: boolean) => void,
): ContentOverflowInfo {
  const {maxContentHeight} = props;
  const {contentHeight, contentOverflowHidden} = state;
  if (
    contentHeight === null ||
    maxContentHeight === null ||
    maxContentHeight === undefined ||
    contentHeight <= maxContentHeight
  ) {
    // nothing to clamp.
    return {};
  }

  // Content could be clamped.
  const style = contentOverflowHidden ?
     {
       maxHeight: String(maxContentHeight) + 'px',
     } :
     null;

  const control =
    <RichTextEditorContentOverflowControl
      contentOverflowHidden={contentOverflowHidden}
      onToggle={onToggle}
    />;

  const className = contentOverflowHidden ?
    'czi-rte-content-overflow-clamped' :
    null;

  return {
    style,
    control,
    className,
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
