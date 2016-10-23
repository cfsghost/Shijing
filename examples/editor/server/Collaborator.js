
var Collaborator = module.exports = function(id) {
	this.id = id;
	this.handlers = {};
};

Collaborator.prototype.getInfo = function() {
	return {
		id: this.id
	};
};
