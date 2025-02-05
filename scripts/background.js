import {
  loadBlockData,
  scanTabMap,
  extractHostname,
} from "./background-modules/utils.js";
import { DataManager } from "./background-modules/DataManager.js";
import { MessageManager } from "./background-modules/MessageManager.js";

let blockingData = undefined;
let dataManager = undefined;
let messageManager = undefined;
let prevHosts = undefined;

const init = async () => {
  blockingData = await loadBlockData();
  console.log("Loaded blocking data:", blockingData);

  dataManager = new DataManager(blockingData);
  messageManager = new MessageManager(dataManager);

  prevHosts = await scanTabMap();
  console.log("Scanned tabs:", prevHosts);
};
const initIfUndefined = async () => {
  if (prevHosts === undefined) {
    await init();
  }
};

chrome.runtime.onUpdateAvailable.addListener(() => {
  console.log("updating extension to the newest version");
  chrome.runtime.reload();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  initIfUndefined().then(() => {
    messageManager.getMessage(message, sendResponse);
  });

  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (prevHosts !== undefined) {
    prevHosts.delete(tabId);
  }
});

const isChromeUrl = (url) => {
  return url.startsWith("chrome://") || url.startsWith("chrome-extension://");
};
const shoudBlock = (tab) => {
  return (
    !isChromeUrl(tab.url) &&
    dataManager.containsUrl(tab.url) &&
    prevHosts.get(tab.id) !== extractHostname(tab.url)
  );
};
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  initIfUndefined().then(() => {
    if (changeInfo.status === "complete") {
      if (shoudBlock(tab)) {
        prevHosts.set(tabId, extractHostname(tab.url));
        chrome.tabs
          .update(tabId, { url: "./pages/blockPage.html" })
          .then(() => {
            setTimeout(() => {
              if (prevHosts.has(tabId)) {
                chrome.tabs.update(tabId, { url: tab.url });
              }
            }, dataManager.blockingTime * 1000 + 200);
          });
      }
    }
  });

  return true;
});
