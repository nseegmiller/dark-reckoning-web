angular.module('darkReckoning', ['darkReckoning.components', 'ngAnimate', 'ui.router'])
    .config(
        function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/');
            $stateProvider
                .state('main', {
                    url: '/',
                    templateUrl: 'main/main.html',
                    controller: 'MainController as main'
                })
        }
    );

angular.module('darkReckoning.components', []);