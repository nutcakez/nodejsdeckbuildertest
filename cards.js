let Cards={
    1:{
        'name':'Húsos nagydarab',
        'life':5,
        'attack':3,
        'cost':5
    },
    2:{
        'name':'Gyilkos kenyér',
        'life':2,
        'attack':1,
        'cost':0
    },
    3:{
        'name':'Tüskés hordó',
        'life':4,
        'attack':1,
        'cost':2
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