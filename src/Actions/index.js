import events from 'events';
import Text from './Text';

class Actions extends events.EventEmitter {

	constructor(shiji) {
		super();

		this.ctx = shiji;
		this.handlers = Object.assign({}, Text);
		this.tasks = [];
	}

	dispatch(action) {

		return new Promise((resolve) => {
			this.tasks.push({
				action: action,
				done: resolve
			});

			if (this.tasks.length == 1) {
				this.doTasks();
			}
		});
	}

	async doTasks() {

		var task = this.tasks.shift();
		if (!task)
			return;

		var action = task.action;
		var handler = this.findHandler(action.type);
		if (handler) {
			await handler.apply(this, [ action ]);
			task.done();
		}

		await this.doTasks();
	}

	findHandler(type) {

		var handler = this.handlers[type] || null;
		if (handler) {
			return handler;
		}

		return null;
	}

}

export default Actions;
