"use strict";
let path    = require('path');
let fs      = require('fs');
let crypto  = require('crypto');
let util    = require('util');

let reg     = /require(\([^\(\)]*\))/g,
    space   = /\s+/g,
    isDev   = process.env.NODE_ENV == 'dev' ? true : false,
    root    = path.join(__dirname, '../../resource/es5/'),
    prefix  = 'es5/';

/**
 * 获取文件的依赖关系，并生成trunkjs需要的格式
 * @param  {[String or Arrray]} files [需要解析的文件列表]
 */
module.exports = function(file) {
    // var res = Object.create(result);
    var res = {
        baseUrl : process.env.base,
        prefix  : '',
        revision: {
            "jsPrefix": ""
        },
        revrev  : "de4f1b8b",
        combo   : {
            url  : process.env.comboAPI,
            deps : {}
        }
    };

    if(isDev){
        var allDeps  = [];
        var revision = {};
        getDeps(file, allDeps,revision);
        res.combo.deps[prefix+file] = Array.from(new Set(allDeps.reverse()));
        util._extend(res.revision,revision);
    }else{
        console.log(prefix + file);
        var config      = require('../../bin/config')[prefix+file] || {};
        res.revision    = config.revision;
        res.combo.deps  = config.deps;
    }
    // (typeof files == 'string' ? [files] : files).forEach(item => {


    // })
    return res;
}

/**
 * 获取所有依赖
 */
function getDeps(url, all,revision) {
    var data = fs.readFileSync(`${root}${url}`).toString();
    	revision[prefix+url] = getMd5(data);
    var deps = parseDeps(data);
    if (deps.length > 0) {
        deps.forEach(item => {
            all.push(prefix+item);
            getDeps(item, all,revision);
        })
    }
}
/*
 * 解析依赖
 */
function parseDeps(fileStr) {
    var result = [];
    var deps = fileStr.replace(space, '').match(reg) || [];
    for (var i = 0, len = deps.length; i < len; i++) {
        var dep = deps[i].replace("require(", '').replace(")", '').replace(/'/ig, '').replace(/"/ig, ''),
            f = dep.indexOf('.js') != -1 ? dep : dep + '.js';
        result.indexOf(f) == -1 && result.push(f);
    }
    return result;
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