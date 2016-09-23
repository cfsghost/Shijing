import InlineComponent from '../InlineComponent';
import ImageLoader from '../APIs/ImageLoader';

var imageLoader = new ImageLoader();

export default class Image extends InlineComponent {

	constructor(renderer, node, subComponents) {
		super(renderer, node, subComponents);

		this.loaded = false;
		this.allowedCursor = false;

		// Inline block
		this.blockType = true;
	}

	getLength() {
		return 0;
	}

	getRects() {

		var rects = [];

		// Check this text node
		var range = document.createRange();
		range.selectNode(this.dom);
		var clientRects = range.getClientRects();

		for (var index = 0; index < clientRects.length; index++) {
			var rect = clientRects[index];
			rects.push(rect);
		}

		return [
			{
				DOM: this.dom,
				rects: rects
			}
		];
	}

	setCursor(cursor, offset) {

		// Ignore 
		return offset + 1;
	}

	getPosition(offset) {
		return {
			DOM: null,
			offset: offset - 1
		};
	}

	//_loadImage(style, src, obj) {
	_loadImage(style, obj) {

		return new Promise((resolve) => {
			var $dom = $(this.dom);

			// Change container's appearance
			$dom
				.css({
					width: 'initial',
					height: 'initial',
					border: 'initial'
				})
				.empty();

			var image = obj.cloneNode(true);
			$(image)
				.css(style)
				.appendTo($dom);

			return resolve();
		});
	}

	loadImage() {

		return new Promise(async (resolve) => {

			var style = {
				width: 'initial',
				height: 'initial',
				verticalAlign: 'bottom'
			};
			if (this.node.style) {
				if (this.node.style.width)
					style.width = this.node.style.width;

				if (this.node.style.height)
					style.height = this.node.style.height;
			}

			// Loading image
			var obj = imageLoader.load(this.node.src);
			if (obj) {
				console.log(obj);
				await this._loadImage(style, obj);
				return resolve();
			}

			// Waiting for image 
			imageLoader.once(this.node.src, async (obj) => {
				await this._loadImage(style, obj);
				resolve();
			});
		});
	}

	async componentDidMount() {

		// No need to load again
		if (this.loaded)
			return false;

		await this.loadImage();

		return true;
	}

	render() {

		return new Promise(async function(resolve) {

			var node = this.node;

			var style = Object.assign({
			}, this.node.style || {}, {
				width: null,
				height: null,
				display: 'inline-block',
				background: 'white'
			});

			var $DOM = $('<div>')
				.css(style);

			this.dom = $DOM[0];

			// Loading directly if cache exists already
			if (imageLoader.exists(this.node.src)) {
				console.time('Load image');
				this.loaded = true;
				await this.loadImage();
				var x = console.timeEnd('Load image');

				return resolve();
			}

			// Setup background and border
			$DOM.css({
				'box-sizing': 'border-box',
				'-moz-box-sizing': 'border-box',
				'-webkit-box-sizing': 'border-box',
				border: '1px solid #5588ff'
			});

			// Initializing loader
			var $loader = $('<div>')
				.addClass('loader')
				.css({
					width: '24px',
					height: '24px',
					margin: '10px'
				})
				.appendTo($DOM);

			resolve();

		}.bind(this));
	}
}
