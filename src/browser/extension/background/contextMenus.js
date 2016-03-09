import openDevToolsWindow from './openWindow';

const menus = [
  { id: 'devtools-left', title: 'To left' },
  { id: 'devtools-right', title: 'To right' },
  { id: 'devtools-bottom', title: 'To bottom' },
  { id: 'devtools-panel', title: 'Open in a chrome panel (enable in Chrome settings)' },
  { id: 'devtools-remote', title: 'Open Remote DevTools' }
];

let shortcuts = {};
chrome.commands.getAll(commands => {
  commands.forEach(({ name, shortcut }) => {
    shortcuts[name] = shortcut;
  });
});

export default function createMenu() {
  menus.forEach(({ id, title }) => {
    chrome.contextMenus.create({
      id: id,
      title: title + (shortcuts[id] ? ' (' + shortcuts[id] + ')' : ''),
      contexts: ['all'],
      onclick: () => { openDevToolsWindow(id); }
    });
  });
}
