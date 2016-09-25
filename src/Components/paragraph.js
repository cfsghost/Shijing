import treeOperator from '../TreeOperator';
import BlockComponent from '../BlockComponent';
import InlineLayout from '../Layouts/inline';

export default class Paragraph extends BlockComponent {

	constructor(renderer, node, subComponents) {
		super(renderer, node, subComponents);

		this.lineViews = [];
		this.style = {};
	}

	async componentDidMount() {
		var refresh = await super.componentDidMount();

		if (refresh)
			await this.refresh();
	}

	getOffset(DOM, targetOffset) {

		var range = document.createRange();
		range.selectNode(DOM);

		// If this medthod was called, that means text node only in this component
		var offset = targetOffset;

		// Finding line view which contains range
		for (var index in this.lineViews) {
			var lineView = this.lineViews[index][0];

			if (range.intersectsNode(lineView))
				break;

			// Count length of text node before line view which contains range
			offset += lineView.childNodes[0].length;
		}

		return offset;
	}

	updateDOMs() {

		// sync dom of all components because original dom might be splited by inline layout
		this.subComponents.forEach(function(component) {

			var doms = [];
			for (var index in this.lineViews) {
				var lineView = this.lineViews[index];
				var dom = $(lineView).find('[shijingref=' + component.node.id + ']').first();

				if (dom.length) {
					doms.push(dom[0]);
				} else if (doms.length > 0 && !dom.length) {
					// Not found DOM anymore
					break;
				}
			}

			component.dom = (doms.length > 1) ? doms : doms[0];
		}.bind(this));
	}

	updateSelection() {
		this.renderSelection();
	}

	renderSelection(baseLayer) {
		var cursors = this.renderer.selection;

		cursors.getAllCursors().forEach((cursor) => {

			if (!cursor.startNode || !cursor.endNode)
				return;

console.log('renderSelection');

			var startPoint = null;
			var endPoint = null;
/*
			var lineViews = [];

			// Filter all of node which is in our node
			for (var index in cursor.nodeList) {
				var node = cursor.nodeList[index];

				if (treeOperator.intersectsNode(this.node, node)) {
					var pos = cursor.startNode.component.getPosition(cursor.startOffset);
					startPoint = this.ctx.Misc.figurePosition(pos.DOM, pos.offset, null);
				}

			}
*/
			// if start node is in this node of component
			if (treeOperator.intersectsNode(this.node, cursor.startNode)) {
				var pos = cursor.startNode.component.getPosition(cursor.startOffset);
				startPoint = this.ctx.Misc.figurePosition(pos.DOM, pos.offset, null);

//				startPoint = cursor.startNode.component.getCaret(cursor.startOffset);
			}

			if (treeOperator.intersectsNode(this.node, cursor.endNode)) {
				var pos = cursor.endNode.component.getPosition(cursor.endOffset);
				endPoint = this.ctx.Misc.figurePosition(pos.DOM, pos.offset, null);
				//endPoint = cursor.endNode.component.getCaret(cursor.endOffset);
			}

			var startLineView = null;
			var endLineView = null;

			if (startPoint) {
				startLineView = this.ctx.Misc.getLineView(cursor.startNode, cursor.startOffset);
			}

			if (endPoint) {
				endLineView = this.ctx.Misc.getLineView(cursor.endNode, cursor.endOffset);
			}

			// start and end point are in the same line view
			if (startLineView.lineView == endLineView.lineView) {
				var $lineView = $(startLineView.lineView);
				var $selection = $('<div>')
					.css({
						position: 'absolute',
						top: 0,
						left: startPoint.x,
						background: '#aabbff',
						width: endPoint.x - startPoint.x,
						height: $lineView.height()
					})
					.prependTo($lineView);
			} else {

				// Apply first of line view
				var $lineView = $(startLineView.lineView);
				var $selection = $('<div>')
					.css({
						position: 'absolute',
						top: 0,
						left: startPoint.x,
						background: '#aabbff',
						width: $lineView.width() - startPoint.x,
						height: $lineView.height()
					})
					.prependTo($lineView);


				// Deal with rest of line views
				var index = this.lineViews.indexOf(startLineView.lineView);
				console.log('XXXXX', startLineView, index);
				for (index++; index < this.lineViews.length; index++) {
					var lineView = this.lineViews[index];

					if (lineView == endLineView.lineView) {
						// The end of line view
						var $lineView = $(endLineView.lineView);
						var $selection = $('<div>')
							.css({
								position: 'absolute',
								top: 0,
								left: 0,
								background: '#aabbff',
								width: endPoint.x,
								height: $lineView.height()
							})
							.prependTo($lineView);

						break;
					}

					var $lineView = $(lineView);
					var $selection = $('<div>')
						.css({
							position: 'absolute',
							top: 0,
							left: 0,
							background: '#aabbff',
							width: $lineView.width(),
							height: $lineView.height()
						})
						.prependTo($lineView);
				}

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
	}

	layout($DOM) {

		var offscreen = this.renderer.offscreen;

		return new Promise(function(resolve) {

			// Split by line by using offscreen
			var renderTask = offscreen.render($DOM);
			renderTask.then(function() {

				// Initializing offscreen
				offscreen.getContent()
					.css({
						whiteSpace: 'pre-wrap',
						wordBreak: 'break-all'
					});
				offscreen.resize(this.style.width, this.style.height);
console.log('LAYOUTTTTTTTTTTTT');
				// Apply inline layout, then we can get a lots of line views
				var layout = new InlineLayout(this, offscreen);
				try {
					this.lineViews = layout.grabLines($DOM[0]);
				} catch(e) {
					console.log(e);
					console.log($DOM);
				}

				// DOMs might be splited into multiple new DOMs by inline layout process, we need
				// to update these DOMs to its component object.
				this.updateDOMs();
//return resolve();
				// Clear all then re-append lines
				$DOM
					.empty()
					.append(this.lineViews);

				// To check all cursors to draw selection.
				this.renderSelection(offscreen.$dom[0]);
				
				// Clear offscreen buffer
				offscreen.empty();

				resolve();

			}.bind(this));

		}.bind(this));
	}

	render() {
		
		// Figuring style
		var style = this.style = Object.assign({}, this.node.parent ? {
			width: this.node.parent.style.width
		} : {}, this.node.style || {});

		var text = this.node.text || '';

		// Create DOM
		var $DOM = $('<div>')
			.addClass('shijing-paragraph')
			.html(text.replace(/ /g, '&nbsp'))
			.css(style);
		
		this.dom = $DOM[0];

		if (this.subComponents)
			this.renderer.appendComponents(this, this.subComponents);

		return this.layout($DOM);
	}
}
