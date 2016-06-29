import { resolve } from 'path';
import webdriver from 'selenium-webdriver';
import expect from 'expect';

const port = 9515;
const path = resolve('build/extension');
const extensionId = 'lmhkpmbekcpmknklioeibfkpmmfibljd';
const actionsPattern = /^@@INIT(.|\n)+@@reduxReactRouter\/routerDidChange(.|\n)+@@reduxReactRouter\/initRoutes(.|\n)+$/;

describe('Chrome extension', function() {
  this.timeout(10000);

  before(function(done) {
    this.driver = new webdriver.Builder()
      .usingServer(`http://localhost:${port}`)
      .withCapabilities({
        chromeOptions: {
          args: [`load-extension=${path}`]
        }
      })
      .forBrowser('chrome')
      .build();
    done();
  });
  after(function(done) {
    this.driver.quit().then(done);
  });

  it('should open extension\'s window', function(done) {
    this.driver.get(`chrome-extension://${extensionId}/window.html`).then(() => {
      this.driver.getCurrentUrl().then((url) => {
        expect(url).toBe(`chrome-extension://${extensionId}/window.html`);
        done();
      });
    });
  });

  it('should match document title', function(done) {
    this.driver.getTitle().then((title) => {
      expect(title).toBe('Redux DevTools');
      done();
    });
  });

  it('should contain inspector monitor\'s component', function(done) {
    this.driver.findElement(webdriver.By.xpath('//div[contains(@class, "inspector--jss-")]'))
      .getText().then((val) => {
        expect(val).toExist();
        done();
      });
  });

  it('should contain an empty actions list', function(done) {
    this.driver.findElement(webdriver.By.xpath('//div[contains(@class, "actionListRows--jss-")]'))
      .getText().then((val) => {
        expect(val).toBe('');
        done();
      });
  });

  it('should switch to Log Monitor', function(done) {
    this.driver.findElement(webdriver.By.xpath('//div[text()="Inspector"]')).click().then(() => {
      this.driver.findElement(webdriver.By.xpath('//div[text()="Log monitor"]')).click().then(() => {
        this.driver.findElement(webdriver.By.xpath('//div[a[text()="Reset"] and .//a[text()="Revert"]]')).then(() => {
          setTimeout(() => { done(); }, 500); // Wait till menu is closed
        });
      });
    });
  });

  it('should switch to Chart Monitor', function(done) {
    this.driver.findElement(webdriver.By.xpath('//div[text()="Log monitor"]')).click().then(() => {
      setTimeout(() => { // Wait till menu is fully opened
        this.driver.findElement(webdriver.By.xpath('//div[text()="Chart"]')).click().then(() => {
          this.driver.findElement(webdriver.By.xpath('//*[@class="nodeText" and text()="state"]')).then(() => {
            setTimeout(() => { done(); }, 500); // Wait till menu is closed
          });
        });
      }, 500);
    });
  });

  it('should switch back to Inspector Monitor', function(done) {
    this.driver.findElement(webdriver.By.xpath('//div[text()="Chart"]')).click().then(() => {
      setTimeout(() => { // Wait till menu is fully opened
        this.driver.findElement(webdriver.By.xpath('//div[text()="Inspector"]')).click().then(() => {
          setTimeout(() => { done(); }, 1500); // Wait till menu is closed
        });
      }, 500);
    });
  });

  it('should get actions list', function(done) {
    this.driver.executeScript('window.open(\'http://zalmoxisus.github.io/redux-devtools-extension/examples/router/#/Standard Todo?_k=b5am7j\')');

    this.driver.wait(() => (
      this.driver.findElement(webdriver.By.xpath('//div[contains(@class, "actionListRows--jss-")]'))
        .getText().then((val) => {
          return actionsPattern.test(val);
        })
    ), 3000, 'it doesn\'t match actions pattern')
      .then(() => done());
  });

});
