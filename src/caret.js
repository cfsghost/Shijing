
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

		this.$dom.show();

		// Blinking
		this.timer = setInterval(function() {
			this.$dom.toggle();
		}.bind(this), 400);
	}
}

export default Caret;
