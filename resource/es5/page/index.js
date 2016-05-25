define("page/index",function(require,exports,module){
'use strict';

//使用
var ws = new WS({
    server: 'http://localhost:3000/'
});

ws.connect('ws://localhost:8888');

//自定义事件
ws.on('haha', function (data) {
    console.log(data);
});

//内置事件
ws.on('online', function (data) {
    console.log(data);
});
// ws.setEventType('haha');
document.querySelector('#aa').onclick = function (e) {

    // 触发事件
    ws.emit('haha', {
        msg: 'asdasd',
        to: 'R62-7c849e-c6aee'
    });
};
})