import { resolve } from 'path';
import webdriver from 'selenium-webdriver';
import expect from 'expect';

const port = 9515;
const delay = time => new Promise(resolve => setTimeout(resolve, time));
const path = resolve('build/extension');
const extensionId = 'lmhkpmbekcpmknklioeibfkpmmfibljd';
const actionsPattern = /^@@INIT(.|\n)+@@reduxReactRouter\/routerDidChange(.|\n)+@@reduxReactRouter\/initRoutes(.|\n)+$/;

describe('Chrome extension', function() {
  this.timeout(10000);

  before(async () => {
    this.driver = new webdriver.Builder()
      .usingServer(`http://localhost:${port}`)
      .withCapabilities({
        chromeOptions: {
          args: [`load-extension=${path}`]
        }
      })
      .forBrowser('chrome')
      .build();
  });
  after(async () => {
    await this.driver.quit();
  });

  it('should open extension\'s window', async () => {
    await this.driver.get(`chrome-extension://${extensionId}/window.html`);
    const url = await this.driver.getCurrentUrl();
    expect(url).toBe(`chrome-extension://${extensionId}/window.html`);
  });

  it('should match document title', async () => {
    const title = await this.driver.getTitle();
    expect(title).toBe('Redux DevTools');
  });

  it('should contain inspector monitor\'s component', async () => {
    const val = this.driver.findElement(webdriver.By.xpath('//div[contains(@class, "inspector--jss-")]'))
      .getText();
    expect(val).toExist();
  });

  it('should contain an empty actions list', async () => {
    const val = await this.driver.findElement(webdriver.By.xpath('//div[contains(@class, "actionListRows--jss-")]'))
      .getText();
    expect(val).toBe('');
  });

  it('should switch to Log Monitor', async () => {
    await this.driver.findElement(webdriver.By.xpath('//div[text()="Inspector"]')).click();
    await this.driver.findElement(webdriver.By.xpath('//div[text()="Log monitor"]')).click();
    await this.driver.findElement(webdriver.By.xpath('//div[a[text()="Reset"] and .//a[text()="Revert"]]'));
    await delay(500);
  });

  it('should switch to Chart Monitor', async () => {
    await this.driver.findElement(webdriver.By.xpath('//div[text()="Log monitor"]')).click();
    await delay(500); // Wait till menu is fully opened
    await this.driver.findElement(webdriver.By.xpath('//div[text()="Chart"]')).click();
    await delay(500);
    await this.driver.findElement(webdriver.By.xpath('//*[@class="nodeText" and text()="state"]'));
    await delay(500); // Wait till menu is closed
  });

  it('should switch back to Inspector Monitor', async () => {
    await this.driver.findElement(webdriver.By.xpath('//div[text()="Chart"]')).click();
    await delay(500); // Wait till menu is fully opened
    await this.driver.findElement(webdriver.By.xpath('//div[text()="Inspector"]')).click();
    await delay(1500); // Wait till menu is closed
  });

  it('should get actions list', async () => {
    this.driver.executeScript('window.open(\'http://zalmoxisus.github.io/redux-devtools-extension/examples/router/#/Standard Todo?_k=b5am7j\')');

    await this.driver.wait(() => (
      this.driver.findElement(webdriver.By.xpath('//div[contains(@class, "actionListRows--jss-")]'))
        .getText().then((val) => {
          return actionsPattern.test(val);
        })
    ), 3000, 'it doesn\'t match actions pattern');
  });
});
