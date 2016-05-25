"use strict";

/* 
redis publisher
 消息方式：
 1.点对点
 2.组播
 3.广播
 */

const http  = require('http');
const redis = require("redis");
const url   = require('url');

let publisher = redis.createClient({
    host: '127.0.0.1',
    port: 6379
});

const hostname  = '127.0.0.1';
const port      = process.env.pubport;
const server    = http.createServer((req, res) => {
    console.log(req.url);
    let query     = url.parse(req.url, true).query,
        group     = query.group || '',
        msg       = query.msg,
        to        = query.to || '',
        eventType = query.type,
        mtype     = query.mtype;

        console.log(query);

    if(!msg){return;}

    if(group){//组播

    }else if(to){//点对点
        publisher.get(to,function(err,serverID){
            console.log(`event = ${serverID}#${eventType || "text/plain"}`)
            publisher.publish(`${serverID}#${eventType || "text/plain"}`, JSON.stringify({
                to    : [to],
                msg   : msg,
                mtype : mtype
            })); 
            res.end('published');
        })
    }else{//广播
        publisher.publish("broadcast", JSON.stringify({
            msg   : msg,
            mtype : mtype
        }));
        res.end('published');
    } 
});

server.listen(process.env.pubport, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});