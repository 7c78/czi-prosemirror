// @flow
// https://bitbucket.org/atlassian/atlaskit/src/98fad88c63576f0464984d21057ac146d4ca131a/packages/editor-core/src/plugins/lists/index.ts?at=ED-870-list-plugin&fileviewer=file-view-default
// https://bitbucket.org/atlassian/atlaskit/src/98fad88c63576f0464984d21057ac146d4ca131a/packages/editor-core/src/commands/index.ts?at=ED-870-list-plugin&fileviewer=file-view-default

import isListNode from './isListNode';
import isTableNode from './isTableNode';
import joinListNode from './joinListNode';
import nullthrows from 'nullthrows';
import {Fragment, Schema, Node, NodeType, ResolvedPos} from 'prosemirror-model';
import {PARAGRAPH, HEADING, LIST_ITEM, ORDERED_LIST, BULLET_LIST} from './NodeNames';
import {Selection} from 'prosemirror-state';
import {TextSelection} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {setBlockType} from 'prosemirror-commands';

export default function toggleList(
  tr: Transform,
  schema: Schema,
  listNodeType: NodeType,
): Transform {

  if (!tr.selection || !tr.doc) {
    return tr;
  }

  const {nodes} = schema;
  const bulletList = nodes[BULLET_LIST];
  const heading = nodes[HEADING];
  const listItem= nodes[LIST_ITEM];
  const orderedList = nodes[ORDERED_LIST];
  const paragraph = nodes[PARAGRAPH];
  if (
    !bulletList ||
    !orderedList ||
    !listItem ||
    !paragraph
  ) {
    // If any of these core nodes needed are not available, we'd do nothing.
    return tr;
  }

  // Find out all the selected blocks that could be formated as lists.
  const blocksBetween = [];
  tr.doc.nodesBetween(tr.selection.from, tr.selection.to, (
    node,
    pos,
    parentNode,
    index,
  ) => {
    if (isTableNode(node)) {
      // This is a table node, we should continue to look inside until
      // a non-table block node is found.
      return true;
    }
    blocksBetween.push({
      node,
      pos,
      parentNode,
      index,
    });
    return false;
  });

  if (!blocksBetween.length) {
    return tr;
  }

  // These are the node types that could be selected and formatted as lists.
  // If an unsupported block type is selected, we'd abandon the action.
  const validNodeTypes = new Set([
    bulletList,
    heading,
    orderedList,
    paragraph,
  ].filter(Boolean));

  const hasInvalidNode = blocksBetween.some(m => {
    return !m.node || !validNodeTypes.has(m.node.type);
  });

  if (hasInvalidNode) {
    return tr;
  }

  let offset = 0;
  blocksBetween.forEach((memo, ii) => {
    const {node, pos} = memo;
    if (ii === 0 && isListNode(node) && node.type === listNodeType) {
      // If the very first node has the same type as the desired node type,
      // assume this is a toggle-off action.
      listNodeType = null;
    }

    const fromBefore = tr.selection.from;
    const sizeBefore = tr.doc.nodeSize;
    // After each iteration, the recorded `pos` could have been moved.
    // We need to keep track of the changes of the `pos`.
    const pp = pos + offset;
    tr = setBlockListNodeType(
      tr,
      schema,
      listNodeType,
      pp,
    );
    const fromAfter = tr.selection.from;
    const sizeAfter = tr.doc.nodeSize;
    offset += (fromAfter - fromBefore);
    offset += (sizeAfter - sizeBefore);
  });

  return tr;
}

export function unwrapNodesFromList(
  tr: Transform,
  schema: Schema,
  listNodePos: number,
  unwrapParagraphNode?: ?(Node) => Node,
): Transform {
  if (!tr.doc || !tr.selection) {
    return tr;
  }

  const {nodes} = schema;
  const paragraph = nodes[PARAGRAPH];
  const listItem= nodes[LIST_ITEM];

  if (!listItem|| !paragraph) {
    return tr;
  }

  const listNode = tr.doc.nodeAt(listNodePos);
  if (!isListNode(listNode)) {
    return tr;
  }
  
  const initialSelection = tr.selection;
  const contentBlocksBefore = [];
  const contentBlocksSelected = [];
  const contentBlocksAfter = [];
  const {from, to} = tr.selection;
  tr.doc.nodesBetween(listNodePos, listNodePos + listNode.nodeSize, (
    node,
    pos,
    parentNode,
    index,
  ) => {
    if (node.type !== paragraph) {
      return true;
    }
    const block = {
      node,
      pos,
      parentNode,
      index,
    };

    if ((pos + node.nodeSize) <= from) {
      contentBlocksBefore.push(block);
    } else if (pos > to) {
      contentBlocksAfter.push(block);
    } else {
      contentBlocksSelected.push(block);
    }
    return false;
  });

  if (!contentBlocksSelected.length) {
    return tr;
  }

  tr = tr.delete(listNodePos, listNodePos + listNode.nodeSize);

  const listNodeType = listNode.type;
  const attrs = {level: listNode.attrs.level, start: 1};

  if (contentBlocksAfter.length) {
    const nodes = contentBlocksAfter.map(block => {
      return listItem.create({}, Fragment.from(block.node));
    });
    const frag = Fragment.from(listNodeType.create(
      attrs,
      Fragment.from(nodes),
    ));
    tr = tr.insert(listNodePos, frag);
  }

  if (contentBlocksSelected.length) {
    const nodes = contentBlocksSelected.map(block => {
      if (unwrapParagraphNode) {
        return unwrapParagraphNode(block.node);
      } else {
        return block.node;
      }
    });
    const frag = Fragment.from(nodes);
    tr = tr.insert(listNodePos, frag);
  }

  if (contentBlocksBefore.length) {
    const nodes = contentBlocksBefore.map(block => {
      return listItem.create({}, Fragment.from(block.node));
    });
    const frag = Fragment.from(listNodeType.create(
      attrs,
      Fragment.from(nodes),
    ));
    tr = tr.insert(listNodePos, frag);
  }

  let selFrom = initialSelection.from;
  let selTo = initialSelection.to;

  const bb = !!contentBlocksBefore.length;
  const aa = !!contentBlocksAfter.length;
  if (!aa && !bb) {
    selFrom -= 2;
    selTo -= listNode.childCount + 2;
  } else if (aa && !bb) {
    selFrom -= 2;
  } else if (!aa && bb) {
    selTo -= listNode.childCount;
  }

  const selection = TextSelection.create(
    tr.doc,
    selFrom,
    selTo,
  );

  tr = tr.setSelection(selection);

  return tr;
}

function wrapNodeWithList(
  tr: Transform,
  schema: Schema,
  pos: number,
  listNodeType: NodeType,
): Transform {
  if (!tr.doc || !listNodeType) {
    return tr;
  }

  const {nodes} = schema;
  const paragraph = nodes[PARAGRAPH];
  const listItem= nodes[LIST_ITEM];

  if (!listItem|| !paragraph) {
    return tr;
  }

  const node = tr.doc.nodeAt(pos);
  const initialSelection = tr.selection;
  const from = pos;
  const to = from + node.nodeSize;
  const attrs = {level: 1, start: 1};
  const paragraphNode = paragraph.create({}, node.content, node.marks);
  const listItemNode = listItem.create({}, Fragment.from(paragraphNode));
  const listNode = listNodeType.create(attrs, Fragment.from(listItemNode));

  tr = tr.delete(from, to);
  tr = tr.insert(from, Fragment.from(listNode));
  tr = tr.setSelection(TextSelection.create(
    tr.doc,
    from,
    to,
  ));
  tr = joinListNode(tr, schema, from);

  const selection = TextSelection.create(
    tr.doc,
    initialSelection.from,
    initialSelection.to,
  );

  tr = tr.setSelection(selection);
  return tr;
}

function setBlockListNodeType(
  tr: Transform,
  schema: Schema,
  listNodeType: ?NodeType,
  pos: number,
): Transform {
  if (!tr.doc) {
    return tr;
  }
  const blockNode = tr.doc.nodeAt(pos);
  if (!blockNode || !blockNode.isBlock) {
    return tr;
  }
  if (isListNode(blockNode)) {
    if (listNodeType) {
      tr = tr.setNodeMarkup(
        pos,
        listNodeType,
        blockNode.attrs,
        blockNode.marks,
      );
    } else {
      tr = unwrapNodesFromList(tr, schema, pos);
    }
  } else {
    if (listNodeType) {
      tr = wrapNodeWithList(tr, schema, pos, listNodeType);
    }
  }

  return tr;
}
