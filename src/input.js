import events from 'events';
import InputHandler from './input_handler';

class Input extends events.EventEmitter {

	constructor(renderer) {
		super();

		this.ctx = renderer;
		this.astHandler = this.ctx.shiji.astHandler;
		this.cursor = this.ctx.caret;
		this.inputHandler = new InputHandler(this);
		this.mousedown = false;
		this.dragging = false;

		this.cursor.on('update', function() {
			this.inputHandler.setCursorPosition(this.cursor.caret.x, this.cursor.caret.y);
			this.inputHandler.focus();
		}.bind(this));

		// Set cursor position
		renderer.shiji.$origin[0].addEventListener('mousedown', function(e) {
			this.cursor.setPositionByAxis(e.clientX, e.clientY);
			this.mousedown = true;
		}.bind(this), false);

		renderer.shiji.$origin[0].addEventListener('mousemove', function(e) {
			if (this.mousedown) {
				this.dragging = true;
			}
		}.bind(this), false);

		renderer.shiji.$origin[0].addEventListener('mouseup', function(e) {
			this.mousedown = false;
			this.dragging = false;
		}.bind(this), false);
	}
}

export default Input;
