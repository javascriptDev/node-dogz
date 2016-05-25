"use strict";
const url   = require('url');
const path  = require('path');
const fs    = require('fs');
const reg   = require('path-to-regexp');

module.exports = function *(next) {
    let method = this.method.toLowerCase(),
        uri = this.req.url,
        info = url.parse(uri, true).pathname.split('/');

    yield delCache;
    //services handler
    if ('service' == info[1]) {
        yield service.call(this, info);
        return;
    }
    //default router
    yield defaultRoute.apply(this, [info, method])
    return;
}
/**
 * 删除缓存的module
 */
function * delCache() {

        for (let i in require.cache) {
            ['controller', 'bin', 'gulp-plugin', 'middleware', 'service'].forEach(mid => {
                if (i.indexOf(mid) != -1) {
                    delete require.cache[i];
                }
            })
        }
}
/**
 * 处理 mock
 */
function * service(info) {
    var pkg = info[2],
        cls = info[3],
        insMeth = info[4];
    try {
        let result = yield require(`../../service/${pkg}/${cls}`)()[insMeth](this.query, this);
        var res = '';
        this.query.callback ? res = `${this.query.callback}(${JSON.stringify(result)})` : res = JSON.stringify(result);
        this.body = res;
    } catch (e) {
        console.trace(e.message);
        this.body = e.message;
    }
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
// function *getUserRouter(uri,method){
//        let userRouter  = Object.keys(routers).filter( router => {
//             let kv = router.split('#'),reqMethod,reqUrl;
//             kv.length == 1 ? (reqMethod = 'get',reqUrl = kv[0]) : (reqMethod = kv[0].toLowerCase(),reqUrl = kv[1]);
//             if(method == reqMethod && null != reg(reqUrl).exec(url.parse(uri).pathname)){
//                 return router;
//             }
//         })
//         if(userRouter.length != 0){
//             yield routers[userRouter[0]];
//             return 1
//         }else{
//             return 0;
//         }
// }