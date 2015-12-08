import openDevToolsWindow from './openWindow';

const menus = [
  { id: 'devtools-left', title: 'To left (Alt+Shift+Left arrow)' },
  { id: 'devtools-right', title: 'To right (Alt+Shift+Right arrow)' },
  { id: 'devtools-bottom', title: 'To bottom (Alt+Shift+Down arrow)' },
  { id: 'devtools-panel', title: 'In panel (Alt+Shift+Top arrow)' }
];

let pageUrl;
let pageTab;

export default function createMenu(forUrl, tabId) {
  if (typeof tabId !== 'number' || tabId === pageTab) return;

  let url = forUrl;
  let hash = forUrl.indexOf('#');
  if (hash !== -1) url = forUrl.substr(0, hash);
  if (pageUrl === url) return;
  pageUrl = url; pageTab = tabId;
  chrome.contextMenus.removeAll();

  menus.forEach(({ id, title }) => {
    chrome.contextMenus.create({
      id: id,
      title: title,
      contexts: ['all'],
      documentUrlPatterns: [url],
      onclick: () => { openDevToolsWindow(id); }
    });
  });

  chrome.pageAction.show(tabId);
}
