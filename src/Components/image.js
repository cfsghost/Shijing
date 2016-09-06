import InlineComponent from '../InlineComponent';

var caches = {};

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

	loadImage() {

		return new Promise(function(resolve) {

			var style = {
				width: 'initial',
				height: 'initial',
			};
			if (this.node.style) {
				if (this.node.style.width)
					style.width = this.node.style.width;

				if (this.node.style.height)
					style.height = this.node.style.height;
			}

			var $dom = $(this.dom);

			// Using cache if it exists
			var cache = caches[this.node.src] || null;
			if (cache) {

				// Change container's appearance
				$dom
					.css({
						width: 'initial',
						height: 'initial',
						border: 'initial'
					})
					.empty();

				cache
					.clone()
					.css(style)
					.appendTo($dom);

				return resolve();
			}

			// Create a new image object to load image and store it to be cache
			var $img = $('<img>')
				.css(style)
				.load(function() {

					this.loaded = true;
					caches[this.node.src] = $img;

					$dom
						.css({
							width: null,
							height: null,
							border: 'initial'
						})
						.empty()
						.append($img);

					resolve();
				}.bind(this))
				.attr('src', this.node.src);
		}.bind(this));
	}

	async componentDidMount() {

		if (this.loaded)
			return;

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
				'box-sizing': 'border-box',
				'-moz-box-sizing': 'border-box',
				'-webkit-box-sizing': 'border-box',
				border: '1px solid #5588ff',
				display: 'inline-block',
				background: 'white'
			});

			var $DOM = $('<div>')
				.css(style);

			this.dom = $DOM[0];

			// Loading directly if cache exists already
			if (caches[this.node.src]) {
				this.loaded = true;
				await this.loadImage();

				return resolve();
			}

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
