import Component from '../Component';

export default class HiddenNode extends Component {

	update() {
		// Clear old DOMs
		//$(this.node.dom).empty();
		$(this.dom).empty();

		// Re-render this this
		this.renderer.renderComponent(this);
	}

	render() {

		return new Promise(function(resolve) {

			var node = this.node;
			var subComponents = this.subComponents;

			this.dom = document.createDocumentFragment();

			this.renderer.appendComponents(this, subComponents);

			resolve();

		}.bind(this));
	}
}
