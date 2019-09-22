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


var io=require('socket.io')(server,{});
io.sockets.on('connection',function(socket){
    console.log("socket connection "+socket.id);
    users.push(socket.id);
    SendAvailableRooms(socket);
    socket.emit('test');
    socket.on('join',function(data){
        console.log(data.roomnumber)
    })

    socket.on('showrooms',function(){
        console.log("server got the showrooms message")
        socket.emit('rooms',{'rooms':rooms});
        })


    socket.on('CreateNewRoom',function(){
        CreateNewRoom(socket.id);
        console.log(rooms.length);
        SendAvailableRooms(io);

    })
    

   
})



function CreateNewRoom(username){
    rooms.push({
        "users":[username],
        "visible":[true]
    })
}

function SendAvailableRooms(socket){
    console.log("Sent available rooms")
    socket.emit('availablerooms',{
        'rooms':rooms
    })
}






class Room{
    constructor(roomID,userID){
        this.roomID=roomID;
        this.userID=userID;
        this.members=[];
        this.members.push(userID);
        this.visible=true;
    }
    UserJoin(userID) {
        this.members.push(userID);
        this.visible=false;    
    }
    UserLeave(userID){
        
    }
}