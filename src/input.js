import InputHandler from './input_handler';

class Input {

	constructor(renderer) {

		this.ctx = renderer;
		this.astHandler = this.ctx.shiji.astHandler;
		this.inputHandler = new InputHandler(this);

		// Set cursor position
		renderer.shiji.$origin[0].addEventListener('mousedown', function(e) {
			var cursor = this.ctx.caret;
			var range = document.caretRangeFromPoint(e.clientX, e.clientY);
			var textNode = range.startContainer;
			var offset = cursor.startOffset = range.startOffset;

			range.detach();
			
			// We don't need text node, just getting its parent
			var parentNode = textNode;
			if (textNode.nodeType == Node.TEXT_NODE) {
				parentNode = textNode.parentNode;
			}

			// Set position
			cursor.setPositionByDOM(parentNode, offset);
			cursor.show();

			setTimeout(function() {
				this.inputHandler.setCursorPosition(cursor.$caret.css('left'), cursor.$caret.css('top'));
				this.inputHandler.focus();
			}.bind(this), 0);

		}.bind(this), false);
	}
}

export default Input;
