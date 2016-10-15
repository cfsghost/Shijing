import events from 'events';

export default class History extends events.EventEmitter {

	constructor() {
		super();

		this.histories = [];
	}

	getHistory() {
		return this.histories;
	}

	addAction(action) {
		this.histories.push(action);

		this.emit('added', action);
		this.emit('update');
	}
};
