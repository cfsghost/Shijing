class Inline {

	constructor(rootComponent, offscreen) {
		this.rootComponent = rootComponent;
		this.rootDOM = null
		this.range = document.createRange();
		this.checkRange = document.createRange();
		this.lineStates = [];
		this.lineMap = [];
		this.lineViews = [];
		this.offscreen = offscreen;
	}

	grabLines(DOM) {

		this.rootDOM = DOM;

		// Clear
		this.lineStates = [];

		console.time('grabLines');

		// Getting rects from components
		var rects = this.rootComponent.getRects();

		rects.forEach(function(rectSet) {
			this._figureLineStates(rectSet.DOM, rectSet.rects);
		}.bind(this));

		this._grabLines();
		this._packLineViews();

		var x = console.timeEnd('grabLines');

		return this.lineViews;
	}

	_packLineView(range) {

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
			.addClass('shiji-lineview')
			.css({
					background: '#cceeff',
	//				borderBottom: '1px solid black'
			});

		$lineView.append(lineContent);

		this.lineViews.push($lineView);
	}

	_packLineViews() {

		for (var index in this.lineMap) {
			var range = this.lineMap[index];

			this._packLineView(range);
			
			// No need this range anymore
			range.detach();
		}

		this.lineMap = [];
	}

	_figureLineStates(DOM, rects) {

		for (var index = 0; index < rects.length; index++) {
			var rect = rects[index];

			var existed = false;
			if (this.lineStates.length) {
				var state = this.lineStates[this.lineStates.length - 1];

				// The same line
				if ((rect.top >= state.rect.top && rect.top < state.rect.bottom) ||
					(rect.bottom >= state.rect.top && rect.bottom <= state.rect.bottom)) {

					if (rect.bottom > state.rect.bottom)
						state.rect.bottom = rect.bottom;

					state.rect.right = rect.right;
					existed = true;
				}
			}

			if (!existed) {
				this.lineStates.push({
					DOM: DOM,
					rect: {
						top: rect.top,
						bottom: rect.bottom,
						left: rect.left,
						right: rect.right
					}
				});
			}
		}

	}

	_grabLines() {

		if (!this.lineStates.length)
			return;

		// Resize offscreen to fit content
		this.offscreen.setHeight(this.lineStates[0].rect.top + this.lineStates[this.lineStates.length - 1].rect.bottom + 100);

		// Set start point
		if (this.rootDOM == this.lineStates[0].DOM.parentNode) {
			this.range.setStart(this.lineStates[0].DOM, 0);
		} else {
			this.range.selectNode(this.lineStates[0].DOM.parentNode);
		}

		var doc = this.offscreen.getDocument();
		for (var index = 0; index < this.lineStates.length; index++) {

			var state = this.lineStates[index];
			var DOM = state.DOM;
			var line = state.rect;

			// Getting position of head of next line
			var range = doc.caretRangeFromPoint(line.left, line.bottom);
			if (!range) {
				continue;
			}
			range.collapse(true);

			// If we want to keep style of last line, we should grab which includes it's parent node
			if (index + 1 == this.lineStates.length) {

				if (this.rootDOM == range.startContainer.parentNode) {
					this.range.setEnd(range.startContainer, range.startOffset);
				} else {
					this.range.setEndAfter(range.startContainer.parentNode);
				}
			} else {
				this.range.setEnd(range.startContainer, range.startOffset);
			}

			this.lineMap.push(this.range.cloneRange());

			// This position is head of new line
			this.range.setStart(range.startContainer, range.startOffset);

			// We want to ignore empty start container
			if (this.range.startOffset == this.range.startContainer.length) {
				this.range.setStartAfter(this.range.startContainer.parentNode);
			}

			range.detach();
		}
	}

	// Performance is really bad
	newGrabLines(DOM) {

		// Getting size of DOMs
		this.checkRange.selectNode(DOM);
		var rects = this.checkRange.getClientRects();

		// Getting line width
		var lineWidth = this.offscreen.getWidth();

		// Getting content width then updating offscreen size
		var contentSize = rects[rects.length - 1].right;
		this.offscreen.setWidth(contentSize);

		// Empty
		if (!DOM.childNodes)
			return [];

		console.time('grabLines');

		// Grabs lines
		this.range.setStart(DOM.childNodes[0], 0);
		var doc = this.offscreen.getDocument();
		for (var width = lineWidth - 1; width < contentSize; width += lineWidth) {

			var range = doc.caretRangeFromPoint(width, 5);
			range.collapse(true);

			this.range.setEnd(range.startContainer, range.startOffset);
			this.lineMap.push(this.range.cloneRange());
			this.range.setStart(range.startContainer, range.startOffset);

			range.detach();
		}

		var x = console.timeEnd('grabLines');

		if (width > contentSize) {
			if (DOM.childNodes.length) {
				var lastNode = DOM.childNodes[DOM.childNodes.length - 1];
				this.range.setEndAfter(lastNode);
				this.lineMap.push(this.range.cloneRange());
			}
		}

		this._packLineViews();
		
		return this.lineViews;
	}	
}

export default Inline;
