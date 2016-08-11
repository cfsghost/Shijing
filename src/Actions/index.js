import Text from './Text';

class Actions {

	constructor(shiji) {

		this.dispatcher = shiji.actionDispatcher;
		this.ctx = shiji;
		this.handlers = {
			Text: Text
		}

		// Waiting actions to do something
		this.dispatcher.on('action', function(action) {

			for (var handlerName in this.handlers) {
				var handler = this.handlers[handlerName][action.type] || null;
				if (handler) {
					handler.apply(this, [ action ]);

					break;
				}
			}

		}.bind(this));
	}


}

export default Actions;
