angular.module('darkReckoning.components').controller('MainController', ['Players',
    function(Players) {
        var main = this;
        main.Players = Players;
        Players.addPlayer('Nick', 'blue');
        Players.addPlayer('Janelle', 'red');
        Players.addPlayer('Alyssa', 'orange');
        Players.addPlayer('Kate', 'grey');
        Players.addPlayer('Matt', 'green');
    }
]);