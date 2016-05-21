import openDevToolsWindow from './openWindow';

export default function createMenu() {
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

  menus.forEach(({ id, title }) => {
    chrome.contextMenus.create({
      id: id,
      title: title + (shortcuts[id] ? ' (' + shortcuts[id] + ')' : ''),
      contexts: ['all']
    });
  });

  chrome.contextMenus.onClicked.addListener(({ menuItemId }) => {
    openDevToolsWindow(menuItemId);
  });
}
