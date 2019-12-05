let Cards={
    0:{
        'name':'Húsos nagydarab',
        'life':5,
        'attack':3,
        'cost':5
    },
    1:{
        'name':'Gyilkos kenyér',
        'life':2,
        'attack':1,
        'cost':0
    },
    2:{
        'name':'Tüskés hordó',
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
    }
}

exports.fightcalculating=(p1cards,p2cards)=>{
    let p1fight=0;
    let p2fight=0;
    let p1life=0;
    let p2life=0;

    p1cards.forEach(card => {
        p1fight=p1fight+Cards[card]['attack'];
        p1life=p1life+Cards[card]['life'];
        console.log("----"+Cards[card]['life'])
    });

    p2cards.forEach(card => {
        p2fight=p2fight+Cards[card]['attack'];
        p2life=p2life+Cards[card]['life'];
    });
    console.log('p1fight '+p1fight)
    console.log('p2fight '+p2fight)
    console.log('p1life '+p1life)
    console.log('p2life '+p2life)
    return {
        'p1':Math.abs(p1life-p2fight),
        'p2':Math.abs(p2life-p1life)
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
    for(let i=0;i<5;i++){
        basicDeck.push(1)
    }
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
            graveyard=[]
        }
    }
    return {'hand':hand,
            'deck':deck,
            'graveyard':graveyard}
}

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