let Cards={
    0:{
        'name':'General',
        'life':5,
        'attack':3,
        'cost':4
    },
    1:{
        'name':'Assasin',
        'life':0,
        'attack':6,
        'cost':2
    },
    2:{
        'name':'Barricade',
        'life':4,
        'attack':1,
        'cost':2
    },
    3:{
        'name':'jolly joker',
        'life':3,
        'attack':3,
        'cost':1
    },
    4:{
        'name':'harci szekerce',
        'life':0,
        'attack':5,
        'cost':3
    },
    5:{
        'name':'Gyalogság',
        'life':2,
        'attack':1,
        'cost':1
    },
    6:{
        'name':'Tüzérség',
        'life':1,
        'attack':3,
        'cost':2
    },
    7:{
        'name':'Titkos terv',
        'life':0,
        'attack':2,
        'cost':1
    },
    8:{
        'name':'Árulás',
        'life':-1,
        'attack':3,
        'cost':1
    },
    9:{
        'name':'Rakéta állomás',
        'life':1,
        'attack':7,
        'cost':4
    },
    10:{
        'name':'Tank',
        'life':3,
        'attack':3,
        'cost':3
    }
}

exports.fightcalculating=(p1cards,p2cards)=>{
    let p1fight=0;
    let p2fight=0;
    let p1life=0;
    let p2life=0;

    let p1HpLoss=0;
    let p2HpLoss=0;

    p1cards.forEach(card => {
        p1fight=p1fight+Cards[card]['attack'];
        p1life=p1life+Cards[card]['life'];
    });

    p2cards.forEach(card => {
        p2fight=p2fight+Cards[card]['attack'];
        p2life=p2life+Cards[card]['life'];
    });

    if(p1life-p2fight<0){
        p1HpLoss=Math.abs(p1life-p2fight)
    }
    if(p2life-p1fight<0){
        p2HpLoss=Math.abs(p2life-p1fight)
    }
    console.log("HP loss of player1: "+p1HpLoss)
    console.log("Hp loss of player2: "+p2HpLoss)
    return {
        'p1':{
            'lifeloss':p1HpLoss,
            'attack':p1fight,
            'defense':p1life
        },
        'p2':{
            'lifeloss':p2HpLoss,
            'attack':p2fight,
            'defense':p2life
        }
    }
}

exports.buyroundcards=()=>{
    let returnedcards=[];
    let size = Object.keys(Cards).length;
    for(let i=0;i<3;i++){
        returnedcards.push(Math.floor(Math.random() * size))
    }
    console.log(returnedcards)
    console.log(size)
    return returnedcards
}

exports.initializeDeck=()=>{
    let basicDeck=[];
    for(let i=0;i<3;i++){
        basicDeck.push(1)
    }
    for(let i=0;i<3;i++){
        basicDeck.push(2)
    }
    basicdeck=deckshuffle(basicDeck)
    return basicDeck;
}

//TODO
exports.choiceCards=(remainingdeck,useddeck)=>{

}

//returns deck - graveyard - hand 
exports.getHand=(hand,deck,graveyard)=>{
    for(let i=0;i<hand.length;i++){
        graveyard.push(hand.pop())
    }
    while(hand.length!=3){
        if(deck.length>0){
            hand.push(deck.pop())
        }
        else{
            deck=graveyard.slice()
            deck=deckshuffle(deck)
            graveyard=[]
        }
    }
    return {'hand':hand,
            'deck':deck,
            'graveyard':graveyard}
}

exports.Cards=Cards;

function deckshuffle(deck){
    console.log("original deck:  "+deck)
    for (let i = deck.length - 1; i > 0; i--) {
        let temp;
        let j = Math.floor(Math.random() * (i + 1))
        temp=deck[i]
        deck[i]=deck[j]
        deck[j]=temp
    }
    console.log("shuffled deck: "+deck)
    return deck
}

exports.UpdateHDG=function(hand,deck,graveyard){
    for(let i=0;i<hand.length+1;i++){
        graveyard.push(hand.pop())
    }

    return{
        'Hand':hand,
        'Deck':deck,
        'Graveyard':graveyard
    }
}