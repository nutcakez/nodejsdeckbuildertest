var express=require("express");
var request=require('request');
var app=express();
var server=require("http").Server(app);
var cardmanager=require('./cards.js');
app.get("/",function(req,res){
    res.sendFile(__dirname+'/client.html');
})

server.listen(2000);
console.log("started the server");

var p1deck=[1,1,3];
var p2deck=[2,2,2];

console.log(cardmanager.fightcalculating(p1deck,p2deck));

var rooms={};
var users={};

var lobbyusers=[];
var game=[];

var io=require('socket.io')(server,{});
io.sockets.on('connection',function(socket){
    console.log("socket connection "+socket.id);
    users[socket.id]={'currentroom':''};
    // users.push({
    //     'username':socket.id,
    //     'currentroom':''
    // });
    SendAvailableRooms(socket);



    socket.on('CreateNewRoom',function(){
        CreateNewRoom(socket.id);
        SendAvailableRooms(io);
        io.emit('rooms', rooms);
    })
    
    socket.on('joinroom',function(data){
        console.log("receiving joinroom attempt")
        ///if room exists
        if(rooms.hasOwnProperty(data.room)){
            socket.join(data.room);
            rooms[data.room].users.push(socket.id);
            console.log('success of join')
        }
        else
        {
            console.log("no such room")
        }
        console.log(socket.id+"  user joined this room: "+data.room);
        console.log("current players inside: "+rooms[IndexOfRoom(data.room,rooms)].users)
        if(rooms[data.room].users.length>1){
                GameStart();
        }
        else
        {
            console.log("noppeee")
        }
    })

    socket.on('delayed',function(){
        var t=setTimeout(function(){
            io.emit('delayedmessage','potato');
        }, 3500);
    })

    socket.on('IMHERE',function(){
        if(rooms[0].responsefrom.length==0){
            rooms[0].responsefrom.push(socket.id);
        }
        else
        {
            if(rooms[0].responsefrom.length==1 && rooms[0].responsefrom[0]!=socket.id){
                rooms[0].responsefrom.push(socket.id);
            }
        }
    })
   
    socket.on('mymessage',function(){
       io.to(users[1].username).emit('pew')
    })

    socket.on('buycard',function(data){

    })
    
})


function SendOutCard(cards,user){

}


function SendAvailableRooms(socket){
    console.log("Sent available rooms")
    socket.emit('availablerooms',{
        'rooms':rooms
    })
}






function CreateNewRoom(username){
    rooms[MakeRoomID()]={
        "users":[username],
        "visible":[true],
        "state":'lobby',
        "waiting":[],
        "responsefrom":[],
        "P1Deck":[],
        "P2Deck":[],
        "P1Gold":10,
        "P2Gold":10,
        "P1Hand":[],
        "P2Hand":[],
        "P1Used":[],
        "P2Used":[],
        "P1Offered":[],
        "P2Offered":[]
    }
}

//first room (0) is the game room
async function GameStart(){
    console.log("game started!!- GameStart()")
    rooms[0].state='ingame';
    let gamestarted=true;
    let wincondition=false;
    let reactionchecker=[];
    let timeover=false;
    let timer;
    let interval;
    do{
        await waitingforresponseortime();
        timeover=false;
        rooms[0].responsefrom=[];
        console.log("end of cycle")
    }while(wincondition==false)
}

function waitingforresponseortime(){
    console.log("started the function")
    let timer=setTimeout(function(){
            console.log("timer out!")
            timer="done";
        },6000);
    return new Promise(resolve=>{
        console.log("in the promisee")
        let myi=setInterval(function(){
            console.log("Cycle")
            if(timer=="done" || rooms[0].responsefrom.length==2){
                console.log("if is done")
                clearInterval(myi)
                resolve("done")
            }
        },250)
    })
}

function MakeRoomID() {
    let roomID='';
    var characters='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i = 0; i < 10; i++ ) {
        roomID += characters.charAt(Math.floor(Math.random() * Math.floor(characters.length)));
    }
    return roomID;
 }