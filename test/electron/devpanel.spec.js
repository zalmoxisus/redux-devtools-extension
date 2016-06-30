import { join } from 'path';
import webdriver from 'selenium-webdriver';
import electronPath from 'electron-prebuilt';
import expect from 'expect';

const port = 9515;
const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('DevTools panel', function() {
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
});
