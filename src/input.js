import InputHandler from './input_handler';

class Input {

	constructor(renderer) {

		this.ctx = renderer;
		this.astHandler = this.ctx.shiji.astHandler;
		this.inputHandler = new InputHandler(this);

		// Set cursor position
		renderer.shiji.$origin[0].addEventListener('mousedown', function(e) {
			var cursor = this.ctx.caret;

			cursor.on('update', function(cursor) {
				this.inputHandler.setCursorPosition(cursor.$caret.css('left'), cursor.$caret.css('top'));
				this.inputHandler.focus();
			}.bind(this));

			cursor.setPositionByAxis(e.clientX, e.clientY);

		}.bind(this), false);
	}
}

export default Input;
