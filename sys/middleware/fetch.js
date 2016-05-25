"use strict";
var timeout = 1000;
var http    = require('http');
var url     = require('url');
var https   =require('https');
var querystring = require('querystring');

// var data = yield fetch.post({
//         a: {
//             url: 'http://localhost:8080/',
//             data: {
//                 name: 1,
//                 age: 2
//             }
//         }
//     });



module.exports.get= function*(data) {
    "use strict";
    var promise = [];
    
    for (let key in data) {

        promise.push(
            new Promise((resolve, reject) => {
                var req = http.get(data[key], (res) => {
                        res.setEncoding('utf8');
                        var data = '';
                        res.on('data', (chunk) => {
                          data += chunk;
                        });
                        res.on('end', () => {
                            var result = {};
                            result[key] = data;
                            resolve(result);
                        })
                    })
                req.on('error',(err)=>{
                    reject(err.message);
                })
            })
        )
    }
        

    return yield Promise.all(promise).then((data) => {
            var result = {};
            try{
                data.forEach(item => {
                    for (var d in item) {
                        result[d] = JSON.parse(item[d]);
                    }
                })
                return result;
            }catch(e){
                return e.message;
            }
        
    }).catch((re) => {
        return re;
    });
}

module.exports.post = function*(data,useHttps){
    var promise = [];

    for(var key in data){
        var pathObj = url.parse(data[key].url,true),
        postData    = querystring.stringify(data[key].data);

        promise.push(
                    new Promise((resolve, reject) => {
                        var req = http.request({
                               hostname:pathObj.hostname,
                               port : pathObj.port || 80,
                               headers:{
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Content-Length': postData.length
                                },
                                path:pathObj.pathname,
                                method:'POST'
                        }, (res) => {
                                res.setEncoding('utf8');
                                var data = '';
                                res.on('data', (chunk) => {
                                  data += chunk;
                                });
                                res.on('end', () => {
                                    var result = {};
                                    result[key] = data;
                                    resolve(result);
                                })
                            })
                        req.on('error',(err)=>{
                            reject(err.message);
                        })

                        req.write(postData);
                        req.end();
                    })
                )
    }

    return yield Promise.all(promise).then((data) => {
            var result = {};
            try{
                console.log(data);
                data.forEach(item => {
                    for (var d in item) {
                        result[d] = JSON.parse(item[d]);
                    }
                })
                return result;
            }catch(e){
                return e.message;
            }
        
    }).catch((re) => {
        return re;
    });

    
}