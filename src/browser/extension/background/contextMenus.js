import openDevToolsWindow from './openWindow';

const menus = [
  { id: 'devtools-left', title: 'To left' },
  { id: 'devtools-right', title: 'To right' },
  { id: 'devtools-bottom', title: 'To bottom' },
  { id: 'devtools-panel', title: 'In panel' }
];
let pageUrl;
let pageTab;

let shortcuts = {};
chrome.commands.getAll(commands => {
  commands.forEach(({ name, shortcut }) => {
    shortcuts[name] = shortcut;
  });
});

export default function createMenu(forUrl, tabId) {
  if (typeof tabId !== 'number') return; // It is an extension's background page
  chrome.pageAction.show(tabId);
  if (tabId === pageTab) return;

  let url = forUrl;
  let hash = forUrl.indexOf('#');
  if (hash !== -1) url = forUrl.substr(0, hash);
  if (pageUrl === url) return;
  pageUrl = url; pageTab = tabId;
  chrome.contextMenus.removeAll();

  menus.forEach(({ id, title }) => {
    chrome.contextMenus.create({
      id: id,
      title: title + ' (' + shortcuts[id] + ')',
      contexts: ['all'],
      documentUrlPatterns: [url],
      onclick: () => { openDevToolsWindow(id); }
    });
  });
}
