(function () {

    var scraper = function ($http) {

        var getNodes = function (baseUrl, langFrom, langTo, selector, url) {
            //var encodedUrl = 'http://localhost/Ng-ex2/build/api/scrape/' + langFrom + '/' + langTo + '/' + encodeURIComponent(selector) + '/' + encodeURIComponent(encodeURIComponent(prepareUrl(url)));
            var encodedUrl = baseUrl + langFrom + '/' + langTo + '/' + encodeURIComponent(selector) + '/' + encodeURIComponent(encodeURIComponent(prepareUrl(url)));
            return $http.get(encodedUrl)
                .then(function (response) {
                    return response.data.nodes;
                });
        }

        var prepareUrl = function (url) {
            return url.replace(/.*?:\/\//g, "").replace(/\/$/, "");
        };

        return {
            getNodes: getNodes
        };

    };

    var module = angular.module("scraperify");
    module.factory("scraper", scraper);

}());