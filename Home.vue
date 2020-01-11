<template>


  <div id="home">
    my home
   <router-link to="/test">Go to game</router-link><br>
   {{alma}}
   <ul>
      <li v-on:click="joinroom(room.roomid)"  v-for="room in rooms">{{ room.roomid }} -- {{ room.users}} </li>
  </ul>
  <button v-on:click="pewpew">try</button>
  </div>
</template>

<script>

// @ is an alias to /src
let socket=require('../socketmanager.js').socket
export default {
  name: 'home',
  data:function(){
    return{
      rooms:[],
      alma:'alma',
      stuffs:[]
    }
  },
  methods:{
    pewpew:function(){
      console.log(this.rooms)
    },
    updatearray:function(data){
      this.rooms=data;
    },
    socketlisten:function(){
      socket.on('availablerooms',data=>{
        this.rooms=data.rooms
        console.log(this.rooms)
      })
    },
    gamestart:function(){
      socket.on('gamestart',function(){
        window.location.href = "http://localhost:8080/#/test"
      })
    },
    joinroom:function(roomID){
      let roomid={room:roomID}
      socket.emit('joinroom',roomid)
    },
    askStartingHand:function(){
      socket.emit('hand')
    },
    receiveStartingHand:function(){
      socket.on('hand',function(){
        
      })
    }
  },
  created(){
    this.socketlisten()
    this.gamestart()
    this.askStartingHand()
    this.receiveStartingHand()
  }
}
</script>

<style scoped>
  #home{
    height:100%;
  }
</style>
