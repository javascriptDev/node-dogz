"use strict";

const numCPUs 	= require('os').cpus().length;
const cluster 	= require('cluster');
const app       = require('../sys/app')();
if (cluster.isMaster && process.env.NODE_ENV!="dev") {
	for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

     cluster.on('exit', function (worker, code, signal) {
        cluster.fork();
     });
} else {
	app.listen(process.env.srvPorts || 3001);
}