
var Collaborator = module.exports = function(id) {
	this.id = id;
	this.handlers = {};
	this.selections = {};
};

Collaborator.prototype.getInfo = function() {
	return {
		id: this.id
	};
};

Collaborator.prototype.removeSelection = function(id) {
	delete this.selections[id];
};

Collaborator.prototype.handleAction = function(action) {

	switch(action.type) {
	case 'SET_SELECTION':
		this.selections[action.payload.id] = action.payload;
		break;
	case 'REMOVE_SELECTION':
		this.removeSelection(action.payload.id);
		break;
	}
};
