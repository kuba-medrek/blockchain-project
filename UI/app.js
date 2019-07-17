#!/usr/bin/env node
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const mount = require('koa-mount');
const serve = require('koa-static');
const hbs = require('koa-hbs');
const loki = require('lokijs');
const Router = require('koa-router');
const {unauthorised, authorised} = require('./routes');
const controller = require('./controllers/game');

const app = new Koa();
const PORT = 38000;

let db = new loki('blockchain-project');
let users = db.addCollection('users', { indices: ['login'] });

app.use(bodyParser());
app.use(mount('/static', serve('views/static')));

app.use(hbs.middleware({
	viewPath: `${__dirname}/views`,
	partialsPath: `${__dirname}/views/partials`,
	layoutsPath: `${__dirname}/views/layouts`,
	defaultLayout: 'main'
}));

app.use(new Router().post('/api/login', async ctx => {
	const {status, token} = await controller.loginUser(ctx.request.body.login, ctx.request.body.password, users, ctx);
	
	ctx.status = status;
	ctx.body = {
		token: token
	};
}).routes());
app.use(unauthorised.routes());
app.use(async (ctx, next) => { // Working
	const token = ctx.cookies.get('bp_token');
	if(!token || !users.findOne({'token': token})) {
		ctx.throw(401);
	}
	ctx.state.account = {
		address: users.findOne({token: token}).login
	};
	await next();
});
app.use(authorised.routes());

const server = app.listen(PORT, () => {
	console.log(`Server listening on port: ${PORT}`);
});

module.exports = server;
