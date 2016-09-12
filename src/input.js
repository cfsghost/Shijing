import InputHandler from './input_handler';

class Input {

	constructor(renderer) {

		this.ctx = renderer;
		this.astHandler = this.ctx.shiji.astHandler;
		this.inputHandler = new InputHandler(this);
		this.cursor = this.ctx.caret;

		this.cursor.on('update', function() {
			this.inputHandler.setCursorPosition(this.cursor.caret.x, this.cursor.caret.y);
			this.inputHandler.focus();
		}.bind(this));

		// Set cursor position
		renderer.shiji.$origin[0].addEventListener('mousedown', function(e) {
			this.cursor.baseline = null;
			this.cursor.setPositionByAxis(e.clientX, e.clientY);

		}.bind(this), false);
	}
}

export default Input;
