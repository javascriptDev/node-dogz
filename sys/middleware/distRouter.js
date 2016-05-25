"use strict";
const url   = require('url');
const path  = require('path');
const reg   = require('path-to-regexp');

module.exports = function *(next) {
    //default router
    yield defaultRoute.apply(this, [url.parse(this.req.url.toLowerCase(), true).pathname.split('/'), this.method.toLowerCase()])
    return;
}
/**
 * 默认路由
 */
function * defaultRoute(info, method) {
   let ctlName = info[1],
        action = info.splice(2).join('/');
    if(ctlName == ''){
        yield require(`../../controller/index`)[method == 'get'? '/':`${method}#/`];
        return;
    }
    try {
        var controller = require(`../../controller/${ctlName}`);
        yield action == '' ? controller[method == 'get'? '/':`${method}#/`] : controller[Object.keys(controller).filter(function(operate){
            var _arr=operate.split("#");
            var last=_arr[_arr.length-1];
            //if(reg(action).exec(operate)){
            if(last==action){
               return  method == 'get' ? `${action}` : `${operate}`
            }
        })[0]]
    } catch (e) {
        console.trace(e.message);
        this.body = JSON.stringify(e.message)
    }
}