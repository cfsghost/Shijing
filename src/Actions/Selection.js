import treeOperator from '../TreeOperator';
import Selection from '../Selection';
import Cursor from '../cursor';

export default {
	'UPDATE_CURRENT_USER': async function(action) {
		var input = this.ctx.inputs.getInput();

		input.id = payload.id;
	},
	'SYNC_SELECTIONS': async function(action) {
		var renderer = this.ctx.renderer;
		var selectionMgr = renderer.Selection;
		var payload = action.payload;

		if (!payload.selections)
			return;

		var newSelections = payload.selections;
		var selections = selectionMgr.getAllSelections();

		// Getting all selection which has to be removed
		var removed = [];
		selections.forEach((selection) => {

			for (var index in newSelections) {
				var s = newSelections[index];

				if (selection.id == s.id) {
					return;
				}
			}

			removed.push(selection);
		});
		
		// Remove selection we don't need
		removed.forEach((selection) => {

			var index = selections.indexOf(selection);
			if (index == -1)
				return;

			selections.splice(index, 1);
		});

		// Add or update selection
		for (var id in newSelections) {
			var selection = newSelections[id];

			var isNew = true;
			for (var index in selections) {

				if (selections[index].id == selection.id) {
					// Update selection
					var s = selections[index];
					s.removeAllCursors();
					selection.cursors.forEach((cursor) => {
						s.createCursor(this.ctx, cursor);
					});

					isNew = false;

					break;
				}
			}

			if (isNew) {
				// add a new selection
				selectionMgr.createSelection(selection);
			}
		}

		selectionMgr.update();
	},
	'ADD_SELECTION': async function(action) {
		var renderer = this.ctx.renderer;
		var payload = action.payload;

		var selection = new Selection();
		selection.id = payload.id;

		renderer.Selection.addSelection(selection);
	},
	'SET_SELECTION': async function(action) {
		var payload = action.payload;

		if (!payload.cursors || !payload.id)
			return;

		var renderer = this.ctx.renderer;

		var selection = renderer.Selection.getSelectionById(payload.id);
		if (!selection) {
			// TODO: create new selection
			return;
		}

		// Clear cursors of selection
		selection.removeAllCursors();

		payload.cursors.forEach((cursor) => {

			// Create cursor
			var newCursor = new Cursor(renderer);

			if (cursor.startNode) {
				var startNode = this.ctx.documentTree.getNodeById(cursor.startNode);
				newCursor.setStart(startNode, cursor.startOffset || 0);
			}

			if (cursor.endNode) {
				var endNode = this.ctx.documentTree.getNodeById(cursor.endNode);
				newCursor.setEnd(endNode, cursor.endOffset || 0);
			}

			newCursor.update();
			newCursor.show();

			// Add to selection
			selection.addCursor(newCursor);
		});

		renderer.Selection.update(selection);
	},
};
