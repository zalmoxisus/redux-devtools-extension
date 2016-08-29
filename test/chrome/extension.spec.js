import { resolve } from 'path';
import webdriver from 'selenium-webdriver';
import expect from 'expect';
import { switchMonitorTests, delay } from '../utils/e2e';

const port = 9515;
const path = resolve('build/extension');
const extensionId = 'lmhkpmbekcpmknklioeibfkpmmfibljd';
const actionsPattern = /^@@INIT(.|\n)+@@reduxReactRouter\/routerDidChange(.|\n)+@@reduxReactRouter\/initRoutes(.|\n)+$/;

describe('Chrome extension', function() {
  this.timeout(15000);

  before(async () => {
    delay(2000);
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

  Object.keys(switchMonitorTests).forEach(description =>
    it(description, switchMonitorTests[description].bind(this))
  );

  it('should get actions list', async () => {
    this.driver.executeScript('window.open(\'http://zalmoxisus.github.io/examples/router/\')');

    await this.driver.wait(() => (
      this.driver.findElement(webdriver.By.xpath('//div[contains(@class, "actionListRows--jss-")]'))
        .getText().then((val) => {
          return actionsPattern.test(val);
        })
    ), 3000, 'it doesn\'t match actions pattern');
  });
});
