var koa = require('koa');
var serve = require('koa-static');
var Router = require('koa-router');

var app = koa();

app.use(serve(__dirname));

var router = new Router();
router.get('/', function *() {
	this.redirect('/index.html');
});

app.listen(3000);
