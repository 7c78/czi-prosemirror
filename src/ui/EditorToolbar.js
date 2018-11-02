// @flow

import Command from '../Command';
import CommandButton from './CommandButton';
import CommandMenuButton from './CommandMenuButton';
import React from 'react';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Transform} from 'prosemirror-transform';

import './czi-editor-toolbar.css';

import {
  CODE,
  EDITOR_EMPTY_STATE,
  H1,
  H2,
  H3,
  H4,
  HISTORY_REDO,
  HISTORY_UNDO,
  HR,
  LIST_INDENT_LESS,
  LIST_INDENT_MORE,
  OL,
  TABLE_ADD_COLUMN_AFTER,
  TABLE_ADD_COLUMN_BEFORE,
  TABLE_ADD_ROW_AFTER,
  TABLE_ADD_ROW_BEFORE,
  TABLE_DELETE_COLUMN,
  TABLE_DELETE_ROW,
  TABLE_DELETE_TABLE,
  TABLE_MERGE_CELLS,
  TABLE_MOVE_TO_NEXT_CELL,
  TABLE_MOVE_TO_PREV_CELL,
  TABLE_SPLIT_CELL,
  TABLE_TOGGLE_HEADER_CELL,
  TABLE_TOGGLE_HEADER_COLUMN,
  TABLE_TOGGLE_HEADER_ROW,
  UL,
} from '../configs';



const CommandGroups = [
  {
    'H1': H1,
    'H2': H2,
    'H3': H3,
    'H4': H4,
  },
  {
    'OL': OL,
    'UL': UL,
    '->||': LIST_INDENT_MORE,
    '||<-': LIST_INDENT_LESS,
  },
  {
    '<code />': CODE,
  },
  {
    'TABLE': [
      {
        'Insert column before': TABLE_ADD_COLUMN_BEFORE,
        'Insert column after': TABLE_ADD_COLUMN_AFTER,
        'Delete column': TABLE_DELETE_COLUMN,
      },
      {
        'Insert row before': TABLE_ADD_ROW_BEFORE,
        'Insert row after': TABLE_ADD_ROW_AFTER,
        'Delete row': TABLE_DELETE_ROW,
      },
      {
        'Merge cells': TABLE_MERGE_CELLS,
        'Split cell': TABLE_SPLIT_CELL,
      },
      {
        'Toggle header column': TABLE_TOGGLE_HEADER_COLUMN,
        'Toggle header row': TABLE_TOGGLE_HEADER_ROW,
        'Toggle header cells': TABLE_TOGGLE_HEADER_CELL,
      },
      {
        'Delete table': TABLE_DELETE_TABLE,
      },
    ],
  },
  {
    'HR': HR,
  },
  {
    'Undo': HISTORY_UNDO,
    'Redo': HISTORY_REDO,
  },
];

class EditorToolbar extends React.PureComponent<any, any, any> {

  props: {
    editorState: EditorState,
    editorView: ?EditorView,
    onChange?: ?(state: EditorState) => void,
    onReady?: ?(view: EditorView) => void,
  };

  render(): React.Element<any> {
    return (
      <div className="czi-editor-toolbar">
        {CommandGroups.map(this._renderButtonsGroup)}
      </div>
    );
  }

  _renderButtonsGroup = (group: Object, index: number): React.Element<any> => {
    const buttons = Object.keys(group).map(label => {
      const obj = group[label];
      if (obj instanceof Command) {
        return this._renderButton(label, obj);
      } else if (Array.isArray(obj)) {
        return this._renderMenuButton(label, obj );
      } else {
        return null;
      }
    }).filter(Boolean);
    return (
      <div key={'g' + String(index)} className="czi-editor-toolbar-buttons">
        {buttons}
      </div>
    );
  };

  _renderMenuButton = (
    label: string,
    commandGroups: Array<{[string]: Command}>,
  ): React.Element<any> => {
    const {editorState, editorView} = this.props;
    return (
      <CommandMenuButton
        commandGroups={commandGroups}
        dispatch={this._dispatchTransaction}
        editorState={editorState || EDITOR_EMPTY_STATE}
        editorView={editorView}
        key={label}
        label={label}
      />
    );
  };

  _renderButton = (label: string, command: Command): React.Element<any> => {
    const {editorState, editorView} = this.props;
    return (
      <CommandButton
        command={command}
        dispatch={this._dispatchTransaction}
        editorState={editorState || EDITOR_EMPTY_STATE}
        editorView={editorView}
        key={label}
        label={label}
      />
    );
  };

  _dispatchTransaction = (transaction: Transform): void => {
    const {onChange, editorState} = this.props;
    const nextState = (editorState || EDITOR_EMPTY_STATE).apply(transaction);
    onChange && onChange(nextState);
  };
}

export default EditorToolbar;
