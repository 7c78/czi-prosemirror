// @flow

import CustomNodeView from './CustomNodeView';
import React from 'react';
import clamp from './clamp';
import cx from 'classnames';
import nullthrows from 'nullthrows';
import resolveImage from './resolveImage';
import uuid from 'uuid/v1';
import {EditorView} from "prosemirror-view";
import {Node} from 'prosemirror-model';

import type {NodeViewProps} from './CustomNodeView';

type Props = {
  height: number,
  onResizeEnd: (w: number, height: number) => void,
  width: number,
};

type State = {
  currentWidth: number,
  currentHeight: number,
};

import './czi-prose-mirror.css';
import './czi-image-view-resize-box.css';

export const MIN_SIZE = 50;
export const MAX_SIZE = 10000;

function setWidth(el: HTMLElement, width: number, height: number): void {
  el.style.width = width + 'px';
}

function setHeight(el: HTMLElement, width: number, height: number): void {
  el.style.height = height + 'px';
}

function setSize(el: HTMLElement, width: number, height: number): void {
  el.style.width = width + 'px';
  el.style.height = width + 'px';
}

const ResizeDirection = {
  'top': setHeight,
  'top_right': setSize,
  'right': setWidth,
  'bottom_right': setSize,
  'bottom': setHeight,
  'bottom_left': setSize,
  'left': setWidth,
  'top_left': setSize,
};

class ImageViewResizeBoxControl extends React.PureComponent<any, any, any> {
  props: {
    boxID: string,
    direction: string,
    height: number,
    onResizeEnd: (w: number, height: number) => void,
    width: number,
  };

  _active = false;
  _el = null;
  _h = '';
  _rafID = 0;
  _w = '';
  _x1 = 0;
  _x2 = 0;
  _y1 = 0;
  _y2 = 0;
  _ww = 0;
  _hh = 0;

  componentWillUnmount(): void {
    this._end();
  }

  render(): React.Element<any> {
    const {direction} = this.props;

    const className = cx({
      'czi-image-view-resize-box-control': true,
      [direction]: true,
    });

    return (
      <span className={className} onMouseDown={this._onMouseDown}>
      </span>
    );
  }

  _onMouseDown = (e: SyntheticMouseEvent): void => {
    e.preventDefault();
    this._end();
    this._start(e);
  };

  _onMouseMove = (e: MouseEvent): void => {
    e.preventDefault();
    this._x2 = e.clientX;
    this._y2 = e.clientY;
    this._rafID = requestAnimationFrame(this._syncSize);
  };

  _onMouseUp = (e: MouseEvent): void => {
    e.preventDefault();
    this._x2 = e.clientX;
    this._y2 = e.clientY;

    const {direction} = this.props;
    const el = nullthrows(this._el);
    el.classList.remove(direction);

    this._end();
    this.props.onResizeEnd(this._ww, this._hh);
  };

  _syncSize = (): void => {
    if (!this._active) {
      return;
    }
    const {direction, width, height} = this.props;

    let dx = (this._x2 - this._x1) * (/left/.test(direction) ? -1 : 1);
    let dy = (this._y2 - this._y1) * (/top/.test(direction) ? -1 : 1);

    const el = nullthrows(this._el);
    const fn = nullthrows(ResizeDirection[direction]);
    const ww = clamp(MIN_SIZE, width + dx, MAX_SIZE);
    const hh = clamp(MIN_SIZE, height + dy, MAX_SIZE);
    fn(el, ww, hh);
    this._ww = ww;
    this._hh = hh;
  };

  _start(e: SyntheticMouseEvent): void {
    if (this._active) {
      this._end();
    }

    this._active = true;

    const {boxID, direction, width, height} = this.props;
    const el = nullthrows(document.getElementById(boxID));
    el.className += ' ' + direction;

    this._el = el;
    this._x1 = e.clientX;
    this._y1 = e.clientY;
    this._x2 = this._x1;
    this._y2 = this._y1;
    this._w = this._el.style.width;
    this._h = this._el.style.height;
    this._ww = width;
    this._hh = height;

    document.addEventListener('mousemove', this._onMouseMove, true);
    document.addEventListener('mouseup', this._onMouseUp, true);
  }

  _end(): void {
    if (!this._active) {
      return;
    }

    this._active = false;
    document.removeEventListener('mousemove', this._onMouseMove, true);
    document.removeEventListener('mouseup', this._onMouseUp, true);

    const el = nullthrows(this._el);
    el.style.width = this._w;
    el.style.height = this._h;
    el.className = 'czi-image-view-resize-box';
    this._el = null;

    this._rafID && cancelAnimationFrame(this._rafID);
    this._rafID = null;
  }
}

class ImageViewResizeBox extends React.PureComponent<any, any, any> {

  props: Props;

  state: State = {
    currentWidth: this.props.width,
    currentHeight: this.props.height,
  };

  _id = uuid();

  render(): React.Element<any> {
    const {onResizeEnd} = this.props;
    const {currentWidth, currentHeight} = this.state;

    const style = {
      width: currentWidth + 'px',
      height: currentHeight + 'px',
    };

    const boxID = this._id;

    const controls = Object.keys(ResizeDirection).map(key => {
      return (
        <ImageViewResizeBoxControl
          boxID={boxID}
          config={ResizeDirection[key]}
          direction={key}
          height={currentHeight}
          key={key}
          onResizeEnd={onResizeEnd}
          width={currentWidth}
        />
      );
    });

    return (
      <span id={boxID} className="czi-image-view-resize-box" style={style}>
        {controls}
      </span>
    );
  }
}

export default ImageViewResizeBox;
