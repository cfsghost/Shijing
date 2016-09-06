
class Cursor {

	constructor(renderer) {
		this.renderer = renderer;
		this.timer = -1;
		this.startOffset = -1;
		this.startNode = null;
		this.endNode = null;
		this.endOffest = null;
		this.$dom = $('<div>')
			.css({
				position: 'absolute',
				top: 0,
				left: 0,
				zIndex: 10000
			});

		this.$caret = $('<div>')
			.css({
				position: 'absolute',
				background: 'red',
				width: '2px',
				height: '15px'
			})
			.appendTo(this.$dom);

		renderer.shiji.$container.append(this.$dom);

		// Set cursor position
		renderer.shiji.$origin[0].addEventListener('mousedown', function(e) {
			var range = document.caretRangeFromPoint(e.clientX, e.clientY);
			var textNode = range.startContainer;
			var offset = this.startOffset = range.startOffset;

			range.detach();
			
			// We don't need text node, just getting its parent
			var parentNode = textNode;
			if (textNode.nodeType == Node.TEXT_NODE) {
				parentNode = textNode.parentNode;
			}

			// Set position
			this.setPositionByDOM(parentNode, offset);
			this.show();

		}.bind(this), false);
	}

	figureCaretPoint(dom, offset) {

		var $dom = $(dom);
		var range = document.createRange();
		var textNode = (dom.childNodes) ? dom.childNodes[0] : null;
		var $container = this.renderer.shiji.$container;

		var point = {
			x: 0,
			y: $dom.position().top,
			height: $dom.height(),
			lastChar: false,
			range: range
		};

		// Notinhg left in this DOM
		if (!textNode || textNode.nodeType != Node.TEXT_NODE) {
			point.x = $dom.offset().left - $container.position().left;
			point.y = $dom.offset().top - $container.position().top;
			range.selectNode(dom);
		} else if (offset + 1 >= textNode.length) {

			// Last character in a line
			range.setStart(textNode, offset - 1);
			range.setEnd(textNode, offset);

			// Getting rect information then figure out exact position
			var rect = range.getBoundingClientRect();
			point.x = rect.right - $container.position().left;
			point.y = rect.top - $container.position().top;
			point.lastChar = true;
		} else {
			range.setStart(textNode, offset);
			range.setEnd(textNode, offset + 1);

			// Getting rect information then figure out exact position
			var rect = range.getBoundingClientRect();
			point.x = rect.left - $container.position().left;
			point.y = rect.top - $container.position().top;
		}

		range.collapse(true);

		return point;

	}

	_setPosition(node, offset) {
		this.startOffset = offset;

		// Change component
		var old = this.startNode;
		this.startNode = node;

		var changed = false;
		if (old && this.startNode) {
			if (old.id != this.startNode.id) {
				changed = true;
			}
		} else if (old != this.startNode) {
			changed = true;
		}

		if (changed) {

			// fire events
			if (old) {
				old.component.onBlur();
			}

			// trigger onFocus
			if (this.startNode) {
				this.startNode.component.onFocus();
			}
		}
	}

	setPosition(node, offset) {
//console.log('CURSOR-SETPOS', node);
		// Figure out position
		var caret = node.component.getCaret(offset);

		this.$caret.css(Object.assign({
			height: caret.height,
			left: caret.x,
			top: caret.y
		}, caret.style));

		this._setPosition(node, offset);
	}

	setPositionByDOM(dom, offset) {

		var _offset = offset;

		var point = this.figureCaretPoint(dom, offset);

		this.$caret.css({
			height: point.height,
			left: point.x,
			top: point.y
		});

		// Find out component
		var component =  this.renderer.getOwnerByDOM(dom);
		if (component) {

			// Getting the correct offset by using range object
			_offset = component.getOffset(point.range);

			if (point.lastChar) {
				_offset++;
			}
		}

		// Store it
		this._setPosition(component.node, _offset);
	}

	getCurrentPosition() {

		return {
			startNode: this.startNode,
			startOffset: this.startOffset
		};
	}

	setCursor(node, offset) {

		var astHandler = this.renderer.shiji.astHandler;
		var target = node;
		var lastOffset = offset;
/*
		// If target node has childrens, set the start point to the first node of it
		if (node.childrens) {
			target = astHandler.getChildrenNode(node, offset);
			lastOffset = 1;
		}
*/
		var parentNode = astHandler.getParentNode(target);
		var parentComp = parentNode.component;

		// call its parent node to set cursor
		var newOffset = parentComp.setCursor(this, target, lastOffset);
		if (newOffset < 0) {

			// Trying to level up to get previous node
			var prevNode = astHandler.getPrevNode(parentNode);
			if (!prevNode)
				return 0;

			var lastNode = astHandler.getLastNode(prevNode);
			var rootNode = astHandler.getParentNode(parentNode);

			// TODO: it's not the right rule to call node directly.
			return this.setCursor(lastNode, lastNode.component.getLength() + newOffset + 1);
		} else if (newOffset > 0) {

			// Trying to level up to get previous node
			var nextNode = astHandler.getNextNode(parentNode);
			if (!nextNode)
				return 0;

			var firstNode = astHandler.getFirstNode(nextNode);
			var rootNode = astHandler.getParentNode(parentNode);

			// TODO: it's not the right rule to call node directly.
			return this.setCursor(firstNode, newOffset - 1);
		}

		return newOffset;
	}

	move(offset) {

		// Do nothing
		if (offset == 0)
			return 0;

console.log('Cursor1', this, this.startNode, this.startOffset, offset);

		// Call start node to move cursor
		var leftOffset = this.startNode.component.move(this, offset);
		if (leftOffset == 0) {
			return leftOffset;
		}
console.log('Cursor2', this.startNode, leftOffset);
		// Getting target index of childrens
		var astHandler = this.renderer.shiji.astHandler;
		var index = astHandler.getIndex(this.startNode);
		if (index == -1) {
			// Target is not a node belongs to this node
			throw new Error('Cannot get index of startNode');
		}

		// Put curosr on parent
		var parentNode = astHandler.getParentNode(this.startNode);
		if (!parentNode)
			return 0;

		console.log('PARENT', parentNode, index, leftOffset);
		if (leftOffset > 0) {
			this.setPosition(parentNode, index + 1);
			leftOffset--;
		} else {
			this.setPosition(parentNode, index);
			leftOffset++;
		}

		return this.move(leftOffset);
	}

	show() {

		clearInterval(this.timer);

		this.$caret.show();

		// Blinking
		this.timer = setInterval(function() {
			this.$caret.toggle();
		}.bind(this), 400);
	}

}

export default Cursor;
