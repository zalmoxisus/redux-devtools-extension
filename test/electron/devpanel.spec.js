import { join } from 'path';
import webdriver from 'selenium-webdriver';
import electronPath from 'electron-prebuilt';
import expect from 'expect';

const port = 9515;
const delay = time => new Promise(resolve => setTimeout(resolve, time));
const devPanelPath = 'chrome-extension://redux-devtools/devpanel.html';

describe('DevTools panel for Electron', function() {
  this.timeout(10000);

  before(async () => {
    this.driver = new webdriver.Builder()
      .usingServer(`http://localhost:${port}`)
      .withCapabilities({
        chromeOptions: {
          binary: electronPath,
          args: [`app=${join(__dirname, 'fixture')}`]
        }
      })
      .forBrowser('electron')
      .build();
  });

  after(async () => {
    await this.driver.quit();
  });

  it('should open Redux DevTools tab', async () => {
    expect(await this.driver.getCurrentUrl())
      .toMatch(/chrome-devtools:\/\/devtools\/bundled\/inspector.html/);

    await delay(1000); // wait loading of redux devtools
    const id = await this.driver.executeScript(function() {
      const tabs = WebInspector.inspectorView._tabbedPane._tabs;
      const lastPanelId = tabs[tabs.length - 1].id;
      WebInspector.inspectorView.showPanel(lastPanelId);
      return lastPanelId;
    });
    expect(id).toBe('chrome-extension://redux-devtoolsRedux');

    const className = await this.driver.findElement(webdriver.By.className(id))
      .getAttribute('class');
    expect(className).toNotMatch(/hidden/); // not hidden
  });

  it('should have Redux DevTools UI on current tab', async () => {
    await this.driver.switchTo().frame(
      this.driver.findElement(webdriver.By.xpath(`//iframe[@src='${devPanelPath}']`))
    );
    await delay(1000);
  });

  it('should contain an one action list', async () => {
    const val = await this.driver.findElement(webdriver.By.xpath('//div[contains(@class, "actionListRows--jss-")]'))
      .getText();
    expect(val).toMatch(/@@INIT/);
  });

  it('should contain inspector monitor\'s component', async () => {
    const val = await this.driver.findElement(webdriver.By.xpath('//div[contains(@class, "inspector--jss-")]'))
      .getText();
    expect(val).toExist();
  });

  it('should switch to Log Monitor', async () => {
    await this.driver.findElement(webdriver.By.xpath('//div[text()="Inspector"]')).click();
    await delay(500);
    await this.driver.findElement(webdriver.By.xpath('//div[text()="Log monitor"]')).click();
    await delay(500);
    await this.driver.findElement(webdriver.By.xpath('//div[a[text()="Reset"] and .//a[text()="Revert"]]'));
    await delay(500);
  });

  it('should switch to Chart Monitor', async () => {
    await this.driver.findElement(webdriver.By.xpath('//div[text()="Log monitor"]')).click();
    await delay(500);
    await this.driver.findElement(webdriver.By.xpath('//div[text()="Chart"]')).click();
    await delay(500);
    await this.driver.findElement(webdriver.By.xpath('//*[@class="nodeText" and text()="state"]'));
    await delay(500);
  });

  it('should switch back to Inspector Monitor', async () => {
    await this.driver.findElement(webdriver.By.xpath('//div[text()="Chart"]')).click();
    await delay(500);
    await this.driver.findElement(webdriver.By.xpath('//div[text()="Inspector"]')).click();
    await delay(1500);
  });
});
