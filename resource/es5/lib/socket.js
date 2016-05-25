!function(win){
    var img = new Image();

     function WS(opt){
        this.socket = {},
        this.emitServer = opt.server,
        this.tryTime = 10,
        this.heartBeatTimer = 0,
        this.hbDuration = 25*1000,
        this.eventType = '',
        this.subEvent = {}
    }
    WS.prototype = {
        connect :function(ip){
            clearInterval(this.heartBeatTimer);
            delCookie('sid');

            this.ip = ip;

            var websocket = new WebSocket(ip);
            var me = this;

            this.socket  = websocket;
           
            // 连接状态
            // const unsigned short OPEN = 1;
            // const unsigned short CLOSING = 2;
            // const unsigned short CLOSED = 3;
            
            //连接开启，并且准备好通信
            websocket.onopen = function(evt){
                console.log('连接建立完成。。。。');
                me.socket.__id = getCookie('sid');

                me.emit('online', {
                    msg : me.socket.__id + ' : online!',
                });


                me.tryTime = 10;
                me.heartBeat();
            }
            
            websocket.onclose = function (evt){
                console.log('连接关闭，正在重连。。。');

                me.tryTime--;
                if(me.tryTime < 0)return;
                
                me.connect(me.ip);
            }
            
            websocket.onmessage = function (evt) {
                evt = JSON.parse(evt.data);
                var type = evt.mtype,msg = evt.msg,handler = me.subEvent[type];
                 
                typeof handler == 'function' && handler(msg);

            };
            
            websocket.onerror = function (evt) {
                console.log(evt+'\r\n' + '正在重连。。。');
                me.tryTime--;
                if(me.tryTime < 0)return;
                
                me.connect(me.ip);
            };

            
            return this;
        },
        heartBeat:function(){
            var me = this;
            this.heartBeatTimer = setInterval(function(){
                 me.socket.send('~');
             },this.hbDuration)
        },
        on:function(eventname,handler){
            if(this.subEvent[eventname])
                console.log('this eventName ' + eventname + 'is existed~ please try another..');
            this.subEvent[eventname] = handler;
        },
        un:function(eventname){
            delete this.subEvent[eventname];
        },
        emit:function(eventname,data){
            typeof data == 'string' && (data = {msg:data});

            var to      = data.to ? '&to='+ data.to :'',
                group   = data.group ? '&group=' + data.group : '',
                msg     = 'msg='+ data.msg || '',
                mtype   = (eventname || this.eventType) ? '&mtype=' + eventname : ''

            img.src = [this.emitServer,'?',msg,to,group,mtype].join('')
        },
        setEventType : function(type){
            this.eventType = type;
        }
    }
    win.WS = WS;

    
    function guid(isLong) {
        return (isLong ? 'Rxx-xxxxxx-xxxxx' : 'Rx-xxxx-xxxx').replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    function getCookie(name) 
    { 
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
     
        if(arr=document.cookie.match(reg))
     
            return unescape(arr[2]); 
        else 
            return null; 
    } 
    function delCookie(name) 
    { 
        var exp = new Date(); 
        exp.setTime(exp.getTime() - 1); 
        var cval=getCookie(name); 
        if(cval!=null) 
            document.cookie= name + "="+cval+";expires="+exp.toGMTString(); 
    }

}(window)
   