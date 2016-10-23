import events from 'events';
import treeOperator from './TreeOperator';
import Selection from './Selection';
import InputHandler from './input_handler';
import Cursor from './cursor';

class Input extends events.EventEmitter {

	constructor(context) {
		super();

		this.ctx = context;
		this.renderer = context.renderer;
		this.mousedown = false;
		this.dragging = false;

		// Selection anchor
		this.anchor = {
			node: null,
			offset: null
		};

		// Create selection for current user
		var selection = this.selection = new Selection(this);
		selection.on('update', () => {
/*
			// Update main cursor
			var cursors = selection.getAllCursors();
			if (cursors.length) {
				this.cursor.release();
				this.cursor = cursors[0];
			}
*/
		});

		this.id = selection.id;
		this.inputHandler = new InputHandler(this);

		// Create cursor
		this.cursor = new Cursor(this.renderer);
//		selection.addCursor(this.cursor);

		this.renderer.Selection.addSelection(selection);

		this.cursor.on('update', () => {
			this.inputHandler.setCursorPosition(this.cursor.caret.x, this.cursor.caret.y);
			this.inputHandler.focus();
		});

		// Set cursor position
		var newCursor = new Cursor(this.renderer);
		this.ctx.$origin[0].addEventListener('mousedown', (e) => {
			this.cursor.setEnd(null, null);
			this.cursor.setPositionByAxis(e.clientX, e.clientY);

			this.updateCursor();

			this.mousedown = true;

			// Reset anchor
			this.anchor.node = this.cursor.startNode;
			this.anchor.offset = this.cursor.startOffset;
		}, false);

		this.ctx.$origin[0].addEventListener('mousemove', (e) => {
			if (!this.mousedown)
				return;

			this.dragging = true;
			this.emit('dragging', e);
		}, false);

		this.ctx.$origin[0].addEventListener('mouseup', (e) => {
			this.mousedown = false;
			this.dragging = false;
		}, false);

		this.on('dragging', (e) => {

			// Getting node and offset by using x and y
			newCursor.setPositionByAxis(e.clientX, e.clientY);

			// User is mvoe cursor on the start point, so nothing's changed
			if (newCursor.startNode == this.cursor.startNode &&
				newCursor.startOffset == this.cursor.startOffset) {
				return;
			}

			var compare = treeOperator.compareBoundary(this.anchor.node, this.anchor.offset, newCursor.startNode, newCursor.startOffset);

			if (compare > 0) {
				// nothing's changed
				if (this.cursor.startNode == this.anchor.node && this.cursor.startOffset == this.anchor.offset &&
					this.cursor.endNode == newCursor.startNode && this.cursor.endOffset == newCursor.startOffset)
					return;

				this.cursor.setStart(this.anchor.node, this.anchor.offset);
				this.cursor.setEnd(newCursor.startNode, newCursor.startOffset);
			} else {
				// nothing's changed
				if (this.cursor.startNode == newCursor.startNode && this.cursor.startOffset == newCursor.startOffset &&
					this.cursor.endNode == this.anchor.node && this.cursor.endOffset == this.anchor.offset)
					return;

				this.cursor.setStart(newCursor.startNode, newCursor.startOffset);
				this.cursor.setEnd(this.anchor.node, this.anchor.offset);
			}

			this.updateCursor();
		});
	}

	updateCursor() {

		this.ctx.dispatch({
			type: 'SET_SELECTION',
			payload: {
				targetId: this.selection.id,
				cursors: [
					{
						startNode: this.cursor.startNode.id,
						startOffset: this.cursor.startOffset,
						endNode: this.cursor.endNode ? this.cursor.endNode.id : undefined,
						endOffset: (this.cursor.endOffset != -1) ? this.cursor.endOffset : undefined
					}
				]
			}
		}, true);
	}
}

export default Input;
