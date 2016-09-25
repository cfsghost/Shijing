import treeOperator from './TreeOperator';

class Selection {

	constructor() {
		this.cursors = [];
	}

	getAllCursors() {
		return this.cursors;
	}

	addCursor(cursor) {
		var index = this.cursors.indexOf(cursor);
		if (index != -1)
			return;

		cursor.nodeList = [];

		// Getting all nodes
		treeOperator.traverse(cursor.startNode, cursor.endNode, (node) => {
			cursor.nodeList.push(node);
		});

		this.cursors.push(cursor);
	}

	removeCursor(cursor) {
		var index = this.cursors.indexOf(cursor);
		if (index != -1)
			this.cursors.splice(index, 1);
	}

	update() {
		this.cursors.forEach((cursor) => {
			treeOperator.traverse(cursor.startNode, cursor.endNode, function(node) {
				console.log(node);
			});
		});
	}
}

export default Selection;
