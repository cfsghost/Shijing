import treeOperator from '../TreeOperator';
import BlockComponent from '../BlockComponent';
import InlineLayout from '../Layouts/inline';

export default class Paragraph extends BlockComponent {

	constructor(renderer, node, subComponents) {
		super(renderer, node, subComponents);

		this.lineView = null;
		this.style = {};
	}

	async componentDidMount() {
		var refresh = await super.componentDidMount();

		if (refresh)
			await this.refresh();
	}

	getOffset(DOM, targetOffset) {

		return this.lineView.getOffset(DOM) + targetOffset;
	}

	getRects() {

		// It has childrens so we follow original mechanism to get all rects
		if (this.subComponents.length) {
			return super.getRects();
		}

		// there is only text in this paragraph, we get rects from this dom directly
		var rects = [];

		// Check this text node
		var range = document.createRange();
		range.selectNode(this.dom.childNodes[0]);
		var clientRects = range.getClientRects();

		for (var index = 0; index < clientRects.length; index++) {
			var rect = clientRects[index];
			rects.push(rect);
		}

		return [
			{
				DOM: this.dom,
				rects: rects
			}
		];
	}

	updateDOMs() {

		// sync dom of all components because original dom might be splited by inline layout
		this.subComponents.forEach((component) => {
			component.dom = this.lineView.getDOMs(component.node.id);
		});
	}

	updateSelection() {
		this.renderSelection();
	}

	renderSelection() {
		var selections = this.renderer.Selection.getAllSelections();

		selections.forEach((selection) => {
			var cursors = selection.getAllCursors();

			cursors.forEach((cursor) => {

				if (!cursor.startNode || !cursor.endNode)
					return;

				var startPoint = null;
				var endPoint = null;

				// if start node is in this node of component
				if (treeOperator.intersectsNode(this.node, cursor.startNode)) {
					var pos = cursor.startNode.component.getPosition(cursor.startOffset);
					startPoint = this.ctx.Misc.figurePosition(pos.DOM, pos.offset, null);
				}

				if (treeOperator.intersectsNode(this.node, cursor.endNode)) {
					var pos = cursor.endNode.component.getPosition(cursor.endOffset);
					endPoint = this.ctx.Misc.figurePosition(pos.DOM, pos.offset, null);
				}

				// Getting line views
				var startLineView = null;
				var endLineView = null;

				if (startPoint) {
					startLineView = this.ctx.Misc.getLineView(cursor.startNode, cursor.startOffset);
				}

				if (endPoint) {
					endLineView = this.ctx.Misc.getLineView(cursor.endNode, cursor.endOffset);
				}

				var index = 0;

				// start and end point are in the same line view
				if (startPoint) {

					// Only one line view that we need to deal with
					if (endLineView) {
						if (startLineView.lineView == endLineView.lineView) {
							var $lineView = $(startLineView.lineView);
							var $lineViewContent = $lineView.children('.shijing-lineview-content');
							var style = Object.assign(selection.styles, {
								left: startPoint.x
							});

							var $selection = $('<div>')
								.attr('shijingref', selection.id)
								.addClass('shijing-selection')
								.css(style)
								.outerHeight($lineView.outerHeight())
								.outerWidth(endPoint.x - startPoint.x)
								.prependTo($lineView);

							return;
						}
					}

					// The first line view
					var $lineView = $(startLineView.lineView);
					var $lineViewContent = $lineView.children('.shijing-lineview-content');
					var style = Object.assign(selection.styles, {
						left: startPoint.x
					});
					var $selection = $('<div>')
						.attr('shijingref', selection.id)
						.addClass('shijing-selection')
						.css(style)
						.outerHeight($lineViewContent.height())
						.outerWidth($lineView.width() - startPoint.x)
						.prependTo($lineView);

					index = this.lineView.getItems().indexOf(startLineView.lineView) + 1;
				}

				// Deal with rest of line views
				var lines = this.lineView.getItems();
				while(index < lines.length) {
					var line = lines[index];
					var $lineView = $(line);
					var $lineViewContent = $lineView.children('.shijing-lineview-content');

					if (endLineView) {
						if (line == endLineView.lineView) {

							var style = Object.assign(selection.styles, {
								left: 0
							});

							// The end of line view
							var $selection = $('<div>')
								.attr('shijingref', selection.id)
								.addClass('shijing-selection')
								.css(style)
								.outerHeight($lineViewContent.height())
								.outerWidth(endPoint.x)
								.prependTo($lineView);

							break;
						}
					}

					var style = Object.assign(selection.styles, {
						left: 0
					});

					var $selection = $('<div>')
						.attr('shijingref', selection.id)
						.addClass('shijing-selection')
						.css(style)
						.outerHeight($lineViewContent.height())
						.outerWidth($lineViewContent.width())
						.prependTo($lineView);

					index++;
				}

	/*
				this.ctx.Misc.getLineViews(cursor.startNode, cursor.startOffset, cursor.endNode, cursor.endOffset);

				var lineView = this.ctx.Misc.getLineView(cursor.startNode, cursor.startOffset);

				console.log(lineView);

				lineView.lineView.css('background', 'green');
				*/
	/*
				treeOperator.traverse(cursor.startNode, cursor.endNode, function(node) {
					console.log(node);
				});
	*/
	/*
				// Figure out start point
				var offset = cursor.startOffset;
				var node = cursor.startNode;
				var pos = node.component.getPosition(offset);
				var point = this.ctx.Misc.figurePosition(pos.DOM, pos.offset, null);
				console.log('renderSelection', node, point);

				var lineview = cursor.getLineView();
	//			console.log(lineview);
	*/
			});
		});
	}

	layout($DOM) {

		var offscreen = this.renderer.offscreen;

		return new Promise((resolve) => {

			// Split by line by using offscreen
			var renderTask = offscreen.render($DOM);
			renderTask.then(() => {

				// Initializing offscreen
				offscreen.getContent()
					.css({
						whiteSpace: 'pre-wrap',
						wordBreak: 'break-all'
					});
				offscreen.resize(this.style.width, this.style.height);

				// Apply inline layout, then we can get a lots of line views
				var layout = new InlineLayout(this, offscreen);
				try {
					//this.lineViews = layout.grabLines($DOM[0]);
//					console.log('PPPP', this.node);
					this.lineView = layout.grabLines($DOM[0]);
				} catch(e) {
					console.log(e);
					console.log($DOM);
				}

				// DOMs might be splited into multiple new DOMs by inline layout process, we need
				// to update these DOMs to its component object.
				this.updateDOMs();
//return resolve();
//
				var lineDOMs = this.lineView.getDOMs();
				// Clear all then re-append lines
				$DOM
					.empty()
					.append(lineDOMs);
//					.append(this.lineViews);

				// To check all cursors to draw selection.
				this.renderSelection();
				
				// Clear offscreen buffer
				offscreen.empty();

				resolve();

			});

		});
	}

	render() {
		
		// Figuring style
		var style = this.style = Object.assign({}, this.node.parent ? {
			width: this.node.parent.style.width
		} : {}, this.node.style || {});

		// Create DOM
		var $DOM = $('<div>')
			.addClass('shijing-paragraph')
			.css(style);
		
		this.dom = $DOM[0];

		if (this.subComponents)
			this.renderer.appendComponents(this, this.subComponents);

		return this.layout($DOM);
	}
}
