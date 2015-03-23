(function () {

    var app = angular.module("scraperify");

    var MainController = function (scraper, appConfig) {
        var vm = this;

        vm.doClick = function () {
            vm.isAjaxRequesting = true;
            var baseUrl = appConfig.baseUrl;
                scraper.getNodes(baseUrl, vm.selectedLangFrom.name, vm.selectedLangTo.name, vm.selector, vm.url)
                    .then(function (nodes) {
                        vm.nodes = nodes;
                        vm.isAjaxRequesting = false;
                    });
        };

        vm.langFrom = [
            {id: 1, name: 'es'},
            {id: 2, name: 'en'}
        ];

        vm.selectedLangFrom = vm.langFrom[0];

        vm.langTo = [
            {id: 1, name: 'es'},
            {id: 2, name: 'en'}
        ];
        vm.selectedLangTo = vm.langTo[0];

        vm.url = 'victorbarcelo.net';
        vm.selector = '.post_title';
    };
    app.controller("MainController", MainController);

}());