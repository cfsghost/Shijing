import events from 'events';

class Component extends events.EventEmitter {

	constructor(renderer, node, subComponents) {
		super();

		this.blockType = true;
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

		var astHandler = this.renderer.shiji.astHandler;

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
				astHandler.removeNode(this.node);

				// Update it
				var task = astHandler.getParentNode(this.node).component.refresh();
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

	getParentComponent() {

		var parentNode = this.renderer.shiji.astHandler.getParentNode(this.node);

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

		return new Promise(function(resolve) {

			// old DOM
			var old = this.dom;

			// Re-render this this
			var renderTask = this.renderer.renderComponent(this);
			renderTask.then(async function() {

				// Replace old DOM with new DOM
				$(old).replaceWith(this.dom);

				// Notice sub-components that is ready to go
				await this.componentDidMount();

				resolve();

			}.bind(this));

		}.bind(this));
	}

	remove() {
		$(this.dom).remove();
	}

	backspace(target, from) {

		var astHandler = this.renderer.shiji.astHandler;

		if (from == 0) {

			// Find previous component for backspace
			var prevComponent = target.getPrevComponent();
			if (prevComponent) {

				// There is nothing left
				if (target.getLength() == 0) {

					// They cannot be merged, going to previous node to delete
					var lastNode = astHandler.getLastNode(prevComponent.node);
					return this.backspace(lastNode.component, lastNode.component.getLength());
				}

				// Compare previous node and current node
				if (!astHandler.compareNodes(prevComponent.node, target.node)) {

					// They cannot be merged, going to previous node to delete
					var lastNode = astHandler.getLastNode(prevComponent.node);
					return this.backspace(lastNode.component, lastNode.component.getLength());
				}

				return new Promise(function(resolve) {

					// Merge previous node and current node
					var task = target.mergePrevComponent();
					task.then(function(ret) {

						resolve({
							component: ret.pointNode.component,
							offset: ret.pointNode.component.getLength()
						});
					});
				});
			}

			// Ask parent to apply backspace
			var parentNode = astHandler.getParentNode(this.node);
			if (!parentNode) {
				return Promise.resolve();
			}

			return parentNode.component.backspace(this, 0);

		}

		return new Promise(function(resolve) {

			// Getting text
			var sets = astHandler.getTextSets(target.node, from);

			// Replace old text with new text
			astHandler.setText(target.node, [
				sets.before.substr(0, from - 1),
				sets.after
			].join(''));

			var task = target.node.component.refresh();
			task.then(function() {
				resolve({
					component: target,
					offset: from - 1
				});
			});
		}.bind(this));
		
	}

	getPrevComponent() {
		var prevNode = this.renderer.shiji.astHandler.getPrevNode(this.node);
		if (prevNode)
			return prevNode.component;

		return null;
	}

	merge(target, component) {

		if (this.subComponents.indexOf(target) == -1 ||
			this.subComponents.indexOf(component) == -1)
			return Promise.all([]);

		var astHandler = this.renderer.shiji.astHandler;

		// Getting the node which is the point where two parts combined
		var lastNode = astHandler.getLastNode(target.node);

		// Merge AST
		astHandler.merge(target.node, component.node);

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

		var astHandler = this.renderer.shiji.astHandler;
		var prevComponent = this.getPrevComponent();
		if (prevComponent) {

			// Telling parent component to merge us
			var parentNode = astHandler.getParentNode(this.node);
			return parentNode.component.merge(prevComponent, this);
		}

		// No previous component, we need to go to parent level
		var parentNode = astHandler.getParentNode(this.node);
		return parentNode.component.mergePrevComponent();
	}

	updateSubComponents(subComponents) {
		
		// remove listener from sub-components
		for (var index in this.subComponents) {
			var component = this.subComponents[index];

			component.remove();

			this.renderer.removeComponent(component);
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

		var point = this.renderer.caret.figureCaretPoint(pos.DOM, pos.offset);

		point.style = {
			background: 'red',
			width: '2px',
			height: '15px'
		};

		return point;
	}

	refresh() {

		if (!this.blockType) {
			return this.findBlockParent().refresh();
		}

		return new Promise(function(resolve, reject) {

			// Re-render childrens
			this.renderer
				.renderNodes(this.node, this.node.childrens)
				.then(function(subComponents) {

					if (subComponents.length != 0 || subComponents.length != 0)
						this.updateSubComponents(subComponents);

					this.update().then(resolve);

				}.bind(this))
				.catch(reject);
		}.bind(this));
	}

	render() {
		return Promise.all([]);
	}
}

export default Component;
