var app = require('http').createServer()
var io = require('socket.io')(app);
var PORT = 8081;
var users = [];
var players = [];
var guess = ['刺猬','松鼠','鲸鱼','美人鱼','猫咪','大象','骆驼'];
var guesser = null;
var drawer = 0;

app.listen(PORT);
io.on('connection', function (socket) {
    /*是否是新用户标识*/
    var isNewPerson = true; 
    /*当前登录用户*/
    var username = null;
    /*监听登录*/
    socket.on('login',function(data){
        console.log('suibian');
        name = data.username;
        for(var i=0;i<users.length;i++){
            if(users[i].username === data.username){
                isNewPerson = false
                break;
            }else{
                isNewPerson = true
            }
        }
        username = data.username;
        if(isNewPerson){
            
            users.push({
              username:data.username
            })
            /*登录成功*/
            socket.emit('loginSuccess',data)
            /*向所有连接的客户端广播add事件*/
            io.sockets.emit('add',data)
        }else{
            /*登录失败*/
            socket.emit('loginFail','')
        }  
    })

    socket.on('disconnect',function(){
        /*向所有连接的客户端广播leave事件*/
        io.sockets.emit('leave',username)
        users.map(function(val,index){
            if(val.username === username){
                users.splice(index,1);
            }
        })
     })
     socket.on('sendMessage',function(data){
        io.sockets.emit('receiveMessage',data)
    })


    socket.on('joinroom',function(data){
        socket.join(data,function(){
            var num = players.length;
            io.sockets.in(data).emit('addroom',username,num);
            players.push(username);
            console.log(players);
            console.log("here is socket.id");
            console.log(socket.id);
        })
    })

    socket.on('leaveroom',function(){
        console.log('shoudaola');
        socket.leave(1,function(){
            console.log('here?');
            io.sockets.emit('notroom',username);
            var set =players.indexOf(username);
            players.splice(set,1);
        })
    })

    var pre = 0;
    socket.on('preing',function(){
        pre = pre + 1;
        var total = players.length - pre;
        socket.emit("prepare",total);
    })
    socket.on('unpreing',function(){
        pre = pre - 1;
        var total = players.length - pre;
        socket.emit("prepare",total);
    })

        socket.on('newdraw',function(data){
            console.log('send picture.');
            io.sockets.in(1).emit('newpic',data);
        })

    socket.on('start',function(){
        io.sockets.emit('drawer',players[drawer]);
        drawer = drawer + 1;
        if(drawer == players.length)
            drawer = 0;
    })

    socket.on('secret',function(data){
        guesser = guess[Math.floor(Math.random()*guess.length)];
        io.sockets.connected[data].emit('toDrawer',guesser);
    })

    socket.on('sendMessages',function(data){
        io.sockets.in(1).emit('receiveMessages',data)
            if(data.message === guesser)
            io.sockets.in(1).emit('right',data.username);        
            console.log("here is guesser");
    console.log(guesser);
        })

    console.log('app listen at'+PORT);
})
