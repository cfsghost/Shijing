import events from 'events';
import Text from './Text';
import Selection from './Selection';

class Actions extends events.EventEmitter {

	constructor(shiji) {
		super();

		this.ctx = shiji;
		this.handlers = Object.assign({}, Text, Selection);
		this.tasks = [];
	}

	dispatch(action, internal) {

		return new Promise((resolve) => {
			this.tasks.push({
				action: action,
				internal: internal ? true : false,
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

			// Push to history
			this.ctx.history.addAction(action);

			if (task.internal)
				this.emit('internal', action);

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
