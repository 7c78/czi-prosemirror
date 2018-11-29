// @flow

import adjustAllSelection from './adjustAllSelection';
import applyMark from './applyMark';
import isListNode from './isListNode';
import joinListNode from './joinListNode';
import nullthrows from 'nullthrows';
import selectBodyContent from './selectBodyContent';
import transformAndPreserveTextSelection from './transformAndPreserveTextSelection';
import {AllSelection, TextSelection} from 'prosemirror-state';
import {PARAGRAPH, LIST_ITEM, ORDERED_LIST, BULLET_LIST, TABLE, HEADING, TEXT} from './NodeNames';
import {Fragment, Schema, Node, NodeType, ResolvedPos} from 'prosemirror-model';
import {MARK_TEXT_SELECTION} from './MarkNames';
import {Selection} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {findParentNodeOfType} from 'prosemirror-utils';
import {setBlockType} from 'prosemirror-commands';

import type {SelectionMemo} from './transformAndPreserveTextSelection';

export default function toggleList(
  tr: Transform,
  schema: Schema,
  listNodeType: NodeType,
): Transform {
  tr = adjustAllSelection(tr, schema);
  const {selection, doc} = tr;
  if (!selection || !doc) {
    return tr;
  }

  let {from, to} = selection;

  const fromSelection = TextSelection.create(
    doc,
    from,
    from,
  );

  const result = findParentNodeOfType(listNodeType)(fromSelection);
  if (result) {
    tr = unwrapNodesFromList(tr, schema, result.pos);
  } else {
    wrapNodesWithList(tr, schema, listNodeType);
  }

  return tr;
}

export function unwrapNodesFromList(
  tr: Transform,
  schema: Schema,
  listNodePos: number,
  unwrapParagraphNode?: ?(Node) => Node,
): Transform {
  return transformAndPreserveTextSelection(tr, schema, (memo) => {
    return unwrapNodesFromListInternal(
      memo,
      listNodePos,
      unwrapParagraphNode
    );
  });
}

function wrapNodesWithList(
  tr: Transform,
  schema: Schema,
  listNodeType: NodeType,
): Transform {
  return transformAndPreserveTextSelection(tr, schema, (memo) => {
    return wrapNodesWithListInternal(memo, listNodeType);
  });
}

function wrapNodesWithListInternal(
  memo: SelectionMemo,
  listNodeType: NodeType,
): Transform {
  const {schema} = memo;
  let {tr} = memo;
  const {doc, selection} = tr;
  if (!tr || !selection) {
    return tr;
  }
  const {from, to} = selection;

  const listItem = schema.nodes[LIST_ITEM];
  const paragraph = schema.nodes[PARAGRAPH];
  const heading = schema.nodes[HEADING];

  let items = null;
  let lists = [];
  doc.nodesBetween(from, to, (node, pos) => {
    const nodeType = node.type;
    const nodeName = nodeType.name;
    if (isListNode(node)) {
      if (node.type !== listNodeType) {
        tr = tr.setNodeMarkup(pos, listNodeType, node.attrs, node.marks);
      }
      items && lists.push(items);
      items = null;
      return false;
    }

    if (/table/.test(nodeName)){
      items && lists.push(items);
      items = null;
      return true;
    }

    if (nodeType === heading || nodeType === paragraph) {
      items = items || [];
      items.push({node, pos});
    } else {
      items && lists.push(items);
      items = null;
    }
    return true;
  });
  items && lists.push(items);

  lists = lists.filter(items => items.length > 0);
  if (!lists.length) {
    return tr;
  }

  lists = lists.sort((a, b) => {
    const pa = nullthrows(a[0]).pos;
    const pb = nullthrows(b[0]).pos;
    return pa >= pb ? 1 : -1;
  });

  lists.reverse();

  lists.forEach(items => {
    tr = wrapItemsWithListInternal(
      tr,
      schema,
      listNodeType,
      items,
    );
  });

  return tr;
}

function wrapItemsWithListInternal(
  tr: Transform,
  schema: Schema,
  listNodeType: NodeType,
  items: Array<{node: Node, pos: number}>,
): Transform {
  const initialTr = tr;
  const paragraph = schema.nodes[PARAGRAPH];
  const listItem = schema.nodes[LIST_ITEM];

  if (!paragraph || !listItem) {
    return tr;
  }

  const paragraphNodes = [];
  items.forEach(item => {
    const {node, pos} = item;
    // Temporarily annotate each node with an unique ID.
    const uniqueID = {};
    const nodeAttrs = {...node.attrs, id: uniqueID};
    // Replace the original node with the node annotated by the uniqueID.
    tr = tr.setNodeMarkup(pos, paragraph, nodeAttrs, node.marks);
    paragraphNodes.push(tr.doc.nodeAt(pos));
  });

  const firstNode = paragraphNodes[0];
  const lastNode = paragraphNodes[paragraphNodes.length - 1];
  if (!firstNode || !lastNode) {
    return initialTr;
  }

  const firstNodeID = firstNode.attrs.id;
  const lastNodeID = lastNode.attrs.id;
  if (!firstNodeID || !lastNodeID) {
    return initialTr;
  }

  let fromPos = null;
  let toPos = null;
  tr.doc.descendants((node, pos) => {
    const nodeID = node.attrs.id;
    if (nodeID === firstNodeID) {
      fromPos = pos;
    }
    if (nodeID === lastNodeID) {
      toPos = pos + node.nodeSize;
    }
    return fromPos === null || toPos === null;
  });

  if (fromPos === null || toPos === null) {
    return initialTr;
  }

  const listItemNodes = [];
  items.forEach(item => {
    const {node, pos} = item;
    // Restore the annotated nodes with the copy of the original ones.
    const paragraphNode = paragraph.create(node.attrs, node.content, node.marks);
    const listItemNode = listItem.create(node.attrs, Fragment.from(paragraphNode));
    listItemNodes.push(listItemNode);
  });


  const listNodeAttrs = {indent: 0, start: 1};
  const $fromPos = tr.doc.resolve(fromPos);
  const $toPos = tr.doc.resolve(toPos);
  if (
    $fromPos.nodeBefore &&
    $fromPos.nodeBefore.type === listNodeType &&
    $fromPos.nodeBefore.attrs.indent === 0
  ) {
    tr = tr.delete(fromPos, toPos);
    tr = tr.insert(fromPos - 1, Fragment.from(listItemNodes));
  } else if (
    $toPos.nodeAfter &&
    $toPos.nodeAfter.type === listNodeType &&
    $toPos.nodeAfter.attrs.indent === 0
  ) {
    tr = tr.delete(fromPos, toPos);
    tr = tr.insert(fromPos + 1, Fragment.from(listItemNodes));
  } else {
    const listNode = listNodeType.create(
      listNodeAttrs,
      Fragment.from(listItemNodes),
    );
    tr = tr.delete(fromPos, toPos);
    tr = tr.insert(fromPos,  Fragment.from(listNode));
  }

  return tr;
}

function unwrapNodesFromListInternal(
  memo: SelectionMemo,
  listNodePos: number,
  unwrapParagraphNode?: ?(Node) => Node,
): Transform {
  const {schema} = memo;
  let {tr} = memo;

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
  const {from, to} = initialSelection;

  if (from === to && from < 1) {
    return tr;
  }
  const contentBlocksBefore = [];
  const contentBlocksSelected = [];
  const contentBlocksAfter = [];

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
  const attrs = {indent: listNode.attrs.indent, start: 1};

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
  return tr;
}
