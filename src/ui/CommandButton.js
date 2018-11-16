// @flow

import CustomButton from './CustomButton';
import Icon from './Icon';
import React from 'react';
import UICommand from './UICommand';
import cx from 'classnames';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Transform} from 'prosemirror-transform';

class CommandButton extends React.PureComponent<any, any, any> {

  props: {
    className?: ?string,
    command: UICommand,
    dispatch: (tr: Transform) => void,
    editorState: EditorState,
    editorView: ?EditorView,
    label: string | React.Element<any> | null,
  };

  render(): React.Element<any> {
    const {label, className, command, editorState, editorView} = this.props;
    let disabled = true;
    try {
      disabled = !editorView || !command.isEnabled(editorState);
    } catch (ex) {
      console.error(command, ex);
    }

    return (
      <CustomButton
        active={command.isActive(editorState)}
        className={className}
        disabled={disabled}
        icon={Icon.forLabel(label)}
        label={label}
        onClick={this._onUIEnter}
        onMouseEnter={this._onUIEnter}
        value={command}
      />
    );
  }

  _onUIEnter = (command: UICommand, event: SyntheticEvent): void => {
    if (command.shouldRespondToUIEvent(event)) {
      this._execute(command, event);
    }
  };

  _execute = (value: any, event: SyntheticEvent): void => {
    const {command, editorState, dispatch, editorView} = this.props;
    command.execute(editorState, dispatch, editorView, event);
  };
}

export default CommandButton;
