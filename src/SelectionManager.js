import treeOperator from './TreeOperator';
import Selection from './Selection';

class SelectionManager {

	constructor(renderer) {
		this.ctx = renderer.ctx;
		this.selections = [];
	}

	createSelection(prototype) {

		var selection = new Selection();
		selection.id = prototype.id;

		prototype.cursors.forEach((cursor) => {

			selection.createCursor(this.ctx, cursor);
		});

		this.addSelection(selection);
	}

	getAllSelections() {
		return this.selections;
	}

	getSelectionById(id) {

		for (var index in this.selections) {
			var selection = this.selections[index];

			if (selection.id == id)
				return selection;
		}

		return null;
	}

	addSelection(selection) {
		var index = this.selections.indexOf(selection);
		if (index != -1)
			return;

		selection.on('added', (cursor) => {
			// Append cursor DOM
			this.ctx.$overlay.append(cursor.$dom);
		});

		// Append cursors of selection to current overlay
		selection.cursors.forEach((cursor) => {
			this.ctx.$overlay.append(cursor.$dom);
		});

		this.selections.push(selection);

	}

	removeSelection(selection) {
		var index = this.selections.indexOf(selection);
		if (index != -1) {
			this.selections.splice(index, 1);
			selection.removeAllListeners('added');
			this.removeDOMs(selection);
		}
	}

	removeDOMs(selection) {

		// Remove all dom of current selection
		$(this.ctx.$workarea)
			.find('[shijingref=' + selection.id + ']')
			.remove();
	}

	update(selection) {

		if (!selection) {
			// update all
			this.selections.forEach((selection) => {
				this.removeDOMs(selection);
				selection.update();
			});

			return;
		}

		var index = this.selections.indexOf(selection);
		if (index != -1) {

			this.removeDOMs(selection);
			selection.update();

			return;
		}

	}
}

export default SelectionManager;
