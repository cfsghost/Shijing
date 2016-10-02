export default class LineView {

	constructor(rootDOM) {
		this.rootDOM = rootDOM;
		this.items = [];
	}

	getItems() {
		return this.items;
	}

	getDOMs(id) {
		if (!id)
			return this.getItems();

		var doms = [];
		for (var index in this.items) {
			var line = this.items[index];
			var dom = $(line).find('[shijingref=' + id + ']').first();

			if (dom.length) {
				doms.push(dom[0]);
			} else if (doms.length > 0 && !dom.length) {
				// Not found DOM anymore
				break;
			}
		}

		return doms;
	}

	getLineContent(index) {
		return this.items[index].children('.shijing-lineview-content')[0];
	}

	getOffset(DOM) {

		var range = document.createRange();
		range.selectNode(DOM);

		var offset = 0;

		// Finding line view which contains range
		for (var index in this.items) {
			var line = this.getLineContent(index);

			if (range.intersectsNode(line))
				break;

			// Count length of text node before line view which contains range
			offset += line.childNodes[0].length;
		}

		return offset;
	}

	addRange(range) {

		var lineContent;
		if (range.startContainer.parentNode != this.rootDOM &&
			range.startContainer == range.endContainer) {
			// If it's the line which in the end of lines

			// Clone container
			var newContainer = range.startContainer.parentNode.cloneNode(false);

			// append content
			var content = range.cloneContents();
			$(newContainer).append(content);

			lineContent = newContainer;
		} else {
			lineContent = range.cloneContents();
		}

		// Create line view to store a line data
		var $lineView = $('<div>')
			.addClass('shijing-lineview')
			.css({
//					background: '#cceeff',
	//				borderBottom: '1px solid black'
			});

		var $lineContent = $('<div>')
			.addClass('shijing-lineview-content')
			.append(lineContent);

		$lineView.append($lineContent);

		this.items.push($lineView);
	}

};
