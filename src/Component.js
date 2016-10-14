import events from 'events';
import treeOperator from './TreeOperator';

class Component extends events.EventEmitter {

	constructor(renderer, node, subComponents) {
		super();

		this.blockType = true;
		this.ctx = renderer.ctx;
		this.renderer = renderer;
		this.node = node;
		this.dom = null;
		this.subComponents = null;
		this.allowedCursor = true;

		if (subComponents) {
			this.updateSubComponents(subComponents);
		}
	}

	async componentDidMount() {

		if (!this.subComponents)
			return;

		var refresh = false;
		for (var index in this.subComponents) {
			var component = this.subComponents[index];

			if (await component.componentDidMount())
				refresh = true;
		}

		return refresh;
	}

	onBlur() {

		return new Promise(function(resolve) {
/*
			// Remove itself if it's empty
			var killself = false;
			if (!this.node.text && !this.node.childrens) {
				killself = true;
			} else if (this.node.childrens instanceof Array) {
				if (this.node.childrens.length) {
					killself = true;
				}
			}

			if (killself) {

				// remove node then update
				treeOperator.removeNode(this.node);

				// Update it
				var task = treeOperator.getParentNode(this.node).component.refresh();
				task.then(function() {
					resolve();
				});

				return;
			}
*/
			this.emit('blur');
		}.bind(this));
	}

	onFocus() {
	}

	getLength() {
		if (this.node.text)
			return this.node.text.length;
		else if (this.node.childrens)
			return this.node.childrens.length;

		return -1;
	}

	getDOM(index) {

		if (this.dom instanceof Array) {
			return this.dom[index || 0];
		}

		return this.dom;
	}

	getDOMs() {
		if (this.dom instanceof Array) {
			return this.dom
		}

		return [ this.dom ];
	}

	getRects() {

		if (this.subComponents.length) {
			var sets = this.subComponents.map(function(component) {
				return component.getRects();
			});

			return Array.prototype.concat.apply([], sets);
		}

		return [];
	}

	getOffset(DOM, targetOffset) {

		// if component cross over multiple doms
		if (this.dom instanceof Array) {
			var targetDOM = DOM;
			if (targetDOM.nodeType == Node.TEXT_NODE)
				targetDOM = targetDOM.parentNode;

			// Figure out the correct offset
			var offset = 0;
			for (var index in this.dom) {
				var dom = this.dom[index];

				if (targetDOM == dom) {
					break;
				}

				if (dom.nodeType == Node.TEXT_NODE) {
					offset += dom.length;
				} else {
					offset += dom.childNodes[0].length;
				}
			}

			return offset + targetOffset;
		}

		return targetOffset;
	}

	getParentComponent() {

		var parentNode = treeOperator.getParentNode(this.node);

		if (parentNode)
			return parentNode.component;

		return null;
	}

	findBlockParent(includeSelf) {

		if (includeSelf) {
			if (this.blockType) {
				return this;
			}
		}
		
		var parentNode = this.node.parent;
		if (parentNode.component.blockType)
			return parentNode.component;

		return parentNode.component.findBlockParent();
	}

	update() {

		return new Promise((resolve) => {

			// old DOM
			var old = this.dom;

			// Re-render this this
			var renderTask = this.renderer.renderComponent(this);
			renderTask.then(async () => {

				// Replace old DOM with new DOM
				$(old).replaceWith(this.dom);

				// Notice sub-components that is ready to go
				await this.componentDidMount();

				resolve();

			});

		});
	}

	remove() {
		$(this.dom).remove();
	}

	merge(target, component) {

		if (this.subComponents.indexOf(target) == -1 ||
			this.subComponents.indexOf(component) == -1)
			return Promise.all([]);

		// Getting the node which is the point where two parts combined
		var lastNode = treeOperator.getLastNode(target.node);

		// Merge AST
		treeOperator.merge(target.node, component.node);

		// done everything so we update parent component now
		var parentComponent = this.findBlockParent(true);
		return new Promise(function(resolve) {

			var task = parentComponent.node.component.refresh();
			task.then(function() {

				resolve({
					newNode: target.node,
					pointNode: lastNode
				});
			});
		});
	}

	mergePrevComponent() {

		var prevComponent = this.getPrevComponent();
		if (prevComponent) {

			// Telling parent component to merge us
			var parentNode = treeOperator.getParentNode(this.node);
			return parentNode.component.merge(prevComponent, this);
		}

		// No previous component, we need to go to parent level
		var parentNode = treeOperator.getParentNode(this.node);
		return parentNode.component.mergePrevComponent();
	}

	updateSubComponents(subComponents) {
		
		// remove listener from sub-components
		for (var index in this.subComponents) {
			var component = this.subComponents[index];

			component.remove();
		}

		if (!subComponents) {
			this.subComponents = [];
			return;
		}

		this.subComponents = subComponents;
	}

	getCaret(offset) {

		// Getting correct position
		var pos = this.getPosition(offset);
		var point = this.ctx.Misc.figurePosition(pos.DOM, pos.offset, this.ctx.$overlay[0]);

		point.style = {
			background: 'red',
			width: '2px',
			height: '15px'
		};

		return point;
	}

	setCursor(cursor, offset) {

		if (offset > this.getLength()) {
			cursor.setPosition(this.node, this.getLength());
			return offset - this.getLength();
		} else if (offset < 0) {
			cursor.setPosition(this.node, 0);
			return offset;
		}

		cursor.setPosition(this.node, offset);

		return 0;
	}

	adjustCursorPosition(cursor, direction) {
	}

	updateSelection() {
	}

	refresh() {

		if (!this.blockType) {
			return this.findBlockParent().refresh();
		}
//console.log('REFRESH', this.node);
//		var err = new Error();
//		console.log(err);
		return new Promise((resolve, reject) => {

			// Re-render childrens
			this.renderer
				.renderNodes(this.node, this.node.childrens)
				.then((subComponents) => {
					this.updateSubComponents(subComponents);
					this.update().then(resolve);
				})
				.catch(reject);
		});
	}

	render() {
		return Promise.all([]);
	}
}

export default Component;
