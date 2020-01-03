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
app.get("/teststyle.css",function(req,res){
    res.sendFile(__dirname+'/teststyle.css');
})
app.get("/clientcards.js",function(req,res){
    res.sendFile(__dirname+'/clientcards.js');
})
app.get("/pic1.jpg",function(req,res){
    res.sendFile(__dirname+'/pic1.jpg');
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
var io=require('socket.io')(server,{});

//connecting to server
io.sockets.on('connection',function(socket){
    console.log("socket connection "+socket.id);
    socket.emit('connected',socket.id);
    users[socket.id]={'currentroom':''};
    // users.push({
    //     'username':socket.id,
    //     'currentroom':''
    // });
    SendAvailableRooms(socket);

    setInterval(function(){
        socket.emit('message',{
            socketid:socket.id,
            time:new Date()
        })
    },1000)

    //create room
    socket.on('CreateNewRoom',function(){
        if(notinanyroom(socket.id)){
            CreateNewRoom(socket.id,socket);
            SendAvailableRooms(io);
            //io.emit('rooms', rooms);
        }else{
            console.log("already in a room, cant create another")
        }
    })
    
    //join room
    socket.on('joinroom',function(data){
        ///if room exists
        console.log("user ID: "+socket.id)
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
                rooms[data.room].visible=false;
                SendAvailableRooms(io);
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
    socket.on('response',function(data){
        let roomid=users[socket.id].currentroom
        rooms[roomid].responsefrom.push(socket.id)
        rooms[roomid][socket.id]['responsefrom']=data
    })
})





function SendAvailableRooms(socket){
    let roomsend={};
    for(key in rooms){
        if(rooms[key].visible==true)
        {
            roomsend[key]=rooms[key].users.length
        }
    }
    socket.emit('availablerooms',{
        'rooms':roomsend
    })
}






function CreateNewRoom(username,user){
    let newroomID=MakeRoomID()
    rooms[newroomID]={
        "users":[username],
        "visible":true,
        "state":'lobby',
        "waiting":[],
        "responsefrom":[]        
    }
    users[username].currentroom=newroomID
    AddToRoom(newroomID,username)
    user.emit('connectedroom',newroomID)
}

//first room (0) is the game room
async function GameStart(actualRoomID){
    console.log("game started!!- GameStart()  "+actualRoomID)
    rooms[actualRoomID].state='ingame';
    //sending out gamestart 
    SendGameStart(actualRoomID)
    //init starting deck
    initStartingDeck(actualRoomID)
    
    let gamestarted=true;
    let wincondition=false;
    let reactionchecker=[];
    let timeover=false;
    let timer;
    let interval;
    do{
        //get hand for player
        getNewHand(actualRoomID)

        //send out hand
        SendOutHand(actualRoomID)

        await waitingforresponseortime(actualRoomID);
        timeover=false;
        console.log("megy")
        //check if there's enough gold to hire units
        ValidateResponse(actualRoomID)

        //calculate outcome/update status/return info to player
        CalculateFight(actualRoomID)

        //clear the response from field in room/user
        ClearResponse(actualRoomID)

        //update hand and graveyard
        UpdateHandGraveyard(actualRoomID)
        
        //communicate the outcome
        StatusUpdate(actualRoomID)
        
        //remove dead players
        RemovePlayers(actualRoomID)


        //communicate the buy choices
        CardBuy(actualRoomID)

        //wait for buy choices responses
        await waitingforresponseortime(actualRoomID)            

        

        console.log("end of cycle")
    }while(wincondition==true)
}

function waitingforresponseortime(gameroomid){
    let timer=setTimeout(function(){
            console.log("timer out!")
            timer="done";
        },6700);
    return new Promise(resolve=>{
        console.log("in the promisee")
        let myi=setInterval(function(){
            console.log("response from: "+rooms[gameroomid].responsefrom.length)
            if(timer=="done" || rooms[gameroomid].responsefrom.length==2){
                clearInterval(myi)
                clearTimeout(timer);
                resolve("done")
            }
        },500)
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
        "response":[],
        "Deck":[],
        "Gold":10,
        "Life":20,
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
    rooms[roomID].users.forEach(player => {
        rooms[roomID][player].Deck=cardmanager.initializeDeck()
    });
}

function SendOutHand(actualRoomID){
    rooms[actualRoomID].users.forEach(playerID=>io.to(playerID).emit('hand',rooms[actualRoomID][playerID].Hand))
}

function SendGameStart(gameroomid){
    rooms[gameroomid].users.forEach(player => {
        io.to(player).emit('gamestart')
    });
}

function CalculateFight(roomID){
    let p1id=rooms[roomID].users[0]
    let p2id=rooms[roomID].users[1]
    let p1deck=[];
    let p2deck=[];
   
    

    rooms[roomID][p1id].responsefrom.forEach(element => {
        p1deck.push(rooms[roomID][p1id].Hand[element])
    });

    rooms[roomID][p2id].responsefrom.forEach(element => {
        p2deck.push(rooms[roomID][p2id].Hand[element])
    });
    

    let result=cardmanager.fightcalculating(p1deck,p2deck)
    
    rooms[roomID][p1id].Life=rooms[roomID][p1id].Life-result.p1.lifeloss;
    rooms[roomID][p2id].Life=rooms[roomID][p2id].Life-result.p2.lifeloss;
    
}

function StatusUpdate(roomID){
    let gamestatus={}
    rooms[roomID].users.forEach(userid => {
        console.log(rooms[roomID][userid])
        gamestatus[userid]={
            'Life':rooms[roomID][userid].Life,
            'Gold':rooms[roomID][userid].Gold,
            'Deck':rooms[roomID][userid].Deck.length,
            'Graveyard':rooms[roomID][userid].Graveyard.length
        }
    });
    rooms[roomID].users.forEach(userid=>{
        io.to(userid).emit('status',gamestatus)
    })
}

function ValidateResponse(roomID){
    let p1id=rooms[roomID].users[0]
    let p2id=rooms[roomID].users[1]
    let sum=0

    rooms[roomID][p1id].responsefrom.forEach(element => {
        sum=sum+cardmanager.Cards[rooms[roomID][p1id].Hand[element]].cost
    });
    if(sum>rooms[roomID][p1id].Gold){
        rooms[roomID][p1id].response=[]
    }
    else
    {
        rooms[roomID][p1id].Gold=rooms[roomID][p1id].Gold-sum
    }
    sum=0;


    rooms[roomID][p2id].responsefrom.forEach(element => {
        console.log(cardmanager.Cards[rooms[roomID][p2id].Hand[element]]+"   "+cardmanager.Cards[rooms[roomID][p2id].Hand[element]].cost)
        sum=sum+cardmanager.Cards[rooms[roomID][p2id].Hand[element]].cost
    });
    if(sum>rooms[roomID][p2id].Gold){
        rooms[roomID][p2id].response=[]
    }
    else
    {
        console.log("p2 basic gold "+rooms[roomID][p2id].Gold)
        rooms[roomID][p2id].Gold=rooms[roomID][p2id].Gold-sum
    }
}

function UpdateHandGraveyard(roomID){
    console.log("starting hdg")
    rooms[roomID].users.forEach(userID => {
        let updatedstatus=cardmanager.UpdateHDG(rooms[roomID][userID].Hand,rooms[roomID][userID].Deck,rooms[roomID][userID].Graveyard)
        rooms[roomID][userID].Hand=updatedstatus.Hand
        rooms[roomID][userID].Deck=updatedstatus.Deck
        rooms[roomID][userID].Graveyard=updatedstatus.Graveyard
    });
}

function CardBuy(roomID){
    rooms[roomID].users.forEach(playerid => {
        rooms[roomID][playerid].Offered=cardmanager.buyroundcards()
        console.log(rooms[roomID][playerid].Offered)
        io.to(playerid).emit('buyround',rooms[roomID][playerid].Offered)
    });
}

function ClearResponse(roomID){
    rooms[roomID].responsefrom=[]
    rooms[roomID].users.forEach(playerID => {
        rooms[roomID][playerID].responsefrom=[]
    });
    console.log("----------------")
    console.log(rooms[roomID])
}

function RemovePlayers(roomID){
    let lostplayers=[]
    rooms[roomID].users.forEach(playerID => {
        if(rooms[roomID][playerID].Life<=0){
            lostplayers.push(playerID)
        }
    });

    lostplayers.forEach(playerID => {
        let indexOfPlayer=rooms[roomID].users.indexOf(playerID)
        rooms[roomID].users=rooms[roomID].users.splice(indexOfPlayer,1)
    });
}