import treeOperator from './TreeOperator';

class SelectionManager {

	constructor(renderer) {
		this.ctx = renderer.ctx;
		this.selections = [];
	}

	getAllSelections() {
		return this.selections;
	}

	addSelection(selection) {
		var index = this.selections.indexOf(selection);
		if (index != -1)
			return;

		this.selections.push(selection);
	}

	removeSelection(selection) {
		var index = this.selections.indexOf(selection);
		if (index != -1)
			this.selections.splice(index, 1);
	}

	update(selection) {
		var index = this.selections.indexOf(selection);
		if (index != -1) {

			// Remove all dom of current selection
			$(this.ctx.$workarea)
				.find('[shijingref=' + selection.id + ']')
				.remove();

			selection.update();
		}
	}
}

export default SelectionManager;
