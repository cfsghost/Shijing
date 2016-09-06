import InlineComponent from '../InlineComponent';

export default class Inline extends InlineComponent {

	getLength(offset) {
		return offset ? offset : this.node.text.length;
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
