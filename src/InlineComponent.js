import Component from './Component';

class InlineComponent extends Component {

	constructor(renderer, node, subComponents) {
		super(renderer, node, subComponents);

		this.blockType = false;
	}

	getLength() {
		return 0;
	}

	getCaretLength(offset) {

		var len = this.getLength(offset);

		return len ? this.getLength(offset) + 1 : 0;
	}

	getRects(DOM) {

		var rects = [];

		if (!DOM) {
			var doms = this.getDOMs();

			doms.forEach(function(DOM) {
				rects = rects.concat(this.getRects(DOM));
			}.bind(this));

			return rects;
		}

		// traverse child nodes if node is not text node
		if (DOM.nodeType != Node.TEXT_NODE) {

			if (DOM.childNodes) {
				for (var i = 0; i < DOM.childNodes.length; i++) {
					rects = rects.concat(this.getRects(DOM.childNodes[i]));
				}
			}

			return rects;
		}

		// Check this text node
		var range = document.createRange();
		range.selectNode(DOM);
		var clientRects = range.getClientRects();

		for (var index = 0; index < clientRects.length; index++) {
			var rect = clientRects[index];
			rects.push(rect);
		}

		return [
			{
				DOM: DOM,
				rects: rects
			}
		];
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
			var count = offset;
			for (var index in this.node.childrens) {
				var subNode = this.node.childrens[index];

				var pos = subNode.component.getPosition(count);
				if (pos.DOM) {
					return pos;
				}

				count = pos.offset;
			}
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

	move(cursor, offset) {

		var pos = cursor.startOffset + offset;
		var leftOffset = this.setCursor(cursor, pos);

		// Auto move back when cusor is working at head of content
		if (pos == 0) {
			if (offset < 0)
				return leftOffset - 1;
		}

		return leftOffset;
	}

	setCursor(cursor, offset) {

		if (offset > this.getLength()) {
			cursor.setPosition(this.node, this.getLength());
			return offset - this.getLength();
		} else if (offset < 0) {
			cursor.setPosition(this.node, 0);
			return offset;
		}

		cursor.setPosition(this.node, offset);

		return 0;
	}

}

export default InlineComponent;
