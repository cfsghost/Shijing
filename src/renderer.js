import treeOperator from './TreeOperator';
import Offscreen from './offscreen';
import Cursor from './cursor';
import SelectionManager from './SelectionManager';
import Components from './Components';
import Input from './input';

class Renderer {

	constructor(context) {
		this.ctx = context;
		this.Components = Components;
		this.Selection = new SelectionManager(this);

		// Initializing offscreen buffer
		this.offscreen = new Offscreen(this);

		// Initializing caret
		this.caret = new Cursor(this);
		this.input = new Input(this);
/*
		this.ctx.on('paperSizeChanged', (width, height) => {
		});
*/
	}

	removeComponent(component) {

		if (!component.subComponents)
			return;

		// Remove all sub-components
		for (var index in component.subComponents) {
			var comp = component.subComponents[index];

			delete this.components[comp.node.id];

			this.removeComponent(comp);
		}
	}

	getComponentByDOM(components, DOM) {
		for (var index in components) {
			var component = components[index];
			if (component.dom == DOM) {
				return component;
			}
		}

		// traverse sub components
		for (var index in components) {
			var component = components[index];

			if (component.subComponents) {
				found = this.getComponentByDOM(component.subComponents, DOM);
				if (found)
					return found;
			}
		}

		return null;
	}

	getParentComponentDOM(dom) {

		if ($(dom).hasClass('shijing-component')) {
			return dom;
		}

		if (dom.parentNode)
			return this.getParentComponentDOM(dom.parentNode);

		return null;
	}

	getOwnerByDOM(dom) {

		function findComponent(dom) {

			var $dom = $(dom);

			// Check whether it is a component
			if ($dom.hasClass('shijing-component')) {
				return dom;
			}

			// It has parent node. just check it
			if (dom.parentNode)
				return findComponent(dom.parentNode);

			return null;
		}

		var DOM = findComponent(dom);
		if (!DOM)
			return null;

		// Getting component ID
		var id = DOM.getAttribute('shijingref');

		// Getting node by using component ID
		var node = this.ctx.documentTree.getNodeById(id);

		return node ? node.component : null;
	}

	getParentComponentByDOM(dom) {
		var DOM = this.getParentComponentDOM(dom);
		if (!DOM)
			return null;

		var id = DOM.getAttribute('shijingref');

		var node = treeOperator.getNodeById(id);

		return node ? node.component : null;
	}

	getChildDOMs(DOM, DOMs) {
		
		DOMs.push(DOM);
		
		if (!DOM.childNodes)
			return;

		for (var i = 0; i < DOM.childNodes.length; i++) {
			this.getChildDOMs(DOM.childNodes[i], DOMs);
		}
	}

	appendComponents(target, components) {

		//var $DOM = $(node.dom);
		var $DOM = $(target.dom);

		// append DOMs of components to specific node's DOM
		if (components) {
			components.forEach(function(component) {
				//$DOM.append(component.node.dom);
				$DOM.append(component.dom);
			});
		}
	}

	setInternalProperty(node, name, value) {
		node[name] = value;

		// set a property which is not enumerable
		Object.defineProperty(node, name, {
			enumerable: false,
			writable: true
		});
	}

	createComponent(node, subComponents) {
		
		return new Promise(function(resolve) {

			var Initializer;

			// Getting initializer
			Initializer = this.Components[node.type || 'hiddenNode'] || null;
			if (!Initializer)
				return resolve(null);
			
			// Create component
			var component = new Initializer(this, node, subComponents);
			this.setInternalProperty(node, 'component', component);

			var task = this.renderComponent(component);
			task.then(function() {

				resolve(component);

			}.bind(this));

		}.bind(this));
	}

	renderComponent(component) {

		return new Promise(function(resolve) {

			var task = component.render();
			task.then(function() {

				$(component.dom)
//				$(component.node.dom)
					.attr('shijingref', component.node.id)
					.addClass('shijing-component');

				resolve();
			});
		});
	}

	renderNodes(parent, nodes) {

		return new Promise(function(resolve) {

			if (!nodes)
				return resolve([]);

			if (!nodes.length)
				return resolve([]);

			var components = [];

			function _render(index) {
				var subNode = nodes[index];
				if (!subNode) {
					resolve(components);
					return;
				}

				this.render(subNode).then(function(component) {
					components.push(component);
					_render.bind(this)(index + 1);
				}.bind(this));
			}

			_render.bind(this)(0);
		}.bind(this));
	}

	render(node) {
	
		return new Promise(function(resolve, reject) {

			// Continue to render childrens
			this.renderNodes(node, node.childrens)
				.then(function(subComponents) {
				
					// Rendering a component then append all sub components to it
					var task = this.createComponent(node, subComponents);
					task
						.then(function(component) {
							if (component) {
								return resolve(component);
							}

							resolve();
						})
						.catch(reject);
				
				}.bind(this))
				.catch(reject);
			
		}.bind(this));
	}
}

export default Renderer;
