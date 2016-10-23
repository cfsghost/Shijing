import treeOperator from '../TreeOperator';
import Selection from '../Selection';

export default {
	'UPDATE_CURRENT_USER': async function(action) {
		var input = this.ctx.inputs.getInput();

		input.id = payload.id;
	},
	'ADD_SELECTION': async function(action) {
		var renderer = this.ctx.renderer;
		var payload = action.payload;

		var selection = new Selection();
		selection.id = payload.id;

		renderer.Selection.addSelection(selection);
	}
};
