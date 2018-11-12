// @flow

import './czi-table-grid-size-editor.css';
import CustomButton from './CustomButton';
import React from 'react';
import clamp from './clamp';
import cx from 'classnames';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {TABLE_INSERT_TABLE} from '../EditorCommand';
import {Transform} from 'prosemirror-transform';
import {fromHTMlElement} from './rects';

export type TableGridSizeEditorValue = {
  cols: number,
  rows: number,
};

const GUTTER_SIZE = 5;
const CELL_SIZE = 16;
const MAX_SIZE = 20;


class GridCell extends React.PureComponent<any, any, any> {
  render(): React.Element<any> {
    const {x, y, selected} = this.props;
    const style = {
      left: x + 'px',
      top: y + 'px',
      width: CELL_SIZE + 'px',
      height: CELL_SIZE + 'px',
    };
    const className = cx('czi-table-grid-size-editor-cell', {
      selected,
    });
    return (
      <div
        className={className}
        style={style}
      />
    );
  }
}

class TableGridSizeEditor extends React.PureComponent<any, any, any> {
  _ex = 0;
  _ey = 0;
  _mx = 0;
  _my = 0;
  _rafID = 0;

  props: {
    close: (val: TableGridSizeEditorValue) => void,
  };

  state: TableGridSizeEditorValue = {
    rows: 1,
    cols: 1,
  };

  componentWillUnmount(): void {
    this._rafID && cancelAnimationFrame(this._rafID);
  }

  render(): React.Element<any> {
    const {rows, cols} = this.state;
    let rr = Math.max(5, rows);
    let cc = Math.max(5, cols);
    if (rr === rows) {
      rr = Math.min(MAX_SIZE, rr + 1);
    }
    if (cc === cols) {
      cc = Math.min(MAX_SIZE, cc + 1);
    }
    const cells = [];
    let ii = 0;
    let y = 0;
    let w = 0;
    let h = 0;
    while (ii < rr) {
      y += GUTTER_SIZE;
      let jj = 0;
      let x = 0;
      while (jj < cc) {
        x += GUTTER_SIZE;
        const selected = ii < rows && jj < cols;
        cells.push(
          <GridCell
            key={`${String(ii)}-${String(jj)}`}
            selected={selected}
            x={x}
            y={y}
          />
        );
        x += CELL_SIZE;
        w = x + GUTTER_SIZE;
        jj++;
      }
      y += CELL_SIZE;
      h = y + GUTTER_SIZE;
      ii++;
    }
    const bodyStyle = {width: w + 'px', height: h + 'px'};

    return (
      <div className="czi-table-grid-size-editor">
        <div
          onMouseEnter={this._onMouseEnter}
          onMouseMove={this._onMouseMove}
          onMouseDown={this._onMouseDown}
          className="czi-table-grid-size-editor-body" style={bodyStyle}>
          {cells}
        </div>
        <div className="czi-table-grid-size-editor-footer">
          {rows} X {cols}
        </div>
      </div>
    );
  }

  _onMouseEnter = (e: MouseEvent): void => {
    const node = e.currentTarget;
    if (node instanceof HTMLElement) {
      const rect = fromHTMlElement(node);
      const mx = Math.round(e.clientX);
      const my = Math.round(e.clientY);
      this._ex = rect.x;
      this._ey = rect.y;
      this._mx = mx;
      this._my = my;
    }
  };

  _onMouseMove = (e: MouseEvent): void => {
    const mx = Math.round(e.clientX);
    const my = Math.round(e.clientY);
    if (mx !== this._mx || my !== this._my) {
      this._mx = mx;
      this._my = my;
      this._rafID && cancelAnimationFrame(this._rafID);
      this._rafID = requestAnimationFrame(this._updateGridSize);
    }
  };

  _updateGridSize = (): void => {
    this._rafID = 0;
    const mx = this._mx;
    const my = this._my;
    const x = mx - this._ex;
    const y = my - this._ey;
    const rr = clamp(1, Math.ceil(y / (CELL_SIZE + GUTTER_SIZE)), MAX_SIZE);
    const cc = clamp(1, Math.ceil(x / (CELL_SIZE + GUTTER_SIZE)), MAX_SIZE);
    const {rows, cols} = this.state;
    if (rows !== rr || cols !== cc) {
      this.setState({rows: rr, cols: cc});
    }
  };

  _onMouseDown = (e: SyntheticEvent): void => {
    e.preventDefault();
    this.props.close(this.state);
  };
}

export default TableGridSizeEditor;
