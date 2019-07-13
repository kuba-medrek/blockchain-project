const koa = require('koa');
const markdown = require('koa-markdown');
const app = new koa();

const PORT = 7000;

app.use(markdown({
	root: __dirname + '/templates',
	layout: __dirname + '/templates/layout.html',
	indexName: 'index'
}));

app.listen(PORT);
console.log(`app listening on ${PORT}, visit http://localhost:${PORT}/docs to visit`);