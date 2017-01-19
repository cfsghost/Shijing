import treeOperator from '../TreeOperator';

export default {
	'ADD_STYLES': async function(action) {
		var payload = action.payload;

		var targetNodes = {};
		payload.ranges.forEach((range) => {

			var startNode = this.ctx.documentTree.getNodeById(range.startNode);
			if (!startNode)
				return;

			var endNode = this.ctx.documentTree.getNodeById(range.endNode);
			if (!endNode)
				return;

			var nodes = {};
			treeOperator.traverse(startNode, endNode, (node) => {

				// Filtering node which is zero length
				if (startNode == node) {

					var len = startNode.component.getLength();
					if (range.startOffset == len) {
						return;
					}
				}

				// Filtering node which is zero length
				if (endNode == node) {

					if (range.endOffset == 0) {
						return;
					}
				}

				// We only deal with node which is text type
				if (!node.text)
					return;

				nodes[node.id] = node;

				console.log('TRAVERSE', node);
			});

			for (var id in nodes) {
				var node = nodes[id];

				if (node == startNode && node == endNode) {
					var newNode = node.component.split(range.startOffset);

					// Generate ID for new Node
					newNode.id = treeOperator.generateId();

					this.ctx.documentTree.registerNode(newNode);

					targetNodes[newNode.id] = newNode;

					continue;
				} else if (node == startNode) {
					var newNode = node.component.split(range.startOffset);

					// Generate ID for new Node
					newNode.id = treeOperator.generateId();

					this.ctx.documentTree.registerNode(newNode);

					targetNodes[newNode.id] = newNode;
				} else if (node == endNode) {
					var newNode = node.component.split(range.startOffset);

					// Generate ID for new Node
					newNode.id = treeOperator.generateId();

					this.ctx.documentTree.registerNode(newNode);
				}

				targetNodes[node.id] = node;
			}

		});

		for (var id in targetNodes) {
			var node = targetNodes[id];

			if (!node.style)
				node.style = {};

			node.style = Object.assign(node.style, payload.styles);
		}
console.log(targetNodes);
		// Refresh component
		await this.ctx.documentTree.getRoot().component.refresh();
		//await treeOperator.getParentNode(newNode).component.refresh();
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
