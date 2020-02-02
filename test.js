// let cucc={}
// console.log("ez a cucc: "+cucc)
// let beilleszt='randomstuff'
// cucc[beilleszt]={
//     'elso':'valami',
//     'masodik':'ez is valami'
// }
// console.log(cucc)
// console.log("most jön a törlés")
// delete cucc[beilleszt]
// console.log(cucc)

// console.log('------------ elem ellenőrzés');
// cucc[beilleszt]={
//     'elso':'valami',
//     'masodik':'ez is valami'
// }

// console.log('megnézni hogy van e randomstuff key: '+cucc.hasOwnProperty(beilleszt));
// console.log('megnézni hogy van e egy teljesen más key: '+cucc.hasOwnProperty('lamalama'));

let arrayka=["Dani","Ákos","majom","Norbi","David"]
//majom törlés
let majomindex=arrayka.indexOf("majom")
console.log(majomindex)

 arrayka=arrayka.splice(majomindex,1)
console.log(arrayka)