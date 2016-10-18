import InlineComponent from '../InlineComponent';
import treeOperator from '../TreeOperator';

export default class Inline extends InlineComponent {

	getLength(offset) {
		return offset ? offset : this.node.text.length;
	}

	split(offset, targetNode) {

		if (this.node.text.length <= offset || offset < 0) {
			return null;
		}

		// Clone a new node
		var newNode = treeOperator.clone(this.node);
		newNode.id = treeOperator.generateId();
		this.ctx.documentTree.registerNode(newNode);

		// Split childrens
		this.node.text = this.node.text.slice(0, offset);
		newNode.text = newNode.text.slice(offset, newNode.text.length);

		// Add new node
		var index = treeOperator.getIndex(this.node);
		var parentNode = treeOperator.getParentNode(this.node);
		treeOperator.insertNode(parentNode, index + 1, newNode);

		return parentNode.component.split(index + 1, targetNode);
	}

	insertText(offset, text) {
		this.node.text = [
			this.node.text.substr(0, offset),
			text,
			this.node.text.substring(offset, this.node.text.length)
		].join('');
	}

	render() {

		return new Promise((resolve) => {

			var node = this.node;
			var text = this.node.text || '';
			var defStyle = {
				whiteSpace: 'pre-wrap',
				wordBreak: 'break-all'
			};

			var $DOM = $('<span>')
				.addClass('inline-component')
				.html(text.replace(/ /g, '&nbsp'))
				.css(node.style ? Object.assign(defStyle, node.style) : defStyle);

			this.dom = $DOM[0];

			resolve();
		});
	}
}
