// Problems:
// 1) does not persist blocking data
// 2) blocking data is undefined if the background script is woken up

import {
  loadBlockData,
  scanTabMap,
} from "./background-modules/utils.js";
import { DataManager } from "./background-modules/DataManager.js";
import { MessageManager } from "./background-modules/MessageManager.js";

let blockingData = undefined;
let dataManager = undefined;
let messageManager = undefined;
let tabIdToPreviousHostname = undefined;

const init = async () => {
  blockingData = await loadBlockData();
  console.log("Loaded block data:", blockingData);

  dataManager = new DataManager(blockingData);
  messageManager = new MessageManager(dataManager);

  tabIdToPreviousHostname = await scanTabMap();
  console.log("Scanned tabs:", tabIdToPreviousHostname);
};
init();
// const initIfUndefined = async () => {
//   if (blockingData === undefined) {
//     await init();
//   }
// }
// initIfUndefined();

chrome.runtime.onUpdateAvailable.addListener(() => {
  console.log("updating extension to the newest version");
  chrome.runtime.reload();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  messageManager.getMessage(message, sendResponse);
});

// executes every time when the tab was updated/added
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    !tab.url.startsWith("chrome://") &&
    !tab.url.startsWith("chrome-extension://")
  ) {
    if (changeInfo.status === "complete") {
      const hostname = extractHostname(tab.url);
      console.log("Previous: ", tabIdToPreviousHostname.get(tabId));
      console.log("To: ", tab.url);
      if (
        checkBlocking(hostname) &&
        !equalPreviousURL(tabId, hostname) &&
        hostname != "google.com"
      ) {
        // adding the tabId to the map of all current tabs
        // (preventing blocking the same website serveral times in a row)
        tabIdToPreviousHostname.set(tabId, hostname);
        console.log("Blocking");
        console.log("Blocking time: ", blockingData.blockingTime);

        const navigatingURL = tab.url;
        chrome.tabs.update(tab.id, { url: "pages/blockPage.html" }).then(() => {
          setTimeout(() => {
            // checking if the tab was closed while timeout
            if (tabIdToPreviousHostname.has(tab.id)) {
              chrome.tabs.update(tab.id, { url: navigatingURL });
            }
          }, blockingData.blockingTime * 1000 + 200);
        });
      }
    }
  }
});

let checkBlocking = (hostname) => {
  if (blockingData.isBlocklistMode) {
    return blockingData.blocklist.includes(hostname);
  }

  return !blockingData.allowlist.includes(hostname);
};

chrome.tabs.onRemoved.addListener((tabId) => {
  tabIdToPreviousHostname.delete(tabId);
});

function equalPreviousURL(tabId, hostname) {
  return hostname === tabIdToPreviousHostname.get(tabId);
}
