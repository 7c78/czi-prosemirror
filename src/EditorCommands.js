// @flow

import * as MarkNames from './MarkNames';
import * as ProsemirrorTables from 'prosemirror-tables';
import CodeBlockCommand from './CodeBlockCommand';
import FontSizeCommand from './FontSizeCommand';
import FontTypeCommand from './FontTypeCommand';
import HeadingCommand from './HeadingCommand';
import HistoryRedoCommand from './HistoryRedoCommand';
import HistoryUndoCommand from './HistoryUndoCommand';
import HorizontalRuleCommand from './HorizontalRuleCommand';
import ImageFromURLCommand from './ImageFromURLCommand';
import IndentCommand from './IndentCommand';
import LinkSetURLCommand from './LinkSetURLCommand';
import ListSplitCommand from './ListSplitCommand';
import ListToggleCommand from './ListToggleCommand';
import MarkToggleCommand from './MarkToggleCommand';
import MarksClearCommand from './MarksClearCommand';
import TableCellColorCommand from './TableCellColorCommand';
import TableInsertCommand from './TableInsertCommand';
import TextAlignCommand from './TextAlignCommand';
import TextColorCommand from './TextColorCommand';
import TextHighlightCommand from './TextHighlightCommand';
import TextLineSpacingCommand from './TextLineSpacingCommand';
import createCommand from './createCommand';
import {baseKeymap} from 'prosemirror-commands';

const {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  columnResizing,
  deleteColumn,
  deleteRow,
  deleteTable,
  // fixTables,
  goToNextCell,
  mergeCells,
  setCellAttr,
  splitCell,
  tableEditing,
  tableNodes,
  toggleHeaderCell,
  toggleHeaderColumn,
  toggleHeaderRow,
} = ProsemirrorTables;

const {
  MARK_STRONG,
  MARK_EM,
  MARK_STRIKE,
  MARK_UNDERLINE,
} = MarkNames;

// Note that Firefox will, by default, add various kinds of controls to
// editable tables, even though those don't work in ProseMirror. The only way
// to turn these off is globally, which you might want to do with the
// following code:
document.execCommand('enableObjectResizing', false, 'false');
document.execCommand('enableInlineTableEditing', false, 'false');

export const CLEAR_FORMAT = new MarksClearCommand();
export const CODE = new CodeBlockCommand();
export const EM = new MarkToggleCommand(MARK_EM);
export const FONT_SIZES = FontSizeCommand.createGroup();
export const FONT_TYPES = FontTypeCommand.createGroup();
export const H1 = new HeadingCommand(1);
export const H2 = new HeadingCommand(2);
export const H3 = new HeadingCommand(3);
export const H4 = new HeadingCommand(4);
export const H5 = new HeadingCommand(5);
export const H6 = new HeadingCommand(6);
export const HISTORY_REDO = new HistoryRedoCommand();
export const HISTORY_UNDO = new HistoryUndoCommand();
export const HR = new HorizontalRuleCommand();
export const IMAGE_FROM_URL = new ImageFromURLCommand();
export const INDENT_LESS = new IndentCommand(-1);
export const INDENT_MORE = new IndentCommand(1);
export const LINK_SET_URL = new LinkSetURLCommand();
export const LIST_SPLIT = new ListSplitCommand();
export const OL = new ListToggleCommand(true);
export const STRIKE = new MarkToggleCommand(MARK_STRIKE);
export const STRONG = new MarkToggleCommand(MARK_STRONG);
export const TABLE_ADD_COLUMN_AFTER = createCommand(addColumnAfter);
export const TABLE_ADD_COLUMN_BEFORE = createCommand(addColumnBefore);
export const TABLE_ADD_ROW_AFTER = createCommand(addRowAfter);
export const TABLE_ADD_ROW_BEFORE = createCommand(addRowBefore);
export const TABLE_CELL_COLOR = new TableCellColorCommand();
export const TABLE_DELETE_COLUMN = createCommand(deleteColumn);
export const TABLE_DELETE_ROW = createCommand(deleteRow);
export const TABLE_DELETE_TABLE = createCommand(deleteTable);
export const TABLE_INSERT_TABLE = new TableInsertCommand();
export const TABLE_MERGE_CELLS = createCommand(mergeCells);
export const TABLE_MOVE_TO_NEXT_CELL = createCommand(goToNextCell(1));
export const TABLE_MOVE_TO_PREV_CELL = createCommand(goToNextCell(-1));
export const TABLE_SPLIT_CELL = createCommand(splitCell);
export const TABLE_TOGGLE_HEADER_CELL = createCommand(toggleHeaderCell);
export const TABLE_TOGGLE_HEADER_COLUMN = createCommand(toggleHeaderColumn);
export const TABLE_TOGGLE_HEADER_ROW = createCommand(toggleHeaderRow);
export const TEXT_ALIGN_CENTER = new TextAlignCommand('center');
export const TEXT_ALIGN_JUSTIFY = new TextAlignCommand('justify');
export const TEXT_ALIGN_LEFT = new TextAlignCommand('left');
export const TEXT_ALIGN_RIGHT = new TextAlignCommand('right');
export const TEXT_COLOR = new TextColorCommand();
export const TEXT_HIGHLIGHT = new TextHighlightCommand();
export const TEXT_LINE_SPACINGS = TextLineSpacingCommand.createGroup();
export const UL = new ListToggleCommand(false);
export const UNDERLINE = new MarkToggleCommand(MARK_UNDERLINE);
