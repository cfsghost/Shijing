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

		this.ctx = input;
		this.shiji = this.ctx.ctx.shiji;
		this.astHandler = this.ctx.astHandler;
		this.$inputBox = $('<iframe>')
			.css({
				width: this.shiji.$origin.width(),
				position: 'absolute',
				top: 0,
				left: 0,
				border: '0px',
//				border: '1px solid orange',
				display: 'none',
				pointerEvents: 'none'
			});
		this.cursor = this.ctx.cursor;

		this.shiji.$overlay.append(this.$inputBox);

		this.$inputBody = this.$inputBox
			.contents()
			.find('body');

		/* Keyboard events */
		this.originContent = null;
		this.preeditMode = false;
		this.$inputBody
			.attr('contenteditable', true)
			.attr('spellcheck', false)
			.attr('aria-multiline', true)
			.attr('role', 'textbox')
			.on('blur', function(e) {
				this.$inputBody.empty();
			}.bind(this))
			.on('compositionstart', function(e) {
				// Display input box
				this.$inputBox.css({
					display: ''
				});

				this.preeditMode = true;
				this.originContent = null;

				this.cursor.hide();

//				console.log('COMP START');
			}.bind(this))
			.on('compositionupdate', function(e) {
				console.log('COMP UPDATE', e.originalEvent.data);
				var task = this.updateText(e.originalEvent.data);
				task.then(function() {

					// Update position of cursor and input handler
					this.cursor.update();

				}.bind(this));
			}.bind(this))
			.on('compositionend', function(e) {
				this.preeditMode = false;

				// Hide input box
				this.$inputBox.css({
					display: 'none'
				});

				console.log('COMP END', e.originalEvent.data, e);

				var task = this.updateText(e.originalEvent.data);
				task.then(function() {

					// Update position of cursor and input handler
					this.cursor.update();

				}.bind(this));

				this.originContent = null;

				// Set new position to caret
				this.cursor.move(e.originalEvent.data.length);
				this.cursor.show();

				this.$inputBody.empty();

			}.bind(this))
			.on('keydown', function(e) {

				if (e.metaKey)
					return true;

				var cursor = this.cursor;
//console.log('KEYDOWN', this.$inputBody.text(), e, preeditMode);
				if (this.preeditMode) {
					return;
				}

				// Direction keys
				switch(e.keyCode) {
				case Key.Up:
					cursor.moveUp();
					break;

				case Key.Down:
					cursor.moveDown();
					break;

				case Key.Left:

					cursor.move(-1);
					cursor.show();
//					this.setCursorPosition(cursor.$caret.css('left'), cursor.$caret.css('top'));

					break;

				case Key.Right:

					cursor.move(1);
					cursor.show();
//					this.setCursorPosition(cursor.$caret.css('left'), cursor.$caret.css('top'));

					break;

				case Key.Enter:

					break;

				case Key.Backspace:

					// Getting text
					var sets = this.astHandler.getTextSets(cursor.startNode, cursor.startOffset);

					// Replace old text with new text
					this.astHandler.setText(cursor.startNode, [
						sets.before.substr(0, cursor.startOffset - 1),
						sets.after
					].join(''));

					// done everything so we update now
					var task = cursor.startNode.component.refresh();
					task.then(function() {

						// Set new position to caret
						cursor.move(-1);
						cursor.show();

//						this.setCursorPosition(cursor.$caret.css('left'), cursor.$caret.css('top'));
					}.bind(this));

					break;

				default:
					this.$inputBody.empty();
				}

			}.bind(this))
			.on('keypress', function(e) {

				if (e.metaKey)
					return true;

				var cursor = this.ctx.ctx.caret;

				this.astHandler.insert(cursor.startNode, cursor.startOffset, String.fromCharCode(e.keyCode));

				// done everything so we update now
				var task = cursor.startNode.component.refresh();
				task.then(function() {
					this.$inputBody.empty();

					// Set new position to caret
					cursor.move(1);
					cursor.show();

//					this.setCursorPosition(cursor.$caret.css('left'), cursor.$caret.css('top'));
				}.bind(this));

				return false;
			}.bind(this));
	}

	updateText(text) {

		if (!this.originContent) {
			// Store original content
			this.originContent = this.cursor.startNode.text.slice(0);
		} else {
			// Clone original content back and set to node
			this.cursor.startNode.text = this.originContent.slice(0);
		}

		this.astHandler.insert(this.cursor.startNode, this.cursor.startOffset, text);

		// done everything so we update now
		return this.cursor.startNode.component.refresh();
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
		console.log('FOCUS');
		this.$inputBody.css({
			lineHeight: 1.15,
			height: this.cursor.caret.$dom.css('height'),
			fontSize: this.cursor.caret.$dom.css('font-size') || 'intital',
			fontFamily: this.cursor.caret.$dom.css('font-family') || 'intital',
			fontWeight: this.cursor.caret.$dom.css('font-weight') || 'intital',
			fontStyle: this.cursor.caret.$dom.css('font-style') || 'intital',
			textDecoration: this.cursor.caret.$dom.css('text-decoration') || 'intital',
			color: this.cursor.caret.$dom.css('color') || 'red',
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
