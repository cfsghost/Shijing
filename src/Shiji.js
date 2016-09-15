import Renderer from './renderer';
import ActionDispatcher from './action_dispatcher';
import ASTHandler from './ast_handler';
import Actions from './Actions';

require('./css/main.css');
require('./css/loader.css');

class Shiji {

	constructor(el) {

		this.actionDispatcher = new ActionDispatcher();
		this.actions = new Actions(this);
		this.astHandler = new ASTHandler();
		this.$origin = $(el);
		this.$container = $('<div>')
			.css({
				paddingTop: '60px',
				paddingBottom: '60px',
				background: '#eeeeee',
				overflowY: 'auto',
				textAlign: 'center'
			})
			.outerHeight(this.$origin.height());
		this.$layout = $('<div>')
			.css({
				display: 'inline-block',
				position: 'relative',
				background: '#ffffff',
				boxShadow: '0 0 3px rgba(0,0,0,.1)',
				padding: '80px'
			})
			.outerHeight(this.$origin.height())
			.outerWidth(800);
		this.$workarea = $('<div>')
			.addClass('shiji-workarea')
			.css({
				position: 'absolute',
				textAlign: 'initial'
			})
			.outerWidth(this.$layout.width());
		this.$overlay = $('<div>')
			.css({
				position: 'absolute',
				textAlign: 'initial'
			})
			.outerWidth(this.$layout.width());
		
		this.$origin.append(this.$container)
		this.$container
			.append(this.$layout);
		this.$layout
			.append(this.$workarea)
			.append(this.$overlay);

		this.renderer = new Renderer(this);

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
			width: this.$layout.width()
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
