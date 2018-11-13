// @flow

import LinkURLEditor from './ui/LinkURLEditor';
import UICommand from './ui/UICommand';
import applyMark from './applyMark';
import createPopUp from './ui/createPopUp';
import findNodesWithSameMark from './findNodesWithSameMark';
import nullthrows from 'nullthrows';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {MARK_LINK} from './MarkNames';
import {Schema} from 'prosemirror-model';
import {TextSelection} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {showSelectionPlaceholder, hideSelectionPlaceholder} from './SelectionPlaceholderPlugin';

import type {LinkURLEditorValue} from './ui/LinkURLEditor';

class LinkSetURLCommand extends UICommand {

  _popUp = null;

  isEnabled = (state: EditorState): boolean => {
    if (!(state.selection instanceof TextSelection)) {
      // Could be a NodeSelection or CellSelection.
      return false;
    }

    const markType = state.schema.marks[MARK_LINK];
    if (!markType) {
      return false;
    }
    const {from, to} = state.selection;
    return from < to;
  };

  waitForUserInput = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
    event: ?SyntheticEvent,
  ): Promise<any> => {
    if (this._popUp) {
      return Promise.resolve(null);
    }

    if (dispatch) {
      dispatch(showSelectionPlaceholder(state));
    }

    const {doc, schema, selection} = state;
    const markType = schema.marks[MARK_LINK];
    if (!markType) {
      return Promise.resolve(null);
    }
    const {from, to} = selection;
    const result = findNodesWithSameMark(doc, from, to, markType);
    const initialValue = result ? result.mark.attrs : null;
    console.log(initialValue);
    return new Promise(resolve => {
      this._popUp = createPopUp(LinkURLEditor, {initialValue}, {
        modal: true,
        onClose: (val) => {
          if (this._popUp) {
            this._popUp = null;
            resolve(val);
          }
        }
      });
    });
  };

  executeWithUserInput = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
    inputs: ?LinkURLEditorValue,
  ): boolean => {
    if (dispatch) {
      let {tr, selection, schema} = state;
      tr = view ? hideSelectionPlaceholder(view.state) : tr;
      tr = tr.setSelection(selection);
      if (inputs) {
        const {href} = inputs;
        const markType = schema.marks[MARK_LINK];
        const attrs = href ? {href} : null;
        tr = applyMark(
          tr.setSelection(state.selection),
          schema,
          markType,
          attrs,
        );
      }
      dispatch(tr.scrollIntoView());
    }
    view && view.focus();
    return true;
  };
}

export default LinkSetURLCommand;
