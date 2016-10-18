
class TreeOperator {

	setInternalProperty(node, name, value) {
		node[name] = value;

		// set a property which is not enumerable
		Object.defineProperty(node, name, {
			enumerable: false,
			writable: true
		});
	}

	generateId() {
		return Math.random().toString().substr(2) + Date.now();
	}

	_clone(node) {

		if (typeof(node) == 'string') {
			return node.slice(0);
		} else if (node instanceof Array) {
			return node.slice(0);
		} else if (typeof(node) == 'number') {
			return node;
		}

		// It's an object
		var newNode = {};
		for (var key in node) {
			newNode[key] = this._clone(node[key]);
		}

		return newNode;
	}

	clone(node) {

		var newNode = this._clone(node);

		// Copy hidden properties
		this.setInternalProperty(newNode, 'parent', node.parent);
		this.setInternalProperty(newNode, 'prevNode', node.prevNode);
		this.setInternalProperty(newNode, 'nextNode', node.nextNode);

		return newNode;
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
		else if (node.childrens.length <= index || index < 0)
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

	replaceNode(oldNode, newNode) {

		var parentNode = this.getParentNode(oldNode);
		var index = this.getIndex(oldNode);

		parentNode.childrens.splice(index, 1, newNode);
	}

	getPathSet(node) {

		if (!node)
			return [];

		var pathSet = [];
		var parentNode = this.getParentNode(node);
		while(parentNode) {
			pathSet.unshift(parentNode);
			parentNode = this.getParentNode(parentNode);
		}

		// Put itself
		pathSet.push(node);

		return pathSet;
	}

	getAncestorNode(a, b) {

		if (!a && !b) {
			return null;
		} else if (a && !b) {
			return a;
		} else if (!a && b) {
			return b;
		}

		var aNode = this.getPathSet(a);
		var bNode = this.getPathSet(b);

		var index = 0;
		while(aNode[index] == bNode[index]) {

			index++;

			if (index < aNode.length && index < bNode.length)
				continue;
			
			break;
		}

		return aNode[index - 1];
	}

	compareNodeBoundary(a, b) {

		var aNode = this.getPathSet(a);
		var bNode = this.getPathSet(b);

		var index = 0;
		while(aNode[index] == bNode[index]) {

			index++;

			if (index < aNode.length && index < bNode.length)
				continue;
			
			break;
		}

		var ancestor = aNode[index - 1];

		if (ancestor.childrens) {

			if (!aNode[index] && !bNode[index]) {
				return 0;
			} else if (!aNode[index]) {
				return 1;
			} else if (!bNode[index]) {
				return -1;
			}

			var aIndex = ancestor.childrens.indexOf(aNode[index]);
			var bIndex = ancestor.childrens.indexOf(bNode[index]);
			if (aIndex < bIndex) {
				return 1;
			} else {
				return -1;
			}
		}

		return 0;
	}

	compareBoundary(a, aOffset, b, bOffset) {

		if (a == b && aOffset == bOffset)
			return 0;

		var compare = this.compareNodeBoundary(a, b);
		if (compare == 0) {

			// Compare with offset
			if (aOffset < bOffset) {
				return 1;
			} else {
				return -1;
			}

		}
		
		return compare;
	}

	insertNode(target, offset, node) {

		if (offset == 0) {
			this.setInternalProperty(node, 'prevNode', null);
		} else {
			this.setInternalProperty(node, 'prevNode', target.childrens[offset - 1]);
			this.setInternalProperty(target.childrens[offset - 1], 'nextNode', node);
		}

		if (offset == target.childrens.length) {
			this.setInternalProperty(node, 'nextNode', null);
		} else {
			this.setInternalProperty(node, 'nextNode', target.childrens[offset]);
			this.setInternalProperty(target.childrens[offset], 'prevNode', node);
		}

		// Insert now
		target.childrens.splice(offset, 0, node);
	}

	replace(startNode, startOffset, endNode, endOffset, value) {
		startNode.text = [
			startNode.text.substr(0, startOffset),
			value,
			startNode.text.substring(endOffset, startNode.text.length)
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

	traverse(startNode, endNode, cb) {

		if (!startNode)
			return true;

		cb(startNode);

		// Traverse childrens
		if (startNode.childrens) {
			for (var index in startNode.childrens) {
				var node = startNode.childrens[index];

				if (this.traverse(node, endNode, cb))
					return true;
			}
		}

		if (startNode == endNode) {
			return true;
		}

		// Process next node
		var nextNode = this.getNextNode(startNode);
		while(nextNode) {

			if (this.traverse(nextNode, endNode, cb))
				return true;

			nextNode = this.getNextNode(startNode);
		}

		// It's in the end of this level, go to parent level to continue
		var parentNode = this.getParentNode(startNode);
		nextNode = this.getNextNode(parentNode);

		return this.traverse(nextNode, endNode, cb);
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

	intersectsNode(containerNode, node) {

		if (containerNode == node)
			return true;

		var parentNode = this.getParentNode(node);
		if (!parentNode)
			return false;

		return this.intersectsNode(containerNode, parentNode);
	}

	findParentNode(node, compare) {

		if (!node)
			return null;

		if (compare(node))
			return node;

		return this.findParentNode(node.parent, compare);
	}

	_split(node, offset) {

		if (node.childrens.length <= offset || offset < 0) {
			return null;
		}

		// Clone a new node
		var newNode = this.clone(node);
		newNode.id = this.generateId();

		// Split childrens
		node.childrens = node.childrens.slice(0, offset);
		newNode.childrens = newNode.childrens.slice(offset, newNode.childrens.length);

		// Update parent and relationship of child nodes
		node.childrens[node.childrens.length - 1].nextNode = null;
		newNode.childrens[0].prevNode = null;
		newNode.childrens.forEach((childNode) => {
			// Change parent
			this.setInternalProperty(childNode, 'parent', newNode);
		});

		// Add new node
		var index = this.getIndex(node);
		var parentNode = this.getParentNode(node);
		this.insertNode(parentNode, index + 1, newNode);

		return newNode;
	}

	split() {

		var node = arguments[0];
		var boundaryNode = undefined;
		var boundaryOffset = undefined;

		if (arguments.length == 2) {
			boundaryOffset = arguments[1];
		} else if (node == boundaryNode) {
			boundaryOffset = arguments[1];
		} else {
			boundaryNode = arguments[1];
			boundaryOffset = arguments[2];
		}

		var newNode;
		if (!boundaryNode) {
			newNode = this._split(node, boundaryOffset);
		} else {
			newNode = this._split(boudaryNode, boundaryOffset);

			var offset = this.getIndex(newNode);
			if (offset > 0) {
				var parentNode = this.getParentNode(newNode);

				return this.split(parentNode, offset);
			}
		}

		return newNode;
	}
}

export default new TreeOperator;
