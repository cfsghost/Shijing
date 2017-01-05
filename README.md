# Shijing（詩經）

這是一個文件編輯引擎，目標是提供一個所見即所得（WYSIWYG）的文件編輯機制，與坊間的所見即所得編輯器專案（如：CKEditor）不太相同，這是一個函式庫，希望能作為一個解決方案，讓其他文書編輯器以此引擎發展出類似 Google Docs 的線上共編機制，以及達成與 Microsoft Word 相同的更多文書功能。

Shijing is a document editing engine, provides WYSIWYG way for editing requirement. Similar but not the same with other popular WYSIWYG projects(eg, CKEditor), Shijing is actually a library that trying to realize a possible way to make a powerful document editor, like Google Docs which supports collaborative mechanism and much functionility like Microsoft Word.

Usage
-

Here is the sample code to explain how to create a simple editor:

```js
var Shijing = require('lib/Shijing.js');

// Create a instance of editor and given a condition of selector to determine specific DOM we want to use
var editor = new Shijing('#editor');

// We set A4 to paper size
editor.setPaperSize(793.7, 1122.5);

// Set paper margin
editor.setPaperMargin(96);

// Now you can load document tree here
editor.load({
  root: {
    childrens: [
      {
        type: 'paragraph', childrens: [
          { type: 'inline', style: { color: 'pink' }, text: 'Hello baby!' },
        ]
      }
    ]
  }
});
```

Example
-

There is example you can found in `examples` directory to know how to create an editor by using Shijing. Running up `server.js` to start server, then you can open it by using browser.
```
http://localhost:3000
```

License
-
Licensed under the MIT License

Authors
-
Copyright(c) 2016 Fred Chien（錢逢祥） <<cfsghost@gmail.com>>
