var Key = {
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
		var originContent = null;
		var preeditMode = false;
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

				preeditMode = true;
				originContent = null;

//				console.log('COMP START');
			}.bind(this))
			.on('compositionupdate', function(e) {
//				console.log('COMP UPDATE', e.originalEvent.data);
				var cursor = this.ctx.ctx.caret;

				if (!originContent) {
					originContent = cursor.startNode.text.slice(0);
				} else {
					cursor.startNode.text = originContent.slice(0);
				}

				var str = e.originalEvent.data;
				this.astHandler.insert(cursor.startNode, cursor.startOffset, str);

				// done everything so we update now
				var task = cursor.startNode.component.refresh();
				task.then(function() {

					return;

				}.bind(this));
			}.bind(this))
			.on('compositionend', function(e) {

				// Hide input box
				this.$inputBox.css({
					display: 'none'
				});

				preeditMode = false;

//				console.log('COMP END', e.originalEvent.data, e);

				var cursor = this.ctx.ctx.caret;
				originContent = null;

				// Set new position to caret
				cursor.move(this.$inputBody.text().length);
				cursor.show();
//				this.setCursorPosition(cursor.$caret.css('left'), cursor.$caret.css('top'));
				this.$inputBody.empty();

			}.bind(this))
			.on('keydown', function(e) {

				if (e.metaKey)
					return true;

				var cursor = this.ctx.ctx.caret;
//console.log('KEYDOWN', this.$inputBody.text(), e, preeditMode);
				if (preeditMode) {
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
