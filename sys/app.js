"use strict";
	const koa 		 = require('koa');
	const bodyparser = require('koa-bodyparser');
	const render 	 = require('koa-ejs');
	const util 		 = require('util');
	const path 		 = require('path');
	const os 		 = require('os');
	const favicon 	 = require('koa-favicon');
	const revision 	 = require('../sys/middleware/revision-cmd');
	const env        = process.env;
    
    
	let isProduction = env.NODE_ENV == 'prod' ? true : false;
	let isDev 		 = env.NODE_ENV == 'dev' ? true: false;

module.exports = function(){
	let app 	= new koa();


	//use template engine
	render(app, {
		root	: `${path.resolve(__dirname,'../')}/view/`,
		layout	: false,
        viewExt	: 'html',
        cache	: isProduction ? true  : false,
        debug	: isProduction ? false : true
	});

	//rewrite render
	let sysRender = app.context.render;
	let defaultCfg = {
			js 					: [],
			css 				: [],
			h_description 		: 'des',
			h_keywords			: 'kw',
			h_title				: '',
			dns 		 		: JSON.parse(env.dns),
			jsServerAddr 		: env.jsServerAddr,
			cssServerAddr		: env.cssServerAddr,
			env 				: env.NODE_ENV,
			deps 				: '',
			enter 				: ''
		}

    app.use(require('koa-bodyparser')());
    
    if(isDev){
		defaultCfg.js.push(`http://${getIp()}:35729/livereload.js??ver=1`);
	}

	app.context.render = function(view,opt){
		return function*(){
			opt = opt || {};
			var o = Object.create(defaultCfg);
			if(opt.enter){
				opt.deps = JSON.stringify(revision(opt.enter || ''));
			}
			extend(o,opt);
			yield sysRender.apply(this,[view,o]);
		}
	}
	app.use(favicon(path.join(__dirname ,'../resource/img/favicon.ico')));
    //ssoauth
    
	//use router
	app.use(isDev ?  require('./middleware/router') : require('./middleware/distRouter'));

	return app;
};


function getIp(){
	var interfaces = os.networkInterfaces();
	var addresses = [];
	for (var k in interfaces) {
	    for (var k2 in interfaces[k]) {
	        var address = interfaces[k][k2];
	        if (address.family === 'IPv4' && !address.internal) {
	            addresses.push(address.address);
	        }
	    }
	}
	return addresses[0];
}

function extend(o,n){
	for(var i in n){
		var val = n[i] || {};
		o[i] =  (val.concat && o[i])? o[i].concat(val) : val;
	}
}