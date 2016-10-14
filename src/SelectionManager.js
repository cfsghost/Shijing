import treeOperator from './TreeOperator';

class SelectionManager {

	constructor(renderer) {
		this.ctx = renderer.ctx;
		this.selections = [];
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
		var index = this.selections.indexOf(selection);
		if (index != -1) {

			this.removeDOMs(selection);
			selection.update();
		}
	}
}

export default SelectionManager;
