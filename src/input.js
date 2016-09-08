import Caret from './caret';
import InputHandler from './input_handler';

var Key = {
	Left: 37,
	Up: 38,
	Right: 39,
	Down: 40,
	Backspace: 8,
};

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

if (false) {
		$(document).keydown(function(e) {
			switch(e.keyCode) {
			case Key.Left:

				this.ctx.caret.move(-1);
				this.ctx.caret.show();

				break;
				var pos = this.ctx.caret.getCurrentPosition();
				if (pos.offset == 0) {

					this.goBack(pos.component.node, 1);

				} else {
					// Set new position to caret
					this.ctx.caret.setPositionByNode(pos.component.node, pos.offset - 1);
				}

				this.ctx.caret.show();

				break;

			case Key.Right:

				this.ctx.caret.move(1);
				this.ctx.caret.show();

				break;

				var pos = this.ctx.caret.getCurrentPosition();

				if (pos.offset == pos.component.getLength()) {

					// move caret position to the end of previous node
					this.goNext(pos.component.node, 1);
				} else {
					// Set new position to caret
					this.ctx.caret.setPositionByNode(pos.component.node, pos.offset + 1);
				}

				this.ctx.caret.show();
				break;
			}
		}.bind(this));

		$(document).keypress(function(e) {

			if (e.metaKey)
				return true;

			var pos = this.ctx.caret.getCurrentPosition();
			var node = pos.startNode;
/*
			// Backspace
			if (e.keyCode == Key.Backspace) {
				newOffset = -1;

				// Tell parent component to deal with backspace because it might cross two components
				var parentComponent = pos.component.getParentComponent();
				var task = parentComponent.backspace(pos.startNode.component, pos.startOffset);
				task.then(function(pos) {

					if (!pos) {
						this.ctx.caret.show();
						return;
					}

					try {
						this.ctx.caret.setPositionByNode(pos.component.node, pos.offset);
						this.ctx.caret.show();
					} catch(e) {
						console.log(e);
						console.log(pos);
					}
				}.bind(this));
				return;
			}
*/
			// Insert character
			this.astHandler.insert(pos.startNode, pos.startOffset, String.fromCharCode(e.keyCode));

			// done everything so we update now
			var task = node.component.refresh();
			task.then(function() {

				// Set new position to caret
				this.ctx.caret.move(1);
				//this.ctx.caret.setPositionByNode(node, pos.startOffset + 1);
				this.ctx.caret.show();
			}.bind(this));

			return false;

		}.bind(this));
}
	}

	focus() {
	}

	goBack(node, offset) {

		// move caret position to the end of previous node
		var prevNode = this.astHandler.getPrevNode(node);
		if (prevNode) {
			var lastNode = this.astHandler.getLastNode(prevNode);
			var _offset = offset;

			// If the original node is a block, nothing to shift. just move caret to previous node.
			if (node.component.blockType) {
				_offset = 0;
			}

			var len = lastNode.component.getLength();
			if (len == -1) {
				// it's not inline string
				return this.goBack(lastNode, 0);
			}

			var ret = this.ctx.caret.setPositionByNode(lastNode, len - _offset);
			if (ret != true) {
				this.goBack(prevNode, 0);
			}

			return;
		}

		// it's the head of childrens
		var parentNode = this.astHandler.getParentNode(node);
		if (parentNode)
			this.goBack(parentNode, 0);
	}

	goNext(node, offset) {

		// move caret position to the end of previous node
		var nextNode = this.astHandler.getNextNode(node);
		if (nextNode) {
			var firstNode = this.astHandler.getFirstNode(nextNode);
			var _offset = offset;

			// If the original node is a block, nothing to shift. just move caret to previous node.
			if (node.component.blockType) {
				_offset = 0;
			}

			var len = firstNode.component.getLength();
			if (len == -1) {
				// it's not inline string
				return this.goNext(firstNode, 0);
			}

			var ret = this.ctx.caret.setPositionByNode(firstNode, _offset);
			if (ret != true) {
				this.goNext(nextNode, 0);
			}

			return;
		}

		// it's the end of childrens
		var parentNode = this.astHandler.getParentNode(node);
		if (parentNode)
			this.goNext(parentNode, 0);
	}

}

export default Input;
