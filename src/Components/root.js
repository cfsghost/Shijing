import BlockComponent from '../BlockComponent';
import HiddenNode from './hiddenNode';

export default class Root extends HiddenNode {

	adjustCursorPosition(cursor, direction) {

//		console.log('ROOT NODE ADJUST CURSOR');

		// It's end of all nodes
		if (cursor.startOffset == this.node.childrens.length) {

			if (direction) {
				return cursor.move(-1);
			}
		}
		
		super.adjustCursorPosition(cursor, direction);
	}
}
