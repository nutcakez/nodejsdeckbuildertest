var express=require("express");
var app=express();
var server=require("http").Server(app);
var cardmanager=require('./cards.js');
app.get("/",function(req,res){
    res.sendFile(__dirname+'/client.html');
})

app.get("/style.css",function(req,res){
    res.sendFile(__dirname+'/style.css');
})

server.listen(2000);
console.log("started the server");

var p1deck=[1,1,3];
var p2deck=[2,2,2];

console.log(cardmanager.fightcalculating(p1deck,p2deck));
console.log(cardmanager.buyroundcards())

var rooms={};
var users={};

var lobbyusers=[];
var game={};
//v lookup on the customer
//pop up 

//Range("C2490").Value = Application.WorksheetFunction.VLookup(Range("A2490"), Range("A1: C2488"), 3, 0)
var io=require('socket.io')(server,{});
io.sockets.on('connection',function(socket){
    console.log("socket connection "+socket.id);
    socket.emit('connected',"alma");
    users[socket.id]={'currentroom':''};
    // users.push({
    //     'username':socket.id,
    //     'currentroom':''
    // });
    SendAvailableRooms(socket);


    //create room
    socket.on('CreateNewRoom',function(){
        if(notinanyroom(socket.id)){
            CreateNewRoom(socket.id);
            SendAvailableRooms(io);
            io.emit('rooms', rooms);
        }else{
            console.log("already in a room, cant create another")
        }
    })
    
    //join room
    socket.on('joinroom',function(data){
        console.log("receiving joinroom attempt")
        ///if room exists
        console.log("user ID: "+socket.id)
        console.log("already in the room: "+ rooms[data.room].users)
        if(rooms.hasOwnProperty(data.room)){
            socket.join(data.room);
            if(rooms[data.room].users[0]!=socket.id && rooms[data.room].users.length!=2)
            {
                rooms[data.room].users.push(socket.id);
                console.log('success of join')
            }
            else
            {
                console.log("this user is either in the room or the game has started already")
            }
        }
        else
        {
            console.log("no such room")
        }
        //console.log(socket.id+"  user joined this room: "+data.room);
        //console.log("current players inside: "+rooms[IndexOfRoom(data.room,rooms)].users)
        if(rooms[data.room].users.length>1){
                console.log(rooms[data.room].users)
                GameStart(data.room);
        }
        else
        {
            console.log("Not starting the game")
        }
    })


    //buy the card
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
async function GameStart(actualRoomID){
    console.log("game started!!- GameStart()  "+actualRoomID)
    rooms[actualRoomID].state='ingame';
    let gamestarted=true;
    let wincondition=false;
    let reactionchecker=[];
    let timeover=false;
    let timer;
    let interval;
    do{
        await waitingforresponseortime(actualRoomID);
        timeover=false;
        //communicate the outcome
        //communicate the buy choices
        //wait for the buy choices messages
        rooms[actualRoomID].responsefrom=[];
        console.log("end of cycle")
    }while(wincondition==false)
}

function waitingforresponseortime(gameroomid){
    console.log("started the function")
    let timer=setTimeout(function(){
            console.log("timer out!")
            timer="done";
        },6000);
    return new Promise(resolve=>{
        console.log("in the promisee")
        let myi=setInterval(function(){
            console.log("Cycle")
            if(timer=="done" || rooms[gameroomid].responsefrom.length==2){
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

 function notinanyroom(socketid){

 }