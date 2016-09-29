
export default {
	generateId: function() {
		return Math.random().toString().substr(2) + Date.now();
	},
	getCurrentStyleRules() {

		var rules = [];
		for (var index = 0; index < document.styleSheets.length; index++) {
			var sheet = document.styleSheets[index];

			if (!sheet.cssRules)
				continue;

			var found = false;
			for (var i = 0; i < sheet.cssRules.length; i++) {
				var rule = sheet.cssRules[i];

				if (!rule.selectorText)
					continue;

				if (rule.selectorText.search('.shijing') == -1)
					continue;

				rules.push(rule);

				found = true;
			}

			if (found)
				break;
		}

		return rules;
	}
};
