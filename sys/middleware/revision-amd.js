"use strict";
let path = require('path');
let fs = require('fs');
let crypto = require('crypto');
let util   = require('util');
let reg = /require(\([^\(\)]*\))/g,
    space = /\s+/g;

var parser = require('amd-parser');
var esprima= require('esprima');
var root = path.join(__dirname, '../../resource/es5/');

/**
 * 获取文件的依赖关系，并生成trunkjs需要的格式
 * @param  {[String or Arrray]} files [需要解析的文件列表]
 */
module.exports = function(files) {
    // var res = Object.create(result);
    var res = {
        baseUrl: 'http://ms0.meituan.net/',
        prefix: '',
        revision: {
            "jsPrefix": ""
        },
        revrev: "de4f1b8b",
        combo: {
            url: 'http://localhost:3001/service/com.a.b/testService/bb/?f=',
            deps: {}
        }
    };
    (typeof files == 'string' ? [files] : files).forEach(item => {
        item.indexOf('.js')== -1 && (item +='.js');
        var allDeps = [];
        var revision= {};
        getDeps(item, allDeps,revision);
        res.combo.deps[item] = allDeps.reverse();
        util._extend(res.revision,revision);
    })
    return res;
}

/**
 * 获取所有依赖
 */
function getDeps(url, all,revision) {
    url.indexOf('.js')== -1 && (url +='.js');
    var data = fs.readFileSync(`${root}${url}`).toString();
    	revision[url] = getMd5(data);
    var deps = parseDeps(data);
    if (deps.length > 0) {
        deps.forEach(item => {
            if (all.indexOf(item) == -1) {
                all.push(item);
                getDeps(item, all,revision);
            }
        })
    }
}
/*
 * 解析依赖
 */
function parseDeps(fileStr) {
    var arr = Object.keys(parser.parse(esprima.parse(fileStr))[0].dependencies),
    index  = arr.indexOf('exports');

    index >= 0 && arr.splice(index,1);
    return arr.map(item=>{return item.indexOf('.js') == -1?item+'.js':item});
    
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