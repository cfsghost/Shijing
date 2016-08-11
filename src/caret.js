
class Caret {

	constructor(renderer) {
		this.renderer = renderer;
		this.timer = -1;
		this.curComponent = null;
		this.offset = 0;
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
			var offset = this.offset = range.startOffset;

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
		var textNode = dom.childNodes[0];
		var $container = this.renderer.shiji.$container;

		var point = {
			x: 0,
			y: $dom.position().top,
			height: $dom.height(),
			lastChar: false,
			range: range
		};

		// Notinhg left in this DOM
		if (!textNode) {
			point.x = $dom.offset().left - $container.position().left;
			point.y = $dom.offset().top - $container.position().top;
			range.selectNode(dom);
		} else if (offset + 1 >= textNode.length) {

			// Last character in a line
			range.setStart(textNode, offset - 1);
			range.setEnd(textNode, offset);
			var rect = range.getBoundingClientRect();
			point.x = rect.right - $container.position().left;
			point.y = rect.top - $container.position().top;
			point.lastChar = true;
		} else {

			range.setStart(textNode, offset);
			range.setEnd(textNode, offset + 1);
			var rect = range.getBoundingClientRect();
			point.x = rect.left - $container.position().left;
			point.y = rect.top - $container.position().top;
		}

		range.collapse(true);

		return point;

	}

	_setPosition(component, offset) {
		this.offset = offset;

		// Change component
		var old = this.curComponent;
		this.curComponent = component;

		var changed = false;
		if (component && old) {
			if (component.node.id != old.node.id) {
				changed = true;
			}
		}

		if (changed) {

			// fire events
			if (old) {
				old.onBlur();
			}

			component.onFocus();
		}
	}

	getCurrentPosition() {
		return {
			component: this.curComponent,
			offset: this.offset
		};
	}

	setPositionByNode(node, offset) {
		return this.setPosition(node.component, offset);
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
		var component =  this.renderer.getParentComponentByDOM(dom);
		if (component) {
			_offset = component.getOffset(point.range);

			if (point.lastChar) {
				_offset++;
			}
		}

		this._setPosition(component, _offset);
	}

	setPosition(component, offset) {

		this._setPosition(component, offset);

		// figure out position on the screen
		var pos = component.getPosition(offset);
		if (!pos.DOM) {
			return pos.offset;
		}

		var point = this.figureCaretPoint(pos.DOM, pos.offset);

		this.$caret.css({
			height: point.height,
			left: point.x,
			top: point.y
		});

		return true;
	}

	shiftPosition(offset) {
		this.offset += offset;
	}

	insertText(text) {

		if (!this.curComponent)
			return;

		this.curComponent.insertText(this.offset, text);
	}

	blur() {
		clearInterval(this.timer);
		this.$caret.hide();
		this.curComponent = null;
		this.offset = 0;
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

export default Caret;
