import treeOperator from './TreeOperator';
import Component from './Component';

class BlockComponent extends Component {

	constructor(renderer, node, subComponents) {
		super(renderer, node, subComponents);

		this.blockType = true;
	}

	getLength(offset) {

		if (this.node.childrens) {
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

		if (this.node.childrens) {
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

	getOffset(DOM, targetOffset) {

		if (!this.node.childrens) {
			var targetDOM = DOM;

			// Figure out the correct offset
			var offset = 0;
			for (var index in this.dom.childNodes) {
				var dom = this.dom.childNodes[index];

				if (targetDOM == dom) {
					break;
				}

				offset += dom.length;
			}

			return offset + targetOffset;
		}

		return targetOffset;
	}

	getPosition(offset) {

		if (this.node.childrens) {
			var node = treeOperator.getChildrenNode(this.node, offset);

			// No such node
			if (!node) {
				node = treeOperator.getLastNode(this.node);
				return node.component.getPosition(node.component.getLength());
			}

			return {
				DOM: node.component.getDOM(),
				offset: 0
			};
		}

		return {
			DOM: this.dom,
			offset: offset
		}

	}

	setCursor(cursor, offset) {

		if (!this.node.childrens) {
			return super.setCursor(cursor, offset);
		}

		if (offset == 0) {
			cursor.setPosition(this.node, 0);
			return 0;
		}

		// ignore First empty node
		var leftOffset = offset;
		leftOffset--;

		// Traverse node tree
		var index = 0;
		var target = treeOperator.getChildrenNode(this.node, index);
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
			
			target = treeOperator.getNextNode(target);
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

		// Check nodes
		var prevNode = treeOperator.getChildrenNode(this.node, cursor.startOffset - 1);
		var nextNode = treeOperator.getChildrenNode(this.node, cursor.startOffset);

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
