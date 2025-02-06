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
  console.log("def initted");
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
  console.log("Tab updated:", tabId, changeInfo, tab);
  initIfUndefined().then(() => {
    console.log("Current blocking manager:", blockingManager);
    if (changeInfo.status === "complete") {
      console.log("Tab loaded:", tab);
      console.log("Current blocking manager:", blockingManager);
      if (blockingManager.shouldBlock(tab)) {
        console.log("BLOCKING!!!");
        blockingManager.block(tab);
      }
    }
  });

  return true;
});

// a small workaround to initialize the extension
chrome.tabs.onActivated.addListener(() => {
  initIfUndefined();
});