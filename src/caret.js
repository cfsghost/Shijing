
class Caret {

	constructor() {

		this.timer = null;
		this.x = 0;
		this.y = 0;
		this.$dom = $('<div>')
			.css({
				position: 'absolute',
				background: 'red',
				width: '2px',
				height: '15px'
			});
		this.isShowed = false;
	}

	release() {
		this.$dom.remove();
	}

	move(x, y) {

		this.x = x;
		this.y = y;

		this.$dom.css({
			left: x,
			top: y
		});
	}

	applyDefaultStyles() {

		this.$dom.removeAttr('style', '');

		if (this.isShowed) {
			this.$dom.show();
		} else {
			this.$dom.hide();
		}

		this.$dom.css({
			left: this.x,
			top: this.y,
			position: 'absolute',
			background: 'black'
		});
	}

	setStyle(styles) {

		this.applyDefaultStyles();

		if (!styles.width) {
			styles.width = '2px';
		}

		this.$dom.css(styles);

		if (styles.color) {
			this.$dom.css('background', styles.color);
		}
	}

	show() {

		clearInterval(this.timer);

		this.isShowed = true;
		this.$dom.show();

		// Blinking
		this.timer = setInterval(function() {
			this.$dom.toggle();
		}.bind(this), 400);
	}

	hide() {
		clearInterval(this.timer);

		this.isShowed = false;
		this.$dom.hide();
	}
}

export default Caret;
