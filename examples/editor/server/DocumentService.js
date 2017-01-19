
var DocumentService = module.exports = function(source) {
	this.selections = {};
	this.source = source || {};
};

DocumentService.prototype.removeSelection = function(id) {
	delete this.selections[id];
};

DocumentService.prototype.handleAction = function(action) {
	console.log('DS');
	console.log(action);
	switch(action.type) {
	case 'SET_SELECTION':
		this.selections[action.payload.id] = action.payload;
		break;
	case 'REMOVE_SELECTION':
		delete this.selections[action.payload.id];
		break;
	}
};
