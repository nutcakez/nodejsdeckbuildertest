<template>
    <div class="screen">
        <div id="cardholder">
            <div class="card"  v-on:click="select(0)" v-bind:style="{ transform: shift, background:cardcolor[0] }">
                <div class="cardpic" >
                    <img id="kep" :src='cards[0].url'></img>
                </div>
                <span>{{cardTexts[0].name}}</span><br>
                <span>Támadás: {{cardTexts[0].attack}}</span><br>
                <span>Élet: {{cardTexts[0].life}}</span><br>
                <span>Ár: {{cardTexts[0].cost}}</span>
            </div>
            <div class="card" v-on:click="select(1)" v-bind:style="{ transform: shift, background:cardcolor[1] }">
                <div class="cardpic">
                    <img id="kep" src='../images/pic1.jpg'></img>
                </div>
                <span>{{cardTexts[1].name}}</span><br>
                <span>Támadás: {{cardTexts[1].attack}}</span><br>
                <span>Élet: {{cardTexts[1].life}}</span><br>
                <span>Ár: {{cardTexts[1].cost}}</span>
            </div>
            <div class="card" v-on:click="select(2)"  v-bind:style="{ transform: shift, background:cardcolor[2] }">
                 <div class="cardpic">
                     <img id="kep" src='../images/pic1.jpg'></img>
                 </div>
                 <span>{{cardTexts[2].name}}</span><br>
                 <span>Támadás: {{cardTexts[2].attack}}</span><br>
                 <span>Élet: {{cardTexts[2].life}}</span><br>
                 <span>Ár: {{cardTexts[2].cost}}</span>
            </div>
            <h3>{{round}}round</h3>
           
           
        </div>
        
        <div id="stats">
        </div>
        <div id="history">
        </div>
    </div>

</template>
<script>
let socket=require('../socketmanager.js')
let cardbase=require('../clientcards.js')
export default {
    data: function(){
        return{
            shift:'translateX(0px)',
            round:'Fight',
            cardcolor:{0:'gray',
                    1:'gray',
                    2:'gray'},
            selected:[],
            cardTexts:{
                0:{
                    name:'baraj',
                    attack:2,
                    life:3,
                    cost:5,
                    img:'./images/pic1.jpg'
                },
                1:{
                    name:'barakk',
                    attack:2,
                    life:3,
                    cost:5,
                    img:'./images/pic1.jpg'
                },
                2:{
                    name:'barakk',
                    attack:2,
                    life:3,
                    cost:5,
                    img:'../images/pic1.jpg'
                }

            },
            status:{},
            cards:cardbase.cards,
            hand:[1,2,3]
        }
    },
    methods: {
        shiftCards:function(){
            if(this.shift=='translateX(0px)'){
                this.shift='translateX(-600px)'
            }
            else
            {
                this.shift='translateX(0px)'
            }
        },
        roundChange:function(){
            this.shiftCards()
            if(this.round=='Buy'){
                this.cardcolor[0]='coral'
                this.cardcolor[1]='coral'
                this.cardcolor[2]='coral'
            }
            else
            {
                this.cardcolor[0]='gray'
                this.cardcolor[1]='gray'
                this.cardcolor[2]='gray'
            }
            
            setTimeout(()=>this.shiftCards(),1100)
        },
        select:function(index){
            console.log(this.selected)
            if(this.cardcolor[index]!='green'){
                this.cardcolor[index]='green'
                this.selected.push(index)
            }
            else
            {
                if(this.round=='Fight'){
                    this.cardcolor[index]='gray'
                    this.selected=this.removeElement(this.selected,index)
                }
                else
                {
                    this.cardcolor[index]='coral'
                    this.selected=this.removeElement(this.selected,index)
                }
            }
        },
        removeElement:function(array,element){
            for( var i = 0; i < array.length; i++){ 
                if ( array[i] == element) {
                    array.splice(i, 1); 
                }
            }
            return array;
        },
        sendResponse:function(){
            console.log(cardbase.cards[0].name)
        },
        returnImgSrc:function(index){
            return this.cardTexts[index].img
        },
        cardhandle:function(){
            socket.socket.on('hand',data=>{
                console.log(data)
                this.hand=data;
                
                
            })
        },
        askForHand:function(){
            socket.emit('hand')
        }


    },
    created(){
        this.cardhandle()
        // this.askForHand()
        
        // socket.socket.on('message',function(data){
        //     console.log(data)
        // })
        // socket.socket.on('gamestart',function(){
        //     //reset the variables
        // })
        // socket.socket.on('status',function(data){
        //     this.status=data;
        // })
        // socket.socket.on('buyround',function(data){
        //     this.cards=data;
        // })
        
    }
}
</script>
<style scoped>
.card{
    width: 30%;
    height: 55%;
    background-color: gray;
    display: inline-block;
    margin:1%;
    vertical-align: top;
    border-radius: 8px;
    transition: 1s ease;
}
#vala{
    background-color: brown
}
#cardholder{
    background-color: lightblue;
    height:40%;
    text-align:center;
}

.screen{
    height: 100%;
}

#kep{
    width: 100%;
    max-height: 100%;
}
.cardpic{
    width:100%;
    height:40%;
}

#stats{
    height:30%;
    background: olive;
}
@media screen and (max-height: 560px) {
    .card {
      background-color: lightgreen;
      font-size: small;
    }
    #responsesend{
        width:30%;
        height:20px;
        font-size: small;
    }
  }
</style>