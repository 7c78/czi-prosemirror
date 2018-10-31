// @flow

import Command from './Command';
import noop from './noop';
import setListNodeLevel from './setListNodeLevel';
import toggleList from './toggleList';
import {BULLET_LIST, ORDERED_LIST} from './NodeNames';
import {EditorState, Selection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Schema, NodeType} from 'prosemirror-model';
import {Transform} from 'prosemirror-transform';
import {findParentNodeOfType} from 'prosemirror-utils';

import type {ExecuteCall, FindNodeTypeInSelectionCall} from './Command';

class ListIndentCommand extends Command {
  _delta: number;
  _schema: Schema;
  _findBulletList: FindNodeTypeInSelectionCall;
  _findOrderedList: FindNodeTypeInSelectionCall;

  constructor(
    schema: Schema,
    delta: number,
  ) {
    super();
    
    const {nodes} = schema;
    const bullet_list = nodes[BULLET_LIST];
    const ordered_list = nodes[ORDERED_LIST];

    this._delta = delta;
    this._schema = schema;
    this._findBulletList = bullet_list ?
      findParentNodeOfType(bullet_list) :
      noop;
    this._findOrderedList = ordered_list ?
      findParentNodeOfType(ordered_list) :
      noop;
  }

  isActive = (state: EditorState): boolean => {
    const {selection} = state;
    const found =
      this._findOrderedList(selection) ||
      this._findBulletList(selection);
    const level = found ? found.node.attrs.level : 0;
    return level > 1;
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
  ): boolean => {
    let {selection, tr} = state;
    tr = tr.setSelection(selection);


    tr = setListNodeLevel(
      tr,
      this._schema,
      this._delta,
    );

    if (tr.docChanged) {
      dispatch && dispatch(tr.scrollIntoView());
      return true;
    } else {
      return false;
    }
  };
}

export default ListIndentCommand;
