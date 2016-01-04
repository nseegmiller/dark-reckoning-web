angular.module('darkReckoning.components').factory('Players',
    function ($timeout) {
        var players = {
            playerList: []
        };
        players.addPlayer = function (name, color) {
            players.playerList.push({
                name: name,
                color: color,
                score: 0
            });
        };
        players.removePlayer = function (index) {
            players.playerList.splice(index, 1);
        };
        players.changeScore = function (index, amount) {
            var player = players.playerList[index];
            player.scoreNext = player.score += amount;
            player.transitioning = true;
            $timeout(function () {
                player.transitioning = false;
                player.score = player.scoreNext
            }, 600);
        };

        return players;
    }
);