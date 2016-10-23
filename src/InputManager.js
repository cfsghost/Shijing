import events from 'events';

export default class InputManager extends events.EventEmitter {

	constructor() {
		super();

		this.inputs = {};
	}

	getInput(id) {
		if (id)
			return this.inputs[id];

		var ids = Object.keys(this.inputs);
		if (ids.length)
			return this.inputs[ids[0]];

		return null;
	}

	add(input) {
		this.inputs[input.id] = input;
		this.emit('added', input);
	}

	remove(id) {
		var input = this.inputs[id];
		if (input) {
			delete this.inputs[id];
			this.emit('deleted', input);
		}
	}
}
