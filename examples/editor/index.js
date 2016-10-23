import Shijing from '../../';
import CollaborationClient from './CollaborationClient';

$(function() {
	var $window = $(window);
	var $layout = $('.layout');
	var $toolbar = $('.toolbar');
	
	$layout
		.height($window.height())
		.width($window.width());

	$('#editor')
		.css('top', $toolbar.height())
		.height($layout.height() - $toolbar.height())
		.width($layout.width());

	var paperSize = [
		{
			name: 'A4 (21cm x 29.7 cm)',
			width: 793.7,
			height: 1122.5
		}
	];

	var shijing = new Shijing('#editor');

	shijing.setPaperSize(paperSize[0].width, paperSize[0].height);

	// Getting history
	shijing.history.on('added', function(action) {

		var $actionItem = $('<div>')
			.addClass('actionItem');
		var $actionType = $('<div>')
			.addClass('actionType')
			.text(action.type)
			.appendTo($actionItem);
		var $actionLabel = $('<div>')
			.addClass('actionLabel')
			.text('ACTION')
			.prependTo($actionType);

		var $actionPayload = $('<div>')
			.addClass('actionPayload')
			.appendTo($actionItem);

		for (var key in action.payload) {
			var $info = $('<div>')
				.appendTo($actionPayload);

			var $key = $('<div>')
				.addClass('key')
				.text(key + ': ')
				.appendTo($info);

			var $value = $('<div>')
				.addClass('value')
				.appendTo($info);

			if (action.payload[key] instanceof Array) {
				$value.text(JSON.stringify(action.payload[key], null, 1));
			} else {
				$value.text(action.payload[key]);
			}
		}

		$('#history')
			.append($actionItem)
			.stop(true, false)
			.animate({
				scrollTop: $('#history')[0].scrollHeight
			}, 400);

		$actionItem
			.hide()
			.fadeIn(200);
	});
	
	// margin is set to  2.54 cm
	shijing.setPaperMargin(96);

	shijing.load({
		root: {
			childrens: [
				{
					type: 'paragraph', childrens: [
						{ type: 'inline', style: { color: 'blue' }, text: '這是藍色顏色的字' },
						{ type: 'inline', style: { color: 'red', fontStyle: 'italic' }, text: '這是紅色顏色的字' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
						{ type: 'inline', style: { color: 'blue' }, text: '這是藍色顏色的字' },
						{ type: 'inline', style: { color: 'red', fontStyle: 'italic' }, text: '先聲明，async 異步函數是 ECMAScript 第七版（ES7）才被支援的語法和特性，目前 ES7 還沒有被大多數的 JavaScript Engine 所實作，如果你要使用，需要用到 babel 這類工具，先把此程式編譯轉換，讓其可在舊版本 JavaScript Engine 上執行。' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
						{ type: 'inline', style: { color: 'blue' }, text: '這是藍色顏色的字' },
						{ type: 'inline', style: { color: 'red', fontStyle: 'italic' }, text: '這是紅色顏色的字' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
						{ type: 'inline', style: { color: 'green' }, text: '這是' },
						{ type: 'inline', style: { color: 'red' }, text: '這是紅色顏色的字這是紅色顏色的字這是紅色顏色的字這是紅色顏色的字這是紅色顏色的字這是紅色顏色的字' },
					]
				},
				{
					type: 'paragraph', childrens: [
						{ type: 'inline', text: '如果你覺得以 co 模組來操作 Generator 很好用，你可以想像 async 異步函數就是原生的 co，幾乎是同樣的使用方式，同樣的使用概念，只不過不再需要使用 generator 和 yield 這類語法。如果你是個過不了在函數上有個醜陋「*」符號這一關的人，async 異步函數的使用方式應該會讓你感覺到舒服許多。' }
					]
				},
/*
				{
					type: 'paragraph', childrens: [
						{ type: 'inline', style: { color: 'blue', fontSize: '36px' }, text: '這是藍色顏色 36px 的字' },
						{ type: 'inline', style: { color: 'red' }, text: '這是紅色顏色的字' },
						{ type: 'image', style: { width: '60px', height: '45px' }, src: 'AvengerGear.png' },
						{ type: 'image', style: { width: '150px', height: '150px' }, src: 'AvengerGear.png' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
					]
				},
*/
/*
				{
					type: 'paragraph', childrens: [
						{ type: 'inline', style: { color: 'blue', fontSize: '36px' }, text: '這是藍色顏色 36px 的字' },
						{ type: 'inline', style: { color: 'red' }, text: '這是紅色顏色的字' },
						{ type: 'image', style: { width: '60px', height: '45px' }, src: 'AvengerGear.png' },
						{ type: 'image', style: { width: '150px', height: '150px' }, src: 'AvengerGear.png' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
						{ type: 'inline', style: { color: 'blue' }, text: '這是藍色顏色的字' },
						{ type: 'inline', style: { color: 'red' }, text: '這是紅色顏色的字' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
						{ type: 'inline', style: { color: 'orange' }, text: '文繞圖也可以搞定，有點神！' },
						{ type: 'inline', style: { color: 'red' }, text: '文繞圖也可以搞定，有點神！' },
						{ type: 'inline', style: { color: 'red' }, text: '這是紅色顏色的字' },
						{ type: 'image', style: { width: '60px', height: '45px' }, src: 'AvengerGear.png' },
						{ type: 'image', style: { width: '150px', height: '150px' }, src: 'AvengerGear.png' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
						{ type: 'inline', style: { color: 'blue' }, text: '這是藍色顏色的字' },
						{ type: 'inline', style: { color: 'red' }, text: '這是紅色顏色的字' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
						{ type: 'inline', style: { color: 'red' }, text: '這是紅色顏色的字' },
						{ type: 'image', style: { width: '60px', height: '45px' }, src: 'AvengerGear.png' },
						{ type: 'image', style: { width: '150px', height: '150px' }, src: 'AvengerGear.png' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
						{ type: 'inline', style: { color: 'blue' }, text: '這是藍色顏色的字' },
						{ type: 'inline', style: { color: 'red' }, text: '這是紅色顏色的字' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
						{ type: 'inline', style: { color: 'red' }, text: '這是紅色顏色的字' },
						{ type: 'image', style: { width: '60px', height: '45px' }, src: 'AvengerGear.png' },
						{ type: 'image', style: { width: '150px', height: '150px' }, src: 'AvengerGear.png' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
						{ type: 'inline', style: { color: 'blue' }, text: '這是藍色顏色的字' },
						{ type: 'inline', style: { color: 'red' }, text: '這是紅色顏色的字' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
					]
				},
*/
	/*
				{
					type: 'paragraph', childrens: [
						{ type: 'inline', style: { color: 'blue' }, text: '這是藍色顏色的字' },
						{ type: 'image', src: 'http://m.img.brothersoft.com/iphone/1646/525711646_icon175x175.jpg' },
						{ type: 'image', style: { width: '32px', height: '32px' }, src: 'http://m.img.brothersoft.com/iphone/1646/525711646_icon175x175.jpg' },
						{ type: 'image', style: { width: '48px', height: '48px' }, src: 'http://m.img.brothersoft.com/iphone/1646/525711646_icon175x175.jpg' },
						{ type: 'image', style: { width: '32px', height: '32px' }, src: 'http://m.img.brothersoft.com/iphone/1646/525711646_icon175x175.jpg' },
						{ type: 'inline', style: { color: 'red', fontStyle: 'italic' }, text: '這是紅色顏色的字' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
					]
				},
				{
					type: 'paragraph', childrens: [
						{ type: 'inline', style: { color: 'blue' }, text: '這是藍色顏色的字' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
						{ type: 'inline', style: { color: 'red' }, text: '這是紅色顏色的字' },
						{ type: 'inline', style: { color: 'blue' }, text: '這是藍色顏色的字' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
						{ type: 'inline', style: { color: 'red' }, text: '這是紅色顏色的字' },
						{ type: 'inline', style: { color: 'blue' }, text: '這是藍色顏色的字' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
						{ type: 'inline', style: { color: 'red' }, text: '這是紅色顏色的字' },
						{ type: 'inline', style: { color: 'blue' }, text: '這是藍色顏色的字' },
						{ type: 'inline', style: { color: 'green' }, text: '這是綠色顏色的字' },
						{ type: 'inline', style: { color: 'red' }, text: '這是紅色顏色的字' },
					]
				},
				*/
				{
					type: 'paragraph', childrens: [
						{ type: 'inline', text: '搭配使用 Git 進行開發工作，時常會碰到一個狀況，就是我們 fork 一個專案出來修改，但在我們在修改的同時上游有了更新，這時我們會想要把上游的更新同步下來。這是一個常見的問題，許多人不時會提出來詢問，事實上如果你去 Google ，多半能找到這樣一篇名為「Syncing a fork」的 Github 文件。雖然這篇文章已經把程序詳細列出來了，但還是有人看不太懂，原因是要搭配「Configuring a remote for a fork」這一篇文件一起看才知道來龍去脈。 簡單來說，我們要先把「上游（upstream）」的 repository 加入我們眼前正在修改的專案，然後把上游更新拉回來，最後再與我們現有程式碼合併。' },
					]
				},
/*
				{ type: 'paragraph', text: '搭配使用 Git 進行開發工作，時常會碰到一個狀況，就是我們 fork 一個專案出來修改，但在我們在修改的同時上游有了更新，這時我們會想要把上游的更新同步下來。這是一個常見的問題，許多人不時會提出來詢問，事實上如果你去 Google ，多半能找到這樣一篇名為「Syncing a fork」的 Github 文件。雖然這篇文章已經把程序詳細列出來了，但還是有人看不太懂，原因是要搭配「Configuring a remote for a fork」這一篇文件一起看才知道來龍去脈。 簡單來說，我們要先把「上游（upstream）」的 repository 加入我們眼前正在修改的專案，然後把上游更新拉回來，最後再與我們現有程式碼合併。搭配使用 Git 進行開發工作，時常會碰到一個狀況，就是我們 fork 一個專案出來修改，但在我們在修改的同時上游有了更新，這時我們會想要把上游的更新同步下來。這是一個常見的問題，許多人不時會提出來詢問，事實上如果你去 Google ，多半能找到這樣一篇名為「Syncing a fork」的 Github 文件。雖然這篇文章已經把程序詳細列出來了，但還是有人看不太懂，原因是要搭配「Configuring a remote for a fork」這一篇文件一起看才知道來龍去脈。 簡單來說，我們要先把「上游（upstream）」的 repository 加入我們眼前正在修改的專案，然後把上游更新拉回來，最後再與我們現有程式碼合併。搭配使用 Git 進行開發工作，時常會碰到一個狀況，就是我們 fork 一個專案出來修改，但在我們在修改的同時上游有了更新，這時我們會想要把上游的更新同步下來。這是一個常見的問題，許多人不時會提出來詢問，事實上如果你去 Google ，多半能找到這樣一篇名為「Syncing a fork」的 Github 文件。雖然這篇文章已經把程序詳細列出來了，但還是有人看不太懂，原因是要搭配「Configuring a remote for a fork」這一篇文件一起看才知道來龍去脈。 簡單來說，我們要先把「上游（upstream）」的 repository 加入我們眼前正在修改的專案，然後把上游更新拉回來，最後再與我們現有程式碼合併。搭配使用 Git 進行開發工作，時常會碰到一個狀況，就是我們 fork 一個專案出來修改，但在我們在修改的同時上游有了更新，這時我們會想要把上游的更新同步下來。這是一個常見的問題，許多人不時會提出來詢問，事實上如果你去 Google ，多半能找到這樣一篇名為「Syncing a fork」的 Github 文件。雖然這篇文章已經把程序詳細列出來了，但還是有人看不太懂，原因是要搭配「Configuring a remote for a fork」這一篇文件一起看才知道來龍去脈。 簡單來說，我們要先把「上游（upstream）」的 repository 加入我們眼前正在修改的專案，然後把上游更新拉回來，最後再與我們現有程式碼合併。搭配使用 Git 進行開發工作，時常會碰到一個狀況，就是我們 fork 一個專案出來修改，但在我們在修改的同時上游有了更新，這時我們會想要把上游的更新同步下來。這是一個常見的問題，許多人不時會提出來詢問，事實上如果你去 Google ，多半能找到這樣一篇名為「Syncing a fork」的 Github 文件。雖然這篇文章已經把程序詳細列出來了，但還是有人看不太懂，原因是要搭配「Configuring a remote for a fork」這一篇文件一起看才知道來龍去脈。 簡單來說，我們要先把「上游（upstream）」的 repository 加入我們眼前正在修改的專案，然後把上游更新拉回來，最後再與我們現有程式碼合併。搭配使用 Git 進行開發工作，時常會碰到一個狀況，就是我們 fork 一個專案出來修改，但在我們在修改的同時上游有了更新，這時我們會想要把上游的更新同步下來。這是一個常見的問題，許多人不時會提出來詢問，事實上如果你去 Google ，多半能找到這樣一篇名為「Syncing a fork」的 Github 文件。雖然這篇文章已經把程序詳細列出來了，但還是有人看不太懂，原因是要搭配「Configuring a remote for a fork」這一篇文件一起看才知道來龍去脈。 簡單來說，我們要先把「上游（upstream）」的 repository 加入我們眼前正在修改的專案，然後把上游更新拉回來，最後再與我們現有程式碼合併。搭配使用 Git 進行開發工作，時常會碰到一個狀況，就是我們 fork 一個專案出來修改，但在我們在修改的同時上游有了更新，這時我們會想要把上游的更新同步下來。' },
				{ type: 'paragraph', text: '這是一行文字。' },
				*/
	//			{ type: 'paragraph', text: '這是一行文字。' },
	//			{ type: 'paragraph', text: '這是一行文字。' },
			]
		}
	});

	// Connect to server
	var client = new CollaborationClient();

 	var actionHandler = (action) => {
		console.log('ACTION', action);
		client.send('action', action);
	};

	client.on('ready', () => {

		client.send('service', {
			type: 'SIGN_IN',
			id: shijing.inputs.getInput().id
		});
	});

	client.on('signout', () => {
		shijing.actions.removeListener('internal', actionHandler);
	});

	client.on('authorized', (id) => {

		client.send('collaborator', {
			type: 'REQUEST_LIST'
		});

		client.send('document', {
			type: 'GET'
		});

		shijing.actions.on('internal', actionHandler);
	});

	client.on('update_document', (doc) => {
		if (doc) {
			console.log(doc);
			return shijing.load(doc);
		}

		// no existed document, upload it
		client.send('document', {
			type: 'CREATE',
			doc: shijing.getSource()
		});
	});

	client.collaborators.on('added', (collaborator) => {
		console.log('ADDED', collaborator);

		if (collaborator.id == client.connectionId)
			return;

		shijing.dispatch({
			type: 'ADD_SELECTION',
			payload: {
				id: collaborator.id
			}
		}, true);
	});

	client.on('action', (action) => {
		console.log(action);
		shijing.dispatch(action);
	});

	client.connect('ws://localhost:3000/example');

});
