// @flow

import Command from './Command';
import lift from './lift';
import nullthrows from 'nullthrows';
import toggleList from './toggleList';
import {EditorState, Selection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Schema, NodeType} from 'prosemirror-model';
import {Transform} from 'prosemirror-transform';
import {findParentNodeOfType} from 'prosemirror-utils';
import {setBlockType} from 'prosemirror-commands';

import type {ExecuteCall, FindNodeTypeInSelectionCall} from './Command';

// https://github.com/atlassian/prosemirror-utils/tree/master/src
// https://bitbucket.org/atlassian/atlaskit/src/34facee3f46197fefa8b8e22e83afd83d4d48f94/packages/editor-core/src/plugins/lists/?at=master
class ListToggleCommand extends Command {

  _findBulletList: FindNodeTypeInSelectionCall;
  _findOrderedList: FindNodeTypeInSelectionCall;
  _findParagraph: FindNodeTypeInSelectionCall;
  _ordered: boolean;
  _schema: Schema;
  _nodeType: NodeType;

  constructor(
    schema: Schema,
    ordered: boolean,
  ) {
    super();

    const bulletList = nullthrows(schema.nodes.bullet_list);
    const orderedList = nullthrows(schema.nodes.ordered_list);
    const paragraph = nullthrows(schema.nodes.paragraph);
    this._ordered = ordered;
    this._nodeType = ordered ? orderedList : bulletList;
    this._schema = schema;
    this._findBulletList = findParentNodeOfType(bulletList);
    this._findOrderedList = findParentNodeOfType(orderedList);
    this._findParagraph = findParentNodeOfType(paragraph);
  }

  isActive = (state: EditorState): boolean => {
    const {selection} = state;
    if (this._ordered) {
      return !!this._findOrderedList(selection);
    } else {
      return !!this._findBulletList(selection);
    }
  };

  // isEnabled = (state: EditorState): boolean => {
  //   const {selection} = state;
  //   return this.isActive(state) || !!this._findParagraph(selection);
  // };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
  ): boolean => {
    const {selection} = state;
    // const node = this._ordered ?
    //   this._findOrderedList(selection) :
    //   this._findBulletList(selection);
    const tr = toggleList(
      state.tr,
      this._schema,
      this._nodeType,
      selection,
    );
    if (tr.docChanged) {
      dispatch && dispatch(tr.scrollIntoView());
      return true;
    } else {
      return false;
    }
  };
}


export default ListToggleCommand;
