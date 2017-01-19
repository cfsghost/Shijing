var events = require('events');
var koa = require('koa');
var serve = require('koa-static');
var Router = require('koa-router');
var websockify = require('koa-websocket');
var Collaborator = require('./server/Collaborator');
var DocumentService = require('./server/DocumentService');

var app = koa();
var socket = websockify(app);

app.use(serve(__dirname));

// Websocket router
var eventEmitter = new events.EventEmitter();
var collaborators = {};
var documents = {};

var eventRouter = {
	handleService: function(connection, msgObj) {
		var action = msgObj.payload;

		switch(action.type) {
		case 'SIGN_IN':

			if (collaborators[action.id]) {
				// TODO: There is a user who is using this ID already, kick it.
			}

			var collaborator = collaborators[action.id] = new Collaborator(action.id);
			connection.collaborator = collaborator;

			// Fire event to tell other connection a new collaborator connected
			eventEmitter.emit('collaborator', {
				payload: {
					type: 'ADD',
					collaborator: collaborator.getInfo()
				}
			});

			// Document event handler
			collaborator.handlers.documentHandler = function(msgObj) {
console.log('<=', connection.collaborator.id, msgObj);

				// do not send action to its owner
				if (msgObj.collaboratorId == collaborator.id)
					return;

				connection.socket.send(JSON.stringify({
					type: 'document',
					payload: msgObj.payload
				}));
				
			};
			eventEmitter.on('document', collaborator.handlers.documentHandler);

			// Collaborator event handler
			collaborator.handlers.collaboratorHandler = function(msgObj) {
console.log('<=', connection.collaborator.id, msgObj);

				// do not send action to its owner
				if (msgObj.collaboratorId == collaborator.id)
					return;

				connection.socket.send(JSON.stringify({
					type: 'collaborator',
					payload: msgObj.payload
				}));
				
			};
			eventEmitter.on('collaborator', collaborator.handlers.collaboratorHandler);

			// Action event handler
			collaborator.handlers.actionHandler = function(msgObj) {
console.log('<=', connection.collaborator.id, msgObj);

				// do not send action to its owner
				if (msgObj.collaboratorId == collaborator.id)
					return;

				connection.socket.send(JSON.stringify({
					type: 'action',
					collaboratorId: msgObj.collaboratorId,
					payload: msgObj.payload
				}));
				
			};
			eventEmitter.on('action', collaborator.handlers.actionHandler);

			// Done for signing
			connection.socket.send(JSON.stringify({
				type: 'service',
				payload: {
					type: 'AUTHORIZED',
					collaborator: collaborator.getInfo()
				}
			}));
			break;

		case 'SIGN_OUT':

			if (!connection.collaborator)
				break;

			delete collaborators[connection.collaborator.id];

			// Remove listeners
			eventEmitter.removeListener('document', connection.collaborator.handlers.documentHandler);
			eventEmitter.removeListener('action', connection.collaborator.handlers.actionHandler);
			eventEmitter.removeListener('collaborator', connection.collaborator.handlers.collaboratorHandler);
/*
			eventRouter.handleAction(connection, {
				payload: {
					type: 'REMOVE_SELECTION'
				}
			});
*/
			eventEmitter.emit('collaborator', {
				payload: {
					type: 'REMOVE',
					collaboratorId: connection.collaborator.id
				}
			});

			break;
		}
	},
	handleDocument: function(connection, msgObj) {
		var action = msgObj.payload;

		switch(action.type) {
		case 'GET':

			var doc = documents[connection.documentId] || null
			console.log('GET', doc);
			connection.socket.send(JSON.stringify({
				type: 'document',
				payload: {
					type: 'UPDATE',
					source: doc ? doc.source : null,
					selections: doc ? doc.selections : null
				}
			}));

			break;

		case 'CREATE':
			var doc = documents[connection.documentId] || null
			if (doc)
				break;

			doc = new DocumentService(action.source);

			documents[connection.documentId] = doc;

			eventEmitter.emit('document', {
				collaboratorId: connection.collaborator.id,
				payload: {
					type: 'UPDATE',
					source: doc.source,
					selections: doc.selections
				}
			});
			break;
		}
	},
	handleCollaborator: function(connection, msgObj) {
		var action = msgObj.payload;

		switch(action.type) {
		case 'REQUEST_LIST':

			for (var cid in collaborators) {
				var collaborator = collaborators[cid];

				var payload = {
					type: 'ADD',
					collaborator: collaborator
				};

				console.log('<=', connection.collaborator.id, payload);

				connection.socket.send(JSON.stringify({
					type: 'collaborator',
					payload: payload
				}));
			}

			break;
		}
	},
	handleAction: function(connection, msgObj) {
		var action = msgObj.payload;

		msgObj.collaboratorId = connection.collaborator.id;

		var doc = documents[connection.documentId] || null
		if (doc) {
			doc.handleAction(action);
		}

		if (connection.collaborator) {
			connection.collaborator.handleAction(action);
		}

		eventEmitter.emit(msgObj.type, msgObj);
	},
	handleMessage: function(connection, msgObj) {

		switch(msgObj.type) {
		case 'service':
			eventRouter.handleService(connection, msgObj);
			break;

		case 'document':
			eventRouter.handleDocument(connection, msgObj);
			break;

		case 'collaborator':
			eventRouter.handleCollaborator(connection, msgObj);
			break;

		case 'action':
			eventRouter.handleAction(connection, msgObj);
			break;

		default:
			eventEmitter.emit(msgObj.type, msgObj);
		}
	}
};

var wsRouter = new Router();
wsRouter.get('/:documentId', function *() {
	console.log('Connected');

	var connection = {
		socket: this.websocket,
		documentId: this.params.documentId,
	};

	// Ready to go
	this.websocket.send(JSON.stringify({
		type: 'service',
		payload: {
			type: 'READY'
		}
	}));

	this.websocket.on('message', function(msg) {

		var msgObj = JSON.parse(msg);

		if (connection.collaborator)
			console.log('=>', connection.collaborator.id, msgObj);
		else
			console.log('=>', '[Guest]', msgObj);

		eventRouter.handleMessage(connection, msgObj);

	});

	this.websocket.on('close', function() {

		console.log('Disconnected');

		eventRouter.handleService(connection, {
			payload: {
				type: 'SIGN_OUT'
			}
		});

		var doc = documents[connection.documentId] || null
		if (doc) {
			if (connection.collaborator) {
				var selections = connection.collaborator.selections;

				Object.keys(selections).forEach((selection, id) => {
					doc.removeSelection(id);
					connection.collaborator.removeSelection(id);
				});

			}
		}

	});
});

app.ws
	.use(wsRouter.routes())
	.use(wsRouter.allowedMethods());

app.listen(3000);
