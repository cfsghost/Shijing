import Renderer from './renderer';
import ActionDispatcher from './action_dispatcher';
import ASTHandler from './ast_handler';
import Actions from './Actions';

require('./css/loader.css');

class Shiji {

	constructor(el) {

		this.actionDispatcher = new ActionDispatcher();
		this.actions = new Actions(this);
		this.astHandler = new ASTHandler();
		this.$origin = $(el);
		this.$container = $('<div>')
			.css({
				position: 'relative'
			});
		this.$workarea = $('<div>')
			.css({
				position: 'relative',
				textAlign: 'initial'
			});

		this.renderer = new Renderer(this);
		
		this.$origin
			.css({
//				overflow: 'hidden',
//				overflowY: 'visible'
			})
			.append(this.$container)
			.append(this.$workarea)

		this.render();
	}

	loadAst(source) {
		this.astHandler.load(source);

		return this.render();
	}

	render() {

		var root = this.astHandler.getRoot();

		// initializing default width to fit container size
		this.astHandler.setStyle(root, {
			width: this.$origin.width()
		});

		return new Promise(function(resolve, reject) {

			this.renderer.render(root)
				.then(async function(rootComponent) {

					this.$workarea.append(rootComponent.dom);

					await rootComponent.componentDidMount();

					resolve();

				}.bind(this))
				.catch(reject);
		}.bind(this));
	}
}

export default Shiji;
