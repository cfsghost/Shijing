import BlockComponent from '../BlockComponent';

export default class HiddenNode extends BlockComponent {

	update() {

		return new Promise((resolve) => {

			// Re-render this this
			var renderTask = this.renderer.renderComponent(this);
			renderTask.then(async () => {

				this.emit('update');

				resolve();

			});

		});
	}

	render() {

		return new Promise((resolve) => {

			this.dom = document.createDocumentFragment();

			if (this.subComponents)
				this.renderer.appendComponents(this, this.subComponents);

			resolve();

		});
	}
}
