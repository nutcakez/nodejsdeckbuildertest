var express=require("express");
var app=express();
var server=require("http").Server(app);
var cardmanager=require('./cards.js');
app.use(express.static('dist'));
app.get("/style.css",function(req,res){
    res.sendFile(__dirname+'/style.css');
})
app.get("/teststyle.css",function(req,res){
    res.sendFile(__dirname+'/style.css');
})
app.get("/clientcards.js",function(req,res){
    res.sendFile(__dirname+'/clientcards.js');
})
app.get("/pic1.jpg",function(req,res){
    res.sendFile(__dirname+'/pic1.jpg');
})
server.listen(process.env.PORT);
console.log("started the server");

var p1deck=[1,1,3];
var p2deck=[2,2,2];


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
    SendAvailableRooms(socket);


    //create room
    socket.on('CreateNewRoom',function(){
        if(notinanyroom(socket.id)){
            CreateNewRoom(socket.id,socket);
            SendAvailableRooms(io);
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
        console.log(data.room)
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

    
    socket.on('hand',function(){
        socket.emit('hand')
    })

    socket.on('response',function(data){
        let roomid=users[socket.id].currentroom
        rooms[roomid].responsefrom.push(socket.id)
        rooms[roomid][socket.id]['response']=data
    })

    socket.on('setname',function(data){
        users[socket.id].nickname=data;
    })

    socket.on('surrender',function(){
        console.log('got surrender')
        rooms[users[socket.id].currentroom][socket.id].Life=0
        RemovePlayers(users[socket.id].currentroom)
    })
})





function SendAvailableRooms(socket){
    let roomsend=[];
    for(key in rooms){
        if(rooms[key].visible==true)
        {
            roomsend.push({'roomid':key,'users':rooms[key].users.length})
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
        "BoughtCards":[],
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
    let wincondition=true;
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
        //check if there's enough gold to hire units
        ValidateResponse(actualRoomID)

        //calculate outcome/update status/return info to player
        CalculateFight(actualRoomID)

        //clear the response from field in room/user
        ClearResponse(actualRoomID)

        //update hand and graveyard
        UpdateHandDeckGraveyard(actualRoomID)
        
        //remove dead players
        RemovePlayers(actualRoomID)

        //communicate the outcome
        StatusUpdate(actualRoomID)

        
        if(rooms[actualRoomID].users.length>1)
        {
            //communicate the buy choices
            CardBuy(actualRoomID)

            //wait for buy choices responses
            await waitingforresponseortime(actualRoomID)            
            timeover=false;
            //validate and add to deck that card
            ValidateCardBuy(actualRoomID)

            //Add gold for users
            GoldRound(actualRoomID)

            StatusUpdate(actualRoomID)

            //communicate bought cards
            BoughtCards(actualRoomID)
        }
        else
        {
            wincondition=false;

            //communicate to the winner
            WinnerCommunicate(actualRoomID)
        }
        
    }while(wincondition==true)
}

function waitingforresponseortime(gameroomid){
    let timer=setTimeout(function(){
            timer="done";
        },12700);
    return new Promise(resolve=>{
        let myi=setInterval(function(){if(timer=="done" || rooms[gameroomid].responsefrom.length==2){
                clearInterval(myi)
                clearTimeout(timer);
                rooms[gameroomid].responsefrom=[]
                resolve("done")
            }
        },100)
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
        "Gold":5,
        "Life":20,
        "Hand":[],
        "Graveyard":[],
        "Offered":[]
    }
}

function getNewHand(roomID){
    rooms[roomID].users.forEach(player => {
        let handdeckgraveyard=cardmanager.getHand(rooms[roomID][player].Hand,rooms[roomID][player].Deck,rooms[roomID][player].Graveyard)
        rooms[roomID][player].Hand=handdeckgraveyard.hand
        rooms[roomID][player].Deck=handdeckgraveyard.deck
        rooms[roomID][player].Graveyard=handdeckgraveyard.graveyard
    });
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
   
    let history={};
    

    rooms[roomID][p1id].response.forEach(element => {
        p1deck.push(rooms[roomID][p1id].Hand[element])
    });

   

    rooms[roomID][p2id].response.forEach(element => {
        p2deck.push(rooms[roomID][p2id].Hand[element])
    });
    
    


    let result=cardmanager.fightcalculating(p1deck,p2deck)
    
    rooms[roomID][p1id].Life=rooms[roomID][p1id].Life-result.p1.lifeloss;
    rooms[roomID][p2id].Life=rooms[roomID][p2id].Life-result.p2.lifeloss;
    
    history={
        "p1":{
            "id":p1id,
            "deck":p1deck,
            "attack":result.p1.attack,
            "defense":result.p1.defense,
            "damage":result.p1.lifeloss
        },
        "p2":{
            "id":p2id,
            "deck":p2deck,
            "attack":result.p2.attack,
            "defense":result.p2.defense,
            "damage":result.p2.lifeloss
        }
    }

    HistoryCommunicate(roomID,history)
}

function StatusUpdate(roomID){
    let gamestatus={}
    rooms[roomID].users.forEach(userid => {
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

    rooms[roomID][p1id].response.forEach(element => {
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

    try{
        rooms[roomID][p2id].response.forEach(element => {
            sum=sum+cardmanager.Cards[rooms[roomID][p2id].Hand[element]].cost
        });
        if(sum>rooms[roomID][p2id].Gold){
            rooms[roomID][p2id].response=[]
        }
        else
        {
            rooms[roomID][p2id].Gold=rooms[roomID][p2id].Gold-sum
        }
    }catch(error){
        console.log('a player might have surrendered')
    }
    
}

function UpdateHandDeckGraveyard(roomID){
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
        io.to(playerid).emit('buyround',rooms[roomID][playerid].Offered)
    });
}

function ClearResponse(roomID){
    rooms[roomID].responsefrom=[]
    rooms[roomID].users.forEach(playerID => {
        rooms[roomID][playerID].response=[]
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
        io.to(playerID).emit('lost')
        rooms[roomID].users.splice(indexOfPlayer,1)

        
    });
    console.log(rooms[roomID.users])
}

function ValidateCardBuy(roomID){
    rooms[roomID].BoughtCards=[]
    rooms[roomID].users.forEach(playerid=>{
        if(rooms[roomID][playerid].response.length>0){
            let cardid=rooms[roomID][playerid].Offered[rooms[roomID][playerid].response[0]]
            let price=cardmanager.Cards[cardid].cost;
            if(price<=rooms[roomID][playerid].Gold){
                rooms[roomID][playerid].Gold=rooms[roomID][playerid].Gold-price
                rooms[roomID][playerid].Deck.push(cardid)
                rooms[roomID].BoughtCards.push({[playerid]:cardid})
            }
            else
            {
                rooms[roomID].BoughtCards.push({[playerid]:''})
            }
        }
        else
        {
            rooms[roomID].BoughtCards.push({[playerid]:''})
        }
    })
}

function GoldRound(roomID){
    rooms[roomID].users.forEach(userid => {
        rooms[roomID][userid].Gold=rooms[roomID][userid].Gold+3
    })

}

function BoughtCards(roomID){
    rooms[roomID].users.forEach(userid=>{
        io.to(userid).emit('boughtcards',rooms[roomID].BoughtCards)
    })
}

function WinnerCommunicate(roomID){
    io.to(rooms[roomID].users[0]).emit('victory')
}

function HistoryCommunicate(roomID,history){
    rooms[roomID].users.forEach(userid=>{
        io.to(userid).emit('history',history)
    })
}
