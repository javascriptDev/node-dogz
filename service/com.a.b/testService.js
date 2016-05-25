  "use strict";
 let url = require('url');
 let fetch = require('../../sys/middleware/fetch.js');
 let fs  = require('fs');
 let path = require('path');
 var root = path.join(__dirname, '../../resource/');
 let crypto = require('crypto');
var uglify = require('uglify-js');


 var instance = null;
 class testService {
     constructor() {}
     aa(params, koa) {
         return function * () {
            return {
                a:1
            }
         }
     }
     bb(params, koa) {
         var files = url.parse(koa.url, true).query.f.split(';');
         return this.getStr(files);
     }
     getStr(files) {
     	var result = [];
         files.forEach(item => {
             var nameAndVer = item.split(':')[1].split('@'),
                version = nameAndVer[1],
                url = nameAndVer[0],
                 fileStr = cps(`${root}${url}`),
                 res = `${fileStr}`;
                 // res = `/*___meta___${item}*/\r\n${fileStr}`;

                 result.push({
                 	file  : url,
                    diff:[
                        {
                            start : 0,
                            end   : 0,
                            content   : res
                        }
                    ]
                 })
			


         })
         return result;
     }
 }
 module.exports = function() {
     if (!instance) {
         return new testService();
     } else {
         return instance;
     }
 }


/**
 * 获取md5
 * @param  {[String]} str [原始字符串]
 */
function getMd5(str){
    var str = str;
    var md5um = crypto.createHash('md5');
    md5um.update(str);
    return md5um.digest('hex').substr(0,8);
}

function cps(file){
   return  uglify.minify([file], {
                    //替换变量的时候,不替换require
                    mangle: {
                        except: ['require']
                    },
                    compress: {
                        drop_debugger: true,
                        //discard unreachable code
                        dead_code: true,
                        // drop unused variables/functions
                        unused: true
                    }
                }).code;
}