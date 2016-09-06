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

					return len + index + 1;
				}
			}
			
			return this.node.childrens.length;
		}

		return 1;
	}

	getCaretLength(offset) {

		if (offset === 0)
			return 0;
console.log(this.node, offset);
		if (this.node.text) {
			return offset ? offset : this.node.text.length + 1;
		} else if (this.node.childrens) {
			var _offset = offset || this.node.childrens.length;

			if (offset <= this.node.childrens.length) {
				var len = 0;
console.log('getCaretLength', this.node.childrens);
				for (var index = 0; index < offset; index++) {
					var subNode = this.node.childrens[index];
					len += subNode.component.getCaretLength();
					console.log('COUNTing', subNode, subNode.component.getCaretLength());
				}

				return len + index + 1;
			}

			return 0;
		}
	}

	getOffset(range) {

		// if component cross over multiple doms
		if (this.dom instanceof Array) {
			var targetDOM = range.startContainer;

			if (range.startContainer.nodeType == Node.TEXT_NODE)
				targetDOM = $(range.startContainer).parent()[0];

			// Figure out the correct offset
			var offset = 0;
			for (var index in this.dom) {
				var dom = this.dom[index];

				if (targetDOM == dom) {
					break;
				}

				if (dom.nodeType == Node.TEXT_NODE) {
					offset += dom.length;
				} else {
					offset += dom.childNodes[0].length;
				}
			}

			return offset + range.startOffset;
		}

		return range.startOffset;
	}

	getPosition(offset) {
		if (!this.node.text && this.node.childrens) {
			var astHandler = this.renderer.shiji.astHandler;
			var node = astHandler.getChildrenNode(this.node, offset);
//			console.log(this.node, node, offset);
			return {
				DOM: node.component.getDOM(),
				offset: 0
			};
/*
			var count = offset;
			for (var index in this.node.childrens) {
				var subNode = this.node.childrens[index];

				var pos = subNode.component.getPosition(count);
				if (pos.DOM) {
					return pos;
				}

				count = pos.offset;
			}
*/
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

	getCaret(offset) {

		// Getting correct position
		var pos = this.getPosition(offset);

		// Figure out caret position
		var point = this.renderer.caret.figureCaretPoint(pos.DOM, pos.offset);

		point.style = {
			background: 'red',
			width: '2px',
			height: '15px'
		};

		return point;
	}

	setCursor(cursor, offset) {

		if (offset == 0) {
			cursor.setPosition(this.node, offset);
			return 0;
		}

		var astHandler = this.renderer.shiji.astHandler;

		// ignore First empty node
		var leftOffset = offset;
		console.log(0, leftOffset);
		if (leftOffset > 0) {
			leftOffset--;
		} else {
			leftOffset++;
		}

		if (leftOffset == 0) {
			cursor.setPosition(this.node, 0);
			return 0;
		}

		// Traverse node tree
		var index = 0;
		var target = astHandler.getChildrenNode(this.node, index);
		while(target) {

			if (leftOffset > 0) {
				console.log('BEFORE', offset, index, leftOffset);
				leftOffset = target.component.setCursor(cursor, leftOffset - 1);
				console.log('AFTER', offset, index, leftOffset);
			} else {
				console.log('LEFT', leftOffset);
				leftOffset = target.component.setCursor(cursor, leftOffset - 1);
			}

			if (leftOffset == 0) {
				return 0;
			}

			// The area between children nodes
			if (leftOffset > 0) {
				cursor.setPosition(this.node, index + 1);
				leftOffset--;
			} else {
				cursor.setPosition(this.node, index);
				leftOffset++;
			}
			console.log('BETWEEN', index, leftOffset);

			if (leftOffset == 0) {
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
		var pos = this.getCaretLength(cursor.startOffset) + offset;
		if (pos > 0) {
			return this.setCursor(cursor, pos);
		}

		return pos;
	}
}

export default BlockComponent;
