let rooms={
    "134":{
        "ppl":[],
        "responses":[]
    },
    "136":{
        "ppl":[],
        "responses":[]
    },
    responseListener:function(val){},
    addResponse:function(roomId,response){
        rooms[roomId].responses.push(response)
        if(rooms[roomId].responses.length==2)
        {
            this.responseListener(roomId)
        }
    },
    registerListener:function(listener){
        this.responseListener=listener
    }
}

GameStart("134")
fillResponse("134")


async function GameStart(roomId){
    let timerPromise=timeout()
    let responsePromise=rooms.registerListener(function(changedRoomId){
        if(changedRoomId==roomId){
            return new Promise(resolve => {
                  resolve(x);
              });
        }
    })
    
    await responseWaiter([timerPromise,responsePromise])
    console.log("did it work?")    
}

function timeout(){
    return new Promise(resolve => {
        setTimeout(() => {
          resolve(10);
          console.log("time out")
        }, 3000);
      });
}

function fillResponse(roomId)
{
    setTimeout(() => {
        console.log("here we go")
        rooms[roomId].responses.push("resp0")
        rooms[roomId].responses.push("resp1")
      }, 5000);
}

function responseWaiter(promis)
{
    return Promise.race(promis)
}

