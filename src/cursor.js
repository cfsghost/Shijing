import events from 'events';
import Caret from './caret';

class Cursor extends events.EventEmitter {

	constructor(renderer) {
		super();

		this.renderer = renderer;
		this.timer = -1;
		this.startOffset = -1;
		this.startNode = null;
		this.endNode = null;
		this.endOffest = null;
		this.baseline = null;
		this.$dom = $('<div>')
			.css({
				position: 'absolute',
				top: 0,
				left: 0,
				zIndex: 10000
			});

		this.caret = new Caret();
		this.caret.$dom.appendTo(this.$dom);

		renderer.shiji.$overlay.append(this.$dom);
	}

	figureCaretPoint(dom, offset) {

		var $dom = $(dom);
		var range = document.createRange();
		var textNode = (dom.childNodes) ? dom.childNodes[0] : null;
		var $container = this.renderer.shiji.$overlay;

		var point = {
			x: 0,
			y: $dom.position().top,
			height: $dom.height(),
			lastChar: false,
			range: range
		};

		// Nothing left in this DOM
		if (!textNode || textNode.nodeType != Node.TEXT_NODE) {
			point.x = $dom.offset().left - $container.offset().left;
			point.y = $dom.offset().top - $container.offset().top;
			range.selectNode(dom);
		} else if (offset >= textNode.length) {

			// Last character in a line
			range.setStart(textNode, textNode.length - 1);
			range.setEnd(textNode, textNode.length);

			// Getting rect information then figure out exact position
			var rect = range.getBoundingClientRect();
			point.x = rect.right - $container.offset().left;
			point.y = rect.top - $container.offset().top;
			point.lastChar = true;
		} else {
			range.setStart(textNode, offset);
			range.setEnd(textNode, offset + 1);

			// Getting rect information then figure out exact position
			var rect = range.getBoundingClientRect();
			point.x = rect.left - $container.offset().left;
			point.y = rect.top - $container.offset().top;
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
				old.component.onBlur(this);
			}

			// trigger onFocus
			if (this.startNode) {
				this.startNode.component.onFocus(this);
			}
		}

		setTimeout(function() {
			this.emit('update', this);
		}.bind(this), 0);

	}

	setPosition(node, offset) {

		// Figure out position
		var caret = node.component.getCaret(offset);

		this.caret.move(caret.x, caret.y);

		this._setPosition(node, offset);

		this.caret.setStyle(Object.assign({
			height: caret.height,
			fontSize: $(caret.range.startNode).css('font-size')
		}, node.style || {}));
	}

	_setPositionByAxis(x, y) {
		var range = document.caretRangeFromPoint(x, y);
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
	}

	setPositionByAxis(x, y) {
		this.baseline = null;
		this._setPositionByAxis(x, y);
	}

	setPositionByDOM(dom, offset) {

		var _offset = offset;

		var point = this.figureCaretPoint(dom, offset);

		this.caret.move(point.x, point.y);

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

		this.caret.setStyle(Object.assign({
			height: point.height,
			fontSize: $(dom).css('font-size')
		}, component.node.style || {}));
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

	findLineViewManager(node) {

		if (node.component.lineViews) {
			return node;
		}

		var astHandler = this.renderer.shiji.astHandler;
		var parentNode = astHandler.getParentNode(node);
		if (parentNode)
			return this.findLineViewManager(parentNode);
		else
			return null;
	}

	moveUp() {

		var y;
		var node = this.findLineViewManager(this.startNode);
		if (node) {
			// Getting DOM by using startNode and startOffset
			var pos = this.startNode.component.getPosition(this.startOffset);
			var range = document.createRange();

			// Figure line which contains such DOM
			for (var index in node.component.lineViews) {
				var lineView = node.component.lineViews[index];
				range.selectNode(lineView[0]);

				// Found
				if (range.isPointInRange(pos.DOM)) {

					// Previous line
					if (index > 0) {
						var $lineView = node.component.lineViews[index - 1];
						y = $lineView.offset().top;
					}
					break;
				}
			}
		}

		var $container = this.renderer.shiji.$overlay;

		if (this.baseline == null)
			this.baseline = this.caret.x;

		if (y == undefined) {
			y = this.caret.y - this.caret.$dom.height();
			if (y < 0) {
				y = 0;
			}
		}

		this._setPositionByAxis(this.baseline + $container.offset().left, y + $container.offset().top);
	}

	moveDown() {

		var y;
		var node = this.findLineViewManager(this.startNode);
		if (node) {
			// Getting DOM by using startNode and startOffset
			var pos = this.startNode.component.getPosition(this.startOffset);
			var range = document.createRange();

			// Figure line which contains such DOM
			for (var index in node.component.lineViews) {
				var lineView = node.component.lineViews[index];
				range.selectNode(lineView[0]);

				// Found
				if (range.isPointInRange(pos.DOM)) {

					// Next line
					if (parseInt(index) + 1 <= node.component.lineViews.length) {
						var $lineView = node.component.lineViews[parseInt(index) + 1];
						y = $lineView.offset().top;
					}

					break;
				}
			}
		}

		var $container = this.renderer.shiji.$overlay;

		if (this.baseline == null)
			this.baseline = this.caret.x;

		if (y == undefined)
			y = this.caret.y + this.caret.$dom.height();

		this._setPositionByAxis(this.baseline + $container.offset().left, y + $container.offset().top);
	}

	move(offset) {

		if (offset == 0)
			return 0;

		this.baseline = null;
console.log('Cursor1', this, this.startNode, this.startOffset, offset);

		// Call start node to move cursor
		var leftOffset = this.startNode.component.move(this, offset);
console.log('MOVED', this, this.startNode, this.startOffset);
		if (leftOffset == 0) {
			return leftOffset;
		}
console.log('Cursor2', this.startNode, leftOffset);
		// Getting target index of childrens
		var astHandler = this.renderer.shiji.astHandler;
		var index = astHandler.getIndex(this.startNode);
		if (index == -1) {
			return 0;
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

		parentNode.component.adjustCursorPosition(this, (offset > 0) ? true : false);

		return this.move(leftOffset);
	}

	show() {

		this.caret.show();
	}

}

export default Cursor;
