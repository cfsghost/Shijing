export default class History {

	constructor() {
		this.histories = [];
	}

	addAction(action) {
		this.histories.push(action);
	}
};
