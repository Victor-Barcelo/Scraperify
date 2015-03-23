describe('scraperify webapp', function () {
    it('should retrieve results from victorbarcelo.net', function () {
        browser.get('http://localhost:3000/#/main');
        element(by.css('[ng-click="main.doClick()"]')).click();
        var scraps = element.all(by.repeater('node in main.nodes track by $index'));
        expect(scraps.count()).toBeGreaterThan(0);
    });
});