import treeOperator from './TreeOperator';

class DocumentTree {

	constructor() {
		this.ast = {
			root: {}
		};
		this.nodes = {};
	}

	load(ast) {
		this.ast = ast;
		this.ast.root.id = treeOperator.generateId();
		treeOperator.setInternalProperty(this.ast.root, 'isRoot', true);
		this.initializeNodes(this.ast.root);
	}

	initializeNodes(node) {

		this.registerNode(node);

		if (!node.childrens)
			return;

		// Initializing dependencies
		var prevNode = null;
		node.childrens.forEach((subNode, index) => {

			if (!subNode.id)
				subNode.id = treeOperator.generateId();

			treeOperator.setInternalProperty(subNode, 'parent', node);
			treeOperator.setInternalProperty(subNode, 'prevNode', prevNode);

			if (index + 1 < node.childrens.length) {
				treeOperator.setInternalProperty(subNode, 'nextNode', node.childrens[index + 1]);
			} else {
				treeOperator.setInternalProperty(subNode, 'nextNode', null);
			}

			prevNode = subNode;

			this.initializeNodes(subNode);
		});
	}

	registerNode(node) {
		this.nodes[node.id] = node;
	}

	unregisterNode(node) {
		delete this.nodes[node.id];
	}

	getNodeById(id) {
		return this.nodes[id] || null;
	}

	getRoot() {
		return this.ast.root;
	}
}

export default DocumentTree;
