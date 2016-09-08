
class Offscreen {

	constructor(renderer) {
		this.renderer = renderer;
		this.$dom = $('<iframe>').css({
			opacity: 0,
			position: 'absolute',
			top: 0,
			left: 0,
			border: '1px solid black',
			pointerEvents: 'none'
		});

		renderer.shiji.$overlay
			.append(this.$dom);

		this.$body = this.$dom.contents().find('body');
		this.$body.css({
			margin: '0px'
		});
	}

	setWidth(width) {
		this.$dom.css({
			width: width
		});
	}

	setHeight(height) {
		this.$dom.css({
			height: height 
		});
	}

	getWidth() {
		return this.$dom.width();
	}

	resize(width, height) {
		this.$dom.css({
			width: width,
			height: height
		});
	}

	getDocument() {
		return this.$dom.get(0).contentWindow.document;
	}

	getContent() {
		return this.$body;
	}

	empty() {
		return this.$dom.empty();
	}

	render(dom) {

		return new Promise(function(resolve) {

			this.$body
				.empty()
				.append(dom);

			resolve();

		}.bind(this));
	}
}

export default Offscreen;
