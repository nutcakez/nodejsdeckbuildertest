var express=require("express");
var app=express();
var server=require("http").Server(app);

app.get("/",function(req,res){
    res.sendFile(__dirname+'/client.html');
})

server.listen(2000);
console.log("started the server");

var rooms=[];
var users=[];

var lobbyusers=[];
var game=[];

var io=require('socket.io')(server,{});
io.sockets.on('connection',function(socket){
    console.log("socket connection "+socket.id);
    users.push({
        'username':socket.id,
        'currentroom':''
    });
    SendAvailableRooms(socket);

    socket.on('showrooms',function(){
        console.log("server got the showrooms message")
        socket.emit('rooms',rooms);
        })


    socket.on('CreateNewRoom',function(){
        CreateNewRoom(socket.id);
        console.log(rooms.length);
        SendAvailableRooms(io);
        io.emit('rooms', rooms);
    })
    
    socket.on('joinroom',function(data){
        console.log("receiving joinroom attempt")
        console.log(rooms.length);
        console.log("find room outcome: "+FindRoom(data.room,rooms));
        if(FindRoom(data.room,rooms)>-1){
            socket.join(data.room);
            console.log("this is the index of it "+IndexOfRoom(data.room,rooms));
            rooms[IndexOfRoom(data.room,rooms)].users.push(socket.id);
        }
        else
        {
            console.log("no such room")
        }
        console.log(socket.id+"  user joined this room: "+data.room);
        console.log("current players inside: "+rooms[IndexOfRoom(data.room,rooms)].users)
    })

    socket.on('delayed',function(){
        var t=setTimeout(function(){
            io.emit('delayedmessage','potato');
        }, 3500);
    })

   
})



function CreateNewRoom(username){
    rooms.push({
        "roomid":username,
        "users":[username],
        "visible":[true]
    })
}

function CreateGame(username){

}

function SendAvailableRooms(socket){
    console.log("Sent available rooms")
    socket.emit('availablerooms',{
        'rooms':rooms
    })
}


function IndexOfRoom(roomid,roomarray){
    for (var i = roomarray.length - 1; i >= 0; i--) {
        if(roomarray[i].roomid==roomid){
            return i;
        }
    }
    return -1;
}

function FindRoom(roomid,roomarray){
    var idtoreturn=-1;
    roomarray.forEach(function(item,index){
        console.log(index+"   "+item.roomid);
        if(item.roomid==roomid && idtoreturn==-1){
            console.log("found");
            idtoreturn=index;
        }
    })
    return idtoreturn;
}