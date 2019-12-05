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

//connecting to server
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
                users[socket.id].currentroom=data.room
                AddToRoom(data.room,socket.id)
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
    socket.on('IMHERE',function(data){
        rooms[users[socket.id].currentroom].responsefrom.push(socket.id)
        rooms[users[socket.id].currentroom][socket.id]['responsefrom']=data
        console.log(rooms)
        console.log(users)
        console.log(users[socket.id].currentroom)
        
    })
})


function SendOutCard(cards,user){

}


function SendAvailableRooms(socket){
    let roomsend=[];
    for(key in rooms){
        roomsend.push(key)
    }
    console.log("Sent available rooms")
    socket.emit('availablerooms',{
        'rooms':roomsend
    })
}






function CreateNewRoom(username){
    let newroomID=MakeRoomID()
    rooms[newroomID]={
        "users":[username],
        "visible":[true],
        "state":'lobby',
        "waiting":[],
        "responsefrom":[]        
    }
    users[username].currentroom=newroomID
    AddToRoom(newroomID,username)
    
}

//first room (0) is the game room
async function GameStart(actualRoomID){
    console.log("game started!!- GameStart()  "+actualRoomID)
    rooms[actualRoomID].state='ingame';
    //init starting deck
    initStartingDeck(actualRoomID)
    getNewHand(actualRoomID)
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

        //DUMMY WINNER STUFF
        for(let i=0;i<rooms[actualRoomID].users.length;i++){
            if(rooms[actualRoomID].users[i].responsefrom==''){
                rooms[actualRoomID].users[i].responsefrom=0
            }
        }
        if(rooms[actualRoomID][rooms[actualRoomID].users[0]].responsefrom>rooms[actualRoomID][rooms[actualRoomID].users[1]].responsefrom){
            console.log("The winner is : "+rooms[actualRoomID]['users'][0])
        }else{
            if(rooms[actualRoomID][rooms[actualRoomID].users[0]].responsefrom==rooms[actualRoomID][rooms[actualRoomID].users[1]].responsefrom){
                console.log("-------------- DRAW")
            }else{
                console.log("The winner is : "+rooms[actualRoomID]['users'][1])
            }
        }
        

        rooms[actualRoomID].responsefrom=[];
        console.log("end of cycle")
    }while(wincondition==true)
}

function waitingforresponseortime(gameroomid){
    let timer=setTimeout(function(){
            console.log("timer out!")
            timer="done";
        },5990);
    return new Promise(resolve=>{
        console.log("in the promisee")
        let myi=setInterval(function(){
            console.log("response from: "+rooms[gameroomid].responsefrom.length)
            if(timer=="done" || rooms[gameroomid].responsefrom.length==2){
                clearInterval(myi)
                clearTimeout(timer);
                resolve("done")
            }
        },1000)
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
    if(users[socketid].currentroom==''){
        return true
    }else{
        return false
    }
}

function AddToRoom(room,userid){
    rooms[room][userid]={
        "response":'',
        "Deck":[],
        "Gold":10,
        "Hand":[],
        "Graveyard":[],
        "Offered":[]
    }
}

function getNewHand(roomID){
    console.log(rooms[roomID])
    rooms[roomID].users.forEach(player => {
        console.log(player)
        let handdeckgraveyard=cardmanager.getHand(rooms[roomID][player].Hand,rooms[roomID][player].Deck,rooms[roomID][player].Graveyard)
        rooms[roomID][player].Hand=handdeckgraveyard.hand
        rooms[roomID][player].Deck=handdeckgraveyard.deck
        rooms[roomID][player].Graveyard=handdeckgraveyard.graveyard
    });
    console.log("-------------------- USER STAT")
    console.log(rooms[roomID])
}

function initStartingDeck(roomID){
    console.log("Starting deck init for each player")
    rooms[roomID].users.forEach(player => {
        rooms[roomID][player].Deck=cardmanager.initializeDeck()
        console.log("a deck "+rooms[roomID][player].Deck)
    });
}