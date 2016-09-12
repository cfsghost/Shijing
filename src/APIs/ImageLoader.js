import events from 'events';

class ImageLoader extends events.EventEmitter {

	constructor() {
		super();

		this.caches = {};
	}

	exists(src) {
		return (this.caches[src]);
	}

	_load(src) {

		return this.caches[src] || null;
	}

	load(src) {
		var obj = this._load(src);
		if (obj) {
			return obj;
		}

		if (this.caches.hasOwnProperty(src)) {
			return null;
		}

		// Register and ready to load
		this.caches[src] = null;

		// Create a new image object to load image and store it to be cache
		var $img = $('<img>')
			.load(function() {
				this.caches[src] = $img;

				// Fire event
				this.emit(src, $img);
			}.bind(this))
			.attr('src', src);

		return null;
	}
}

export default ImageLoader;
