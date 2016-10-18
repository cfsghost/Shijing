import treeOperator from '../TreeOperator';
import Cursor from '../cursor';

export default {
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
	'INSERT_TEXT': async function(action) {
		var payload = action.payload;

		var startNode = this.ctx.documentTree.getNodeById(payload.startNode);
		if (!startNode)
			return;

		if (payload.endNode) {
			console.log(payload);
			var endNode = this.ctx.documentTree.getNodeById(payload.endNode);
			treeOperator.replace(startNode, payload.startOffset, endNode, payload.endOffset, payload.data);
		} else {
			if (startNode.component.insertText) {
				startNode.component.insertText(payload.startOffset, payload.data);
//				treeOperator.insert(startNode, payload.startOffset, payload.data);
			}
		}

		// done everything so we update now
		await startNode.component.refresh();
	},
	'SPLIT_NODE': async function(action) {

		var payload = action.payload;

		if (payload.node == payload.boundaryNode) {
			boundaryNode.component.split(payload.boundaryOffset);

			await startNode.component.refresh();

			return;
		}

		var node = this.ctx.documentTree.getNodeById(payload.node);
		if (!node)
			return;

		var boundaryNode = this.ctx.documentTree.getNodeById(payload.boundaryNode);
		if (!boundaryNode)
			return;

		console.log('SPLIT NODE', payload);
		var newNode = boundaryNode.component.split(payload.boundaryOffset, node);

		// Re-generate ID for new Node
		newNode.id = treeOperator.generateId();

		this.ctx.documentTree.registerNode(newNode);

		console.log(this.ctx.documentTree.getRoot());

		// Refresh component
		await treeOperator.getParentNode(newNode).component.refresh();
	}
};
