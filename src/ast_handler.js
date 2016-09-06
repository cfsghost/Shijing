
class ASTHandler {

	constructor() {
		this.ast = {
			root: {}
		};
		this.nodes = {};
	}

	setInternalProperty(node, name, value) {
		node[name] = value;

		// set a property which is not enumerable
		Object.defineProperty(node, name, {
			enumerable: false,
			writable: true
		});
	}

	load(ast) {
		this.ast = ast;
		this.ast.root.id = this.generateId();
		this.initializeNodes(this.ast.root);
	}

	generateId() {
		return Math.random().toString().substr(2) + Date.now();
	}

	initializeNodes(node) {

		this.registerNode(node);

		if (!node.childrens)
			return;

		// Initializing dependencies
		var prevNode = null;
		node.childrens.forEach(function(subNode, index) {

			if (!subNode.id)
				subNode.id = this.generateId();

			this.setInternalProperty(subNode, 'parent', node);
			this.setInternalProperty(subNode, 'prevNode', prevNode);

			if (index + 1 < node.childrens.length) {
				this.setInternalProperty(subNode, 'nextNode', node.childrens[index + 1]);
			} else {
				this.setInternalProperty(subNode, 'nextNode', null);
			}

			prevNode = subNode;

			this.initializeNodes(subNode);
		}.bind(this));
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

	getParentNode(node) {
		return node.parent;
	}

	getPrevNode(node) {
		return node.prevNode;
	}

	getNextNode(node) {
		return node.nextNode;
	}

	getFirstNode(node) {

		if (!node.childrens) {
			return node;
		}

		return this.getFirstNode(node.childrens[0]);
	}

	getLastNode(node) {

		if (!node.childrens) {
			return node;
		}

		return this.getLastNode(node.childrens[node.childrens.length - 1]);
	}

	getChildrenNode(node, index) {

		if (!node.childrens)
			return null;
		else if (node.childrens.length <= index)
			return null;

		return node.childrens[index];
	}

	setStyle(node, styles) {
		node.style = Object.assign({}, node.style, styles);
	}

	setProperty(node, propertyName, value) {
		node[propertyName] = value;
	}

	setText(node, value) {

		if (node.text == undefined)
			return;

		node.text = value;
	}

	getTextSets(node, offset) {
		return {
			before: node.text.substr(0, offset),
			after: node.text.substring(offset, node.text.length)
		};
	}

	insert(node, offset, value) {

		// TODO: it should update sub nodes when it's not pure text
		if (node.text == undefined)
			return;

		//console.log(offset + 1, node.text.length);
		//console.log(node.text.substr(0, offset + 1), node.text.substring(offset, node.text.length));

		node.text = [
			node.text.substr(0, offset),
			value,
			node.text.substring(offset, node.text.length)
		].join('');
	}

	indexOf(node, target) {

		return node.childrens.indexOf(target);
	}

	getIndex(node) {
		var parentNode = this.getParentNode(node);

		if (!parentNode)
			return -1;
		else if (!parentNode.childrens)
			return -1;

		return parentNode.childrens.indexOf(node);
	}

	merge(target, node) {

		// Move text to children
		if (!target.childrens) {
			target.childrens = [];

			if (target.text) {
				target.childrens = [
					{
						type: 'inline',
						text: target.text
					}
				];

				delete target.text;
			}
		}

		// combine node's childrens
		if (node.childrens) {
			target.childrens = target.childrens.concat(node.childrens);
		} else if (node.text) {
			target.childrens = target.childrens.concat([
				{
					type: 'inline',
					text: node.text
				}
			]);
		}

		this.initializeNodes(target);

		// Update linked list
		var nextNode = this.getNextNode(node);
		target.nextNode = nextNode;
		if (nextNode) {
			nextNode.prevNode = target;
		}

		// remove old node
		var parentNode = this.getParentNode(node);
		var index = parentNode.childrens.indexOf(node);
		if (index != -1) {
			parentNode.childrens.splice(index, 1);
		}
	}

	compareNodes(node1, node2) {

		if (node1.type != node2.type) {
			return false;
		}

		if ((node1.style && !node2.style) || (!node1.style && node2.style)) {
			return false;
		}

		for (var key in node1.style) {
			if (node1.style[key] != node2.style[key])
				return false
		}

		return true;
	}

	removeNode(node, quick) {
		var parentNode = this.getParentNode(node);
		
		// No need to deal with previous and next node, just remove all of sub nodes
		if (!quick) {
			var prevNode = this.getPrevNode(node);
			var nextNode = this.getNextNode(node);

			// Update linked list
			prevNode.nextNode = nextNode;
			if (nextNode) {
				nextNode.prevNode = prevNode;
			}
		}

		// Remove from parent's childrens list
		var index = parentNode.childrens.indexOf(node);
		if (index != -1) {
			parentNode.childrens.splice(index, 1);
		}

		if (node.childrens) {
			node.childrens.forEach(function(subNode) {
				this.removeNode(subNode, true);
			}.bind(this));
		}

		this.unregisterNode(node);
	}
}

export default ASTHandler;
