import treeOperator from './TreeOperator';

var Key = {
	Enter: 13,
	ESC: 27,
	Left: 37,
	Up: 38,
	Right: 39,
	Down: 40,
	Backspace: 8,
};

class InputHandler {

	constructor(input) {

		this.ctx = input.ctx;
		this.selection = input.selection;
		this.input = input;
		this.$inputBox = $('<iframe>')
			.addClass('shiji-inputhandler')
			.css({
				position: 'absolute',
				top: 0,
				left: 0,
				border: '0px',
//				border: '1px solid orange',
				padding: 0,
				margin: 0,
				display: 'none',
				pointerEvents: 'none'
			})
			.outerWidth(this.ctx.$layout.width());
		this.cursor = this.input.cursor;

		this.ctx.$overlay.append(this.$inputBox);

		this.$inputBody = this.$inputBox
			.contents()
			.find('body')
			.css({
				whiteSpace: 'pre-wrap',
				wordBreak: 'break-all'
			});

		/* Keyboard events */
		this.originContent = null;
		this.preeditMode = false;
		this.$inputBody
			.attr('contenteditable', true)
			.attr('spellcheck', false)
			.attr('aria-multiline', true)
			.attr('role', 'textbox')
			.on('blur', (e) => {
				this.$inputBody.empty();
			})
			.on('compositionstart', (e) => {
				// Display input box
				this.$inputBox.css({
					display: ''
				});

				this.preeditMode = true;
				this.originContent = null;

				// Hide cursors
				this.selection.removeAllCursors();
				this.selection.update();
			})
			.on('compositionupdate', (e) => {
//				console.log('COMP UPDATE', e.originalEvent.data);
				var task = this.updateText(e.originalEvent.data);
				task.then(() => {
				});
			})
			.on('compositionend', (e) => {
				this.preeditMode = false;

				// Hide input box
				this.$inputBox.css({
					display: 'none'
				});

				console.log('COMP END', e.originalEvent.data, e);
				var task = this.updateText(e.originalEvent.data);
				task.then(() => {
					this.originContent = null;

					var cursor = this.input.cursor;
					cursor.move(e.originalEvent.data.length);

					this.updateCursor();
				});

				// Clear input box
				this.$inputBody.empty();

			})
			.on('keydown', (e) => {

				if (e.metaKey)
					return true;

				var cursor = this.input.cursor;

				if (this.preeditMode) {
					return;
				}

				// Direction keys
				switch(e.keyCode) {
				case Key.Up:
					cursor.moveUp();
					this.updateCursor();
					break;

				case Key.Down:
					cursor.moveDown();
					this.updateCursor();
					break;

				case Key.Left:
					cursor.move(-1);
					this.updateCursor();
					break;

				case Key.Right:
					cursor.move(1);
					this.updateCursor();
					break;

				case Key.Backspace:

					// There is selection which contains range  we have to deal with first
					if (cursor.endNode && cursor.endOffset) {

						if (cursor.startNode == cursor.endNode) {

							// Getting text before start point
							var sets = treeOperator.getTextSets(cursor.endNode, cursor.endOffset);
							var beforeStr = sets.before.substr(0, cursor.startOffset);

							// Replace old text with new text
							treeOperator.setText(cursor.startNode, [
								beforeStr,
								sets.after
							].join(''));

							// Reset cursor position
							cursor.setEnd(null, null);
							cursor.setPosition(cursor.startNode, cursor.startOffset);

							// done everything so we update now
							var task = cursor.startNode.component.refresh();
							task.then(() => {
								this.updateCursor();
							});
						}
						break;
					}

					// Getting text
					var sets = treeOperator.getTextSets(cursor.startNode, cursor.startOffset);

					// Replace old text with new text
					treeOperator.setText(cursor.startNode, [
						sets.before.substr(0, cursor.startOffset - 1),
						sets.after
					].join(''));

					// done everything so we update now
					var task = cursor.startNode.component.refresh();
					task.then(() => {

						// Set new position to caret
						cursor.move(-1);
						this.updateCursor();
					});

					break;

				default:
					this.$inputBody.empty();
				}

			})
			.on('keypress', (e) => {

				if (e.metaKey)
					return true;

				var cursor = this.input.cursor;
				switch(e.keyCode) {

				case Key.Enter:
					var action = this.ctx.dispatch({
						type: 'SPLIT_PARAGRAPH',
						payload: {
							targetId: cursor.startNode.id,
							offset: cursor.startOffset
						}
					});

					return true;

				default:

					var action = this.ctx.dispatch({
						type: 'INSERT_TEXT',
						payload: {
							startNode: cursor.startNode.id,
							startOffset: cursor.startOffset,
							data: String.fromCharCode(e.keyCode)
						}
					});

					action.then(() => {

						// done everything so we update now
						this.$inputBody.empty();

						// Update new position
						cursor.move(1);
						this.updateCursor();
					});

					return true;
				}

				return false;
			});
	}

	_updateText(text) {
		var cursor = this.input.cursor;

		if (!this.originContent) {
			// Store original content
			this.originContent = cursor.startNode.text.slice(0);
		} else {
			// Clone original content back and set to node
			cursor.startNode.text = this.originContent.slice(0);
		}

		treeOperator.insert(cursor.startNode, cursor.startOffset, text);

		// done everything so we update now
		return cursor.startNode.component.refresh();
	}

	updateText(text) {
		var cursor = this.input.cursor;

		var offset = 0;

		// Replace old content in range
		if (this.originContent) {
			offset = this.originContent.length;
		}

		this.originContent = text;

		return this.ctx.dispatch({
			type: 'INSERT_TEXT',
			payload: {
				startNode: cursor.startNode.id,
				startOffset: cursor.startOffset,
				endNode: cursor.startNode.id,
				endOffset: cursor.startOffset + offset,
				data: text
			}
		});
	}

	updateCursor() {

		// Update cursor
		this.ctx.dispatch({
			type: 'SET_SELECTION',
			payload: {
				targetId: this.selection.id,
				cursors: [
					{
						startNode: this.input.cursor.startNode.id,
						startOffset: this.input.cursor.startOffset
					}
				]
			}
		});
	}

	setCursorPosition(x, y) {

		this.$inputBox.css({
			top: y
		});

		this.$inputBody.css({
			textIndent: x,
			marginLeft: 0,
			marginTop: 0
		});
	}

	focus() {
		var cursor = this.input.cursor;

		this.$inputBox
			.outerWidth(this.ctx.$layout.width());

		this.$inputBody.css({
			lineHeight: 1.15,
			height: cursor.caret.$dom.css('height'),
			fontSize: cursor.caret.$dom.css('font-size') || 'intital',
			fontFamily: cursor.caret.$dom.css('font-family') || 'intital',
			fontWeight: cursor.caret.$dom.css('font-weight') || 'intital',
			fontStyle: cursor.caret.$dom.css('font-style') || 'intital',
			textDecoration: cursor.caret.$dom.css('text-decoration') || 'intital',
			color: cursor.caret.$dom.css('color') || 'red',
		});
		this.$inputBody.focus();
		this.$inputBody.empty();

		// Workaround: reset input method because it is no reaction sometimes
		var selection = this.$inputBox.get(0).contentWindow.getSelection();
		var range = document.createRange();
		range.selectNodeContents(this.$inputBody[0]);
		range.collapse();
		selection.removeAllRanges();
		selection.addRange(range);
	}
}

export default InputHandler;
