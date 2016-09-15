import configureStore from '../../../app/stores/backgroundStore';
import openDevToolsWindow from './openWindow';
import createMenu from './contextMenus';

// Expose the extension's store globally to access it from the windows
// via chrome.runtime.getBackgroundPage
window.store = configureStore();

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(shortcut => {
  openDevToolsWindow(shortcut);
});

// Create the context menu
chrome.runtime.onInstalled.addListener(() => {
  createMenu();
});
