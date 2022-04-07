var assert = require('assert');
var index = require('../index')
var cardmanager=require('../cards.js')
describe('Deck related', function() {
  let result=cardmanager.initializeDeck()
  describe('New deck check', function() {
    it('should have 3 #1', function() {
        let numberof1=0;
        let numberof2=0;
        
        result.forEach(element => {
            if(element==1){
                numberof1++;
            }
            if(element==2){
                numberof2++;
            }
        });
      assert.equal(numberof1,3,"Number of #1 cards are 3");
    });
    it('should have 3 #2', function() {
        let numberof1=0;
        let numberof2=0;
        
        result.forEach(element => {
            if(element==1){
                numberof1++;
            }
            if(element==2){
                numberof2++;
            }
        });
      assert.equal(numberof1,3,"Number of #2 cards are 3");
    });
    it('hand-deck-graveyard works - empty hand - 6 deck - 0 graveyard',function(){
        let HDG=cardmanager.getHand([],result,[])
        assert.equal(HDG.hand.length,3,'Hand should be 3 long for empty hand')
    });
    it('hand-deck-graveyard works - full hand',function(){
        let HDG=cardmanager.getHand([2,1,2],[1,1,2],[])
        assert.equal(HDG.graveyard.length,3,'Graveyard should be 3 long')
    })
  });
});
describe('Fight related', function() {
    it('Testing vs empty board', function() {
        let results=cardmanager.fightcalculating([0,1],[])
        assert.equal(results.p2.lifeloss,9,'lifeloss for P2 should be 9')
    })
})
