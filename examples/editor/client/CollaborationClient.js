import events from 'events';

class Collaborators extends events.EventEmitter {

	constructor() {
		super();

		this.collaborators = {};
	}

	add(collaborator) {
		this.collaborators[collaborator.id] = collaborator;
		this.emit('added', collaborator);
	}

	remove(id) {
		var collaborator = this.collaborators[id];
		if (collaborator) {
			delete this.collaborator[id];
			this.emit('deleted', collaborator);
		}
	}
}

export default class CollaborationClient extends events.EventEmitter {

	constructor() {
		super();

		this.websocket = null;
		this.conencted = false;
		this.authorized = false;
		this.connectionId = null;
		this.collaborators = new Collaborators();

		this.on('collabortor', (e) => {
			this.send('collaborator', e);
		});
	}

	connect(url) {
		this.websocket = new WebSocket(url);
		this.websocket.onopen = () => {
			this.connected = true;
			this.emit('online');
		};

		this.websocket.onclose = () => {
			this.connected = false;

			if (this.authorized)
				this.emit('signout');

			this.emit('offline');
		};

		this.websocket.onmessage = (e) => {
			this.handleMessage(e.data);
		};
	}

	disconnect() {

		if (!this.websocket) {
			this.connected = false;
			return;
		}

		this.websocket.close();
		this.websocket = null;

		if (this.collaborators[this.connectionId])
			delete this.collaborators[this.connectionId];

		this.connectionId = null;
	}

	send(eventName, payload) {
		if (!this.websocket)
			return;

		this.websocket.send(JSON.stringify({
			type: eventName,
			payload: payload
		}));
	}

	handleMessage(msg) {

		try {
			var msgObj = JSON.parse(msg);
		} catch(e) {
			// Do nothing if we got invalid format
			return;
		}

		console.log('handleMessage', msgObj);

		// Process events
		switch(msgObj.type) {
		case 'document':
			this.handleDocumentEvent(msgObj.payload);
			break;
		case 'collaborator':
			this.handleCollaboratorEvent(msgObj.payload);
			break;
		case 'service':
			this.handleServiceEvent(msgObj.payload);
			break;
		case 'action':
			this.emit('action', msgObj.payload);
			break;
		}
	}

	handleDocumentEvent(event) {
		switch(event.type) {
		case 'UPDATE':
			this.emit('update_document', {
				source: event.source,
				selections: event.selections
			});
			break;
		}
	}

	handleServiceEvent(event) {
		switch(event.type) {
		case 'READY':

			this.emit('ready');
			break;

		case 'AUTHORIZED':

			this.connectionId = event.collaborator.id;
			this.authorized = true;
			this.emit('authorized');
			break;
		}
	}

	handleCollaboratorEvent(event) {
		console.log('handleCollaboratorEvent', event);
		switch(event.type) {
		case 'ADD':
			this.collaborators.add(event.collaborator);
			break;
		case 'REMOVE':
			this.collaborators.remove(event.id);
			break;
		}
	}
}
