import Component from './Component';

class BlockComponent extends Component {

	constructor(renderer, node, subComponents) {
		super(renderer, node, subComponents);

		this.blockType = true;
	}

	getLength(offset) {

		if (this.node.text) {
			return offset ? offset : this.node.text.length;
		} else if (this.node.childrens) {
			if (offset) {
				if (offset <= this.node.childrens.length) {
					var len = 0;

					for (var index = 0; index < offset; index++) {
						var subNode = this.node.childrens[index];
						len += subNode.component.getLength();
					}

					return len;
				}
			}
			
			return this.node.childrens.length;
		}

		return 1;
	}

	getCaretLength(offset) {

		if (offset == 0)
			return 0;

		if (this.node.text) {
			return offset ? offset : this.node.text.length + 1;
		} else if (this.node.childrens) {
			var _offset = offset || this.node.childrens.length;

			if (_offset <= this.node.childrens.length) {
				var len = 0;

				for (var index = 0; index < _offset; index++) {
					var subNode = this.node.childrens[index];
					len += subNode.component.getCaretLength();
				}

				return len + index + 1;
			}

			return 0;
		}

		return 0;
	}

	getPosition(offset) {

		if (!this.node.text && this.node.childrens) {
			var astHandler = this.renderer.shiji.astHandler;
			var node = astHandler.getChildrenNode(this.node, offset);

			// No such node
			if (!node) {
				node = astHandler.getLastNode(this.node);
				return node.component.getPosition(node.component.getLength());
			}

			return {
				DOM: node.component.getDOM(),
				offset: 0
			};
		}

		// Overflow
		if (this.node.text.length < offset) {
			return {
				DOM: null,
				offset: offset - this.node.text.length
			};
		}

		if (this.dom instanceof Array) {

			if (offset == 0) {
				return {
					DOM: this.dom[0],
					offset: 0
				};
			}

			var dom;
			var count = offset;

			for (var index in this.dom) {
				dom = this.dom[index];
				var text = dom.childNodes[0];

				if (text.length > count) {
					break;
				}

				count -= text.length;

				if (count == 0 && parseInt(index) + 1 == this.dom.length) {
					return {
						DOM: dom,
						offset: text.length
					}
				}
			}

			return {
				DOM: dom,
				offset: count
			};
		}

		return {
			DOM: this.dom,
			offset: offset
		}

	}

	setCursor(cursor, offset) {

		if (offset == 0) {
			cursor.setPosition(this.node, 0);
			return 0;
		}

		// ignore First empty node
		var leftOffset = offset;
		leftOffset--;

		// Traverse node tree
		var index = 0;
		var astHandler = this.renderer.shiji.astHandler;
		var target = astHandler.getChildrenNode(this.node, index);
		while(target) {

			var len = target.component.getCaretLength();
			console.log('W', index, len, leftOffset, target);
			if (leftOffset <= len)
				return target.component.setCursor(cursor, leftOffset ? leftOffset - 1 : 0);

			leftOffset -= len;

			// The area between children nodes
			leftOffset--;
			if (leftOffset == 0) {
				cursor.setPosition(this.node, index + 1);
				return 0;
			}
			
			target = astHandler.getNextNode(target);
			index++;
		}

		return leftOffset;
	}

	move(cursor, offset) {

		if (offset == 0)
			return 0;

		console.log('MOVE', cursor, cursor.startNode, cursor.startOffset, this.getCaretLength(cursor.startOffset), offset);
		var leftOffset = this.getCaretLength(cursor.startOffset) + offset;
		if (leftOffset > 0) {
			leftOffset = this.setCursor(cursor, leftOffset);
		}

		return leftOffset;
	}

	adjustCursorPosition(cursor, direction) {

		console.log('ADJUST CURSOR');

		var astHandler = this.renderer.shiji.astHandler;

		// Check nodes
		var prevNode = astHandler.getChildrenNode(this.node, cursor.startOffset - 1);
		var nextNode = astHandler.getChildrenNode(this.node, cursor.startOffset);

		if (prevNode && nextNode) {

			// Should not stay between two inline nodes.
			if (!prevNode.component.blockType && !nextNode.component.blockType) {
				console.log('SKIP', direction ? 'NEXT' : 'BACK');

				// skip
				if (direction) {
					return cursor.move(2);
				} else {
					return cursor.move(-1);
				}
			}

			// TODO:
		}
	}
}

export default BlockComponent;
