import treeOperator from './TreeOperator';

class Misc {

	constructor(ctx) {
		this.ctx = ctx;
		this.treeOperator = ctx.treeOperator;
	}

	figurePosition(dom, offset, base) {

		var $dom = $(dom);
		var textNode = (dom.childNodes) ? dom.childNodes[0] : null;
		var $container = base ? $(base) : null;

		var baseX = 0;
		var baseY = 0;

		if ($container) {
			baseX = $container.offset().left;
			baseY = $container.offset().top;
		}

		var point = {
			x: 0,
			y: 0,
			height: $dom.height(),
			DOM: dom,
			offset: offset
		};

		// Nothing left in this DOM
		if (!textNode || textNode.nodeType != Node.TEXT_NODE) {
			//point.x = $dom.offset().left - $container.offset().left;
			//point.y = $dom.offset().top - $container.offset().top;
			point.x = $dom.position().left;
			point.y = $dom.position().top;
			point.DOM = dom;
			point.offset = 0;

			return point;
		}
		
		// The end of line
		if (offset >= textNode.length) {

			var range = document.createRange();

			// Last character in a line
			range.setStart(textNode, textNode.length - 1);
			range.setEnd(textNode, textNode.length);

			// Getting rect information then figure out exact position
			var rect = range.getBoundingClientRect();
			range.detach();

			point.x = rect.right - baseX;
			point.y = rect.top - baseY;
			point.DOM = textNode;
			point.offset = textNode.length;

			return point;
		}
		
		// If the last word of line is return character
		if (textNode.nodeValue[offset] == '\n') {

			// empty line
			if (textNode.length == 1) {
				//point.x = $dom.offset().left - $container.offset().left;
				//point.y = $dom.offset().top - $container.offset().top;
				point.x = $dom.position().left;
				point.y = $dom.position().top;
				point.DOM = dom;
				point.offset = 0;

				return point;
			}

			var range = document.createRange();

			range.setStart(textNode, offset - 1);
			range.setEnd(textNode, offset);

			// Getting rect information then figure out exact position
			var rect = range.getBoundingClientRect();
			range.detach();

			point.x = rect.right - baseX;
			point.y = rect.top - baseY;
			point.DOM = dom;
			point.offset = offset;

			return point;
		}

		var range = document.createRange();

		range.setStart(textNode, offset);
		range.setEnd(textNode, offset + 1);

		// Getting rect information then figure out exact position
		var rect = range.getBoundingClientRect();
		range.detach();

		point.x = rect.left - baseX;
		point.y = rect.top - baseY;
		point.DOM = dom;
		point.offset = offset;

		return point;

	}

	findLineViewOwner(node) {

		if (node.component.lineViews) {
			return node;
		}

		var parentNode = treeOperator.getParentNode(node);
		if (parentNode)
			return this.findLineViewOwner(parentNode);
		else
			return null;
	}

	getLineView(targetNode, offset) {

		var node = this.findLineViewOwner(targetNode);
		if (node) {
			// Getting DOM by using startNode and startOffset
			var pos = targetNode.component.getPosition(offset);
			var range = document.createRange();

			// Figure line which contains such DOM
			for (var index in node.component.lineViews) {
				var lineView = node.component.lineViews[index];
				range.selectNode(lineView[0]);

				// Found
				if (range.isPointInRange(pos.DOM)) {
					return {
						arr: node.component.lineViews,
						lineView: lineView,
						index: parseInt(index)
					};
				}
			}
		}

		return null;
	}

	getLineViewByNode(startNode, endNode, cb) {

		if (!startNode)
			return true;

		if (startNode.component.lineViews)
			cb(startNode);

		// Traverse childrens
		if (startNode.childrens) {
			for (var index in startNode.childrens) {
				var node = startNode.childrens[index];

				if (this.getLineViewByNode(node, endNode, cb))
					return true;
			}
		}

		if (startNode == endNode) {
			return true;
		}

		// Process next node
		var nextNode = treeOperator.getNextNode(startNode);
		while(nextNode) {

			if (this.getLineViewByNode(nextNode, endNode, cb))
				return true;

			nextNode = treeOperator.getNextNode(startNode);
		}

		// It's in the end of this level, go to parent level to continue
		var parentNode = treeOperator.getParentNode(startNode);
		nextNode = treeOperator.getNextNode(parentNode);

		return this.getLineViewByNode(nextNode, endNode, cb);
	}

	getLineViews(startNode, startOffset, endNode, endOffset) {
console.log('getLineViews', startNode, endNode);
		this.getLineViewByNode(startNode, endNode, () => {
		});
	}
}

export default Misc;
