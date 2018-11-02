// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid/v1';

type PopUpProps = {
  View: Function,
  onClose: Function,
  viewProps: {
    autoDismiss?: ?boolean,
    target: string,
  },
};

type PopUpHandle = {
  update: (props: Object) => void,
  dispose: Function,
};

class PopUp extends React.PureComponent {

  props: PopUpProps;

  _id = uuid();
  _rafId = NaN;
  _transform = '';

  render(): React.Element<any> {
    const {View, viewProps, onClose} = this.props;
    const {autoDismiss, target, ...restProps} = viewProps;
    return (
      <div data-pop-up-id={this._id} id={this._id}>
        <View
          {...restProps}
          onClose={onClose}
        />
      </div>
    );
  }

  componentDidMount(): void {
    this._syncPosition();
    document.addEventListener('click', this._onDucumentClick, false);
  }

  componentWillUnmount(): void {
    this._rafId && cancelAnimationFrame(this._rafId);
    document.removeEventListener('click', this._onDucumentClick, false);
  }

  _onDucumentClick = (e: Event): void => {
    const {autoDismiss, target} = this.props.viewProps;
    const {onClose} = this.props;
    if (!autoDismiss) {
      return;
    }
    const targetEl = document.getElementById(target);
    const popUpEl = document.getElementById(this._id);
    if (targetEl && popUpEl) {
      const clicked: any = e.target;
      if (
        targetEl === clicked ||
        popUpEl === clicked ||
        targetEl.contains(clicked) ||
        popUpEl.contains(clicked)
      ) {
        return;
      }
    }
    onClose();
  };

  _syncPosition = (): void => {
    this._rafId && cancelAnimationFrame(this._rafId);
    this._rafId = requestAnimationFrame(this._requestPosition);
  };

  _requestPosition = (): void => {
    this._rafId = 0;
    const {target} = this.props.viewProps;
    if (typeof target === 'string') {
      const targetEl = document.getElementById(target);
      const popUpEl = document.getElementById(this._id);
      if (targetEl && popUpEl) {
        this._moveToElement(targetEl, popUpEl);
        this._syncPosition();
        return;
      } else {
        throw new Error(`Unable to find PopUp elements`);
      }
    }
    throw new Error(`Invalid PopUp target ${String(target)}`);
  };

  _moveToElement(targetEl: HTMLElement, popUpEl: HTMLElement): void {
    const targetRect = targetEl.getBoundingClientRect();
    const x = Math.round(targetRect.left);
    const y = Math.round(targetRect.top + targetRect.height);
    const transform = `translate(${x}px, ${y}px)`;
    if (transform !== this._transform) {
      this._transform = transform;
      popUpEl.style.transform = transform;
    }
  }
}

function getRootElement(id: string, forceCreation: boolean): ?HTMLElement {
  const root: any = document.body || document.documentElement;
  let element = document.getElementById(id);
  if (!element && forceCreation) {
    element = document.createElement('div');
  }

  if (!element) {
    return null;
  }

  element.style.cssText = `position: fixed; top: 0; left: 0; z-index: 99999`;
  element.id = id;
  // Populates the default ARIA attributes here.
  // http://accessibility.athena-ict.com/aria/examples/dialog.shtml
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-modal', 'true');
  if (!element.parentElement) {
    root.appendChild(element);
  }
  return element;
}

function renderPopUp(rootId: string, popUpProps: PopUpProps): void {
  const rootNode = getRootElement(rootId, true);
  if (rootNode) {
    const component = <PopUp {...popUpProps} />;
    ReactDOM.render(component, rootNode);
  }
}

function unrenderPopUp(rootId: string): void {
  const rootNode = getRootElement(rootId, false);
  if (rootNode) {
    ReactDOM.unmountComponentAtNode(rootNode);
    rootNode.parentElement && rootNode.parentElement.removeChild(rootNode);
  }
}

export default function createPopUp(
  View: Function,
  viewProps: Object,
): PopUpHandle {
  const rootId = uuid();

  let dismissed = false;
  let onClose = viewProps.onClose;

  const dispose = () => {
    if (dismissed) {
      return;
    }
    dismissed = true;
    unrenderPopUp(rootId);
    onClose && onClose();
  };

  renderPopUp(rootId, {
    View,
    onClose: dispose,
    viewProps,
  });

  return {
    dispose: dispose,
    update: (nextViewProps) => {
      onClose = nextViewProps.onClose;
      renderPopUp(rootId, {
        View,
        onClose: dispose,
        viewProps: nextViewProps,
      });
    },
  };
}
