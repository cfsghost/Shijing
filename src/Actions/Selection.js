import treeOperator from '../TreeOperator';
import Selection from '../Selection';
import Cursor from '../cursor';

export default {
	'UPDATE_CURRENT_USER': async function(action) {
		var input = this.ctx.inputs.getInput();

		input.id = payload.id;
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

		if (!payload.cursors || !payload.targetId)
			return;

		var renderer = this.ctx.renderer;

		var selection = renderer.Selection.getSelectionById(payload.targetId);
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
