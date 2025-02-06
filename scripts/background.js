import { loadBlockData, scanTabMap } from "./background-modules/utils.js";
import { DataManager } from "./background-modules/DataManager.js";
import { MessageManager } from "./background-modules/MessageManager.js";
import { BlockingManager } from "./background-modules/BlockingManager.js";

let blockingData = undefined;
let dataManager = undefined;
let messageManager = undefined;
let prevHosts = undefined;
let blockingManager = undefined;

const init = async () => {
  blockingData = await loadBlockData();
  console.log("Loaded blocking data:", blockingData);

  dataManager = new DataManager(blockingData);
  messageManager = new MessageManager(dataManager);

  prevHosts = await scanTabMap();
  blockingManager = new BlockingManager(dataManager, prevHosts);
  console.log("Scanned tabs:", prevHosts);
};
const initIfUndefined = async () => {
  if (blockingManager === undefined) {
    await init();
  }
};

chrome.runtime.onUpdateAvailable.addListener(() => {
  console.log("Updating extension to the newest version");
  chrome.runtime.reload();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  initIfUndefined().then(() => {
    messageManager.getMessage(message, sendResponse);
  });

  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (blockingManager !== undefined) {
    blockingManager.deleteTab(tabId);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  initIfUndefined().then(() => {
    if (changeInfo.status === "complete") {
      if (blockingManager.shouldBlock(tab)) {
        blockingManager.block(tab);
      }
    }
  });

  return true;
});
