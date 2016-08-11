import Component from '../Component';

export default class HiddenNode extends Component {

	update() {
		// Clear old DOMs
		$(this.node.dom).empty();

		// Re-render this this
		this.renderer.renderComponent(this);
	}

	render() {

		return new Promise(function(resolve) {

			var node = this.node;
			var subComponents = this.subComponents;

			this.renderer.appendComponents(node, subComponents);

			resolve();

		}.bind(this));
	}
}
