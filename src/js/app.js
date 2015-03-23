(function () {

    var app = angular.module("scraperify", ["ngRoute"]);
    app.constant('appConfig', appConfig);

    app.config(function ($routeProvider) {
        $routeProvider
            .when("/main", {
                templateUrl: "views/main.html",
                controller: "MainController as main"
            })
            .otherwise({redirectTo: "/main"});
    });

}());