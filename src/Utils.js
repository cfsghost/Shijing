
export default {
	generateId: function() {
		return Math.random().toString().substr(2) + Date.now();
	}
};
