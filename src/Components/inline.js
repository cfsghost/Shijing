import Component from '../Component';

export default class Inline extends Component {

	constructor(renderer, node, subComponents) {
		super(renderer, node, subComponents);

		this.blockType = false;
	}

	render() {

		return new Promise(function(resolve) {

			var node = this.node;
			var text = this.node.text || '';

			var $DOM = $('<span>')
				.addClass('inline-component')
				.html(text.replace(/ /g, '&nbsp'))
				.css(node.style || {});

			this.dom = $DOM[0];

			resolve();
		}.bind(this));
	}
}
