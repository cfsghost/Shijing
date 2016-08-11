import Caret from './caret';

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

		$(document).keydown(function(e) {
			switch(e.keyCode) {
			case Key.Left:

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

			var newOffset = 1;
			var pos = this.ctx.caret.getCurrentPosition();
			var node = pos.component.node;

			// Backspace
			if (e.keyCode == Key.Backspace) {
				newOffset = -1;

				// Tell parent component to deal with backspace because it might cross two components
				var parentComponent = pos.component.getParentComponent();
				var task = parentComponent.backspace(pos.component, pos.offset);
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

			// Insert character
			this.astHandler.insert(node, pos.offset, String.fromCharCode(e.keyCode));

			newOffset += pos.offset;

			// done everything so we update now
			var task = this.astHandler.update(node);
			task.then(function() {

				// Set new position to caret
				this.ctx.caret.setPositionByNode(node, newOffset);
				this.ctx.caret.show();
			}.bind(this));

			return false;

		}.bind(this));
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
