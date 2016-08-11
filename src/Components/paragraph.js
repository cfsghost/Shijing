import Component from '../Component';
import InlineLayout from '../Layouts/inline';

export default class Paragraph extends Component {

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

	getOffset(range) {

		// If this medthod was called, that means text node only in this component
		var offset = range.startOffset;

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

	getPosition(offset) {

		var count = offset;
		for (var index in this.lineViews) {
			var dom = this.lineViews[index][0];
			var textNode = dom.childNodes[0];

			if (textNode.length < count) {
				count -= textNode.length;
			} else {
				return {
					DOM: dom,
					offset: count
				};
			}
		}
	}

	updateDOMs() {

		// sync dom of all components because original dom might be splited by inline layout
		this.subComponents.forEach(function(component) {

			var doms = [];
			for (var index in this.lineViews) {
				var lineView = this.lineViews[index];
				var dom = $(lineView).find('[shijiref=' + component.id + ']').first();

				if (dom.length) {
					doms.push(dom[0]);
				} else if (doms.length > 0 && !dom.length) {
					// Not found DOM anymore
					break;
				}
			}

			component.dom = (doms.length > 0) ? doms : doms[0];
		}.bind(this));
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

				// Apply inline layout
				var layout = new InlineLayout(offscreen);
				try {
					this.lineViews = layout.grabLines($DOM[0]);
				} catch(e) {
					console.log(e);
					console.log($DOM);
				}

				this.updateDOMs();

				// Clear all then re-append lines
				$DOM
					.empty()
					.append(this.lineViews);
				
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
		var $DOM = $('<p>')
			.html(text.replace(/ /g, '&nbsp'))
			.css(style);
		
		this.dom = $DOM[0];

		if (this.subComponents)
			this.renderer.appendComponents(this, this.subComponents);

		return this.layout($DOM);
	}
}
