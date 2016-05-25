//使用
var ws = new WS({
    server: 'http://localhost:3000/'
});

ws.connect('ws://localhost:8888')

var $users = $('.left');
var $txt = $('.content');

//自定义事件
ws.on('haha', function(data) {
	$('<div class=item>'+data.from+' : '+data.msg+'</div>').appendTo($txt);
})

//内置事件
ws.on('online', function(data) {
	if(data.msg!=ws.socket.__id){
		$('<div class=user>'+data.msg+'</div>').appendTo($users);	
	}
    
})

ws.on('offline', function(data) {
    console.log(data);
})

// ws.setEventType('haha');
document.querySelector('#aa').onclick = function(e) {

    // 触发事件
    ws.emit('haha', {
        msg: 'asdasd'
    });
}