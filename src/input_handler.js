
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
//				border: '1px solid orange',
				border: '0px',
				display: 'none'
			});

		this.shiji.$overlay.append(this.$inputBox);

		$(this.$inputBox.get(0).contentWindow).on('load', function() {
			console.log('ready');
		});

		this.$inputBody = this.$inputBox
			.contents()
			.find('body');

		var originContent = null;
		var preeditMode = false;
		this.$inputBody
			.attr('contenteditable', true)
			.on('compositionstart', function(e) {
				// Display input box
				this.$inputBox.css({
					display: ''
				});

				preeditMode = true;
			}.bind(this))
			.on('compositionend', function(e) {

				// Hide input box
				this.$inputBox.css({
					display: 'none'
				});

				preeditMode = false;
			}.bind(this))
			.on('keydown', function(e) {
				var cursor = this.ctx.ctx.caret;

				if (e.which == 229) {

					if (!originContent) {
						originContent = cursor.startNode.text.slice(0);
					} else {
						cursor.startNode.text = originContent.slice(0);
					}

					var buffer = this.$inputBody.text();
					this.astHandler.insert(cursor.startNode, cursor.startOffset, buffer);

					// done everything so we update now
					var task = cursor.startNode.component.refresh();
					task.then(function() {

						// Entered already
						if (!preeditMode) {
							this.$inputBody.empty();

							// clear buffer
							originContent = null;

							// Set new position to caret
							cursor.move(buffer.length);
							cursor.show();

							this.setCursorPosition(cursor.$caret.css('left'), cursor.$caret.css('top'));
						}
					}.bind(this));
				}

			}.bind(this))
			.on('keypress', function(e) {
				var cursor = this.ctx.ctx.caret;

				this.astHandler.insert(cursor.startNode, cursor.startOffset, String.fromCharCode(e.keyCode));

				// done everything so we update now
				var task = cursor.startNode.component.refresh();
				task.then(function() {
					this.$inputBody.empty();

					// Set new position to caret
					cursor.move(1);
					cursor.show();

					this.setCursorPosition(cursor.$caret.css('left'), cursor.$caret.css('top'));
				}.bind(this));

				return false;
			}.bind(this));
	}

	setCursorPosition(x, y) {

		this.$inputBody.css({
			textIndent: x,
			marginLeft: 0,
			marginTop: y
		});
	}

	focus() {
		console.log('FOCUS');
		this.$inputBody.focus();
	}
}

export default InputHandler;
