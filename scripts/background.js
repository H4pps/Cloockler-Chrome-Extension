import { loadBlockData, scanTabMap, saveToBlockData } from "./background-modules/utils.js";

let blockingData;

const maxBlockingTime = 60;
const minBlockingTime = 10;

let tabIdToPreviousHostname = new Map();

const init = async () => {
  blockingData = await loadBlockData();
  console.log("Loaded block data:", blockingData);

  tabIdToPreviousHostname = await scanTabMap();
  console.log("Scanned tabs:", tabIdToPreviousHostname);
};
init();

chrome.runtime.onUpdateAvailable.addListener(() => {
  console.log("updating extension to the newest version");
  chrome.runtime.reload();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.text === "get list mode") {
    // asking for the blocklist/allowlist mode
    sendResponse({ mode: blockingData.isBlocklistMode });
  } else if (message.text === "change list mode") {
    // setting the blocklist/allowlist mode
    blockingData.isBlocklistMode = !blockingData.isBlocklistMode;
    saveToBlockData(blockingData);
    sendResponse({ mode: blockingData.isBlocklistMode });
  } else if (message.text === "get current list") {
    // sending the list with the given mode
    let response = { list: [] };
    response.list = message.mode
      ? blockingData.blocklist
      : blockingData.allowlist;

    sendResponse(response);
  } else if (message.text === "set to list") {
    // adding site to blocklist/allowlist
    try {
      const hostname = extractHostname(message.url);
      if (blockingData.isBlocklistMode) {
        checkIncludes(hostname, blockingData.blocklist);
        saveToBlockData(blockingData);
      } else {
        checkIncludes(hostname, blockingData.allowlist);
        saveToBlockData(blockingData);
      }
      sendResponse({ type: "OK", hostname: hostname });
    } catch (error) {
      sendResponse({
        type: "ERROR",
        message: "URL is not in the correct format.",
      });
    }
  } else if (message.text === "delete from list") {
    if (blockingData.isBlocklistMode) {
      deleteItem(blockingData.blocklist, message.url);
      saveToBlockData(blockingData);
    } else {
      deleteItem(blockingData.allowlist, message.url);
      saveToBlockData(blockingData);
    }
  } else if (message.text === "get blocking time") {
    sendResponse({ time: blockingData.blockingTime });
  } else if (message.text === "set blocking time") {
    if (message.time >= minBlockingTime && message.time <= maxBlockingTime) {
      blockingData.blockingTime = message.time;
      saveToBlockData(blockingData);
      sendResponse({ type: "OK", time: blockingData.blockingTime });
    } else {
      sendResponse({ type: "ERROR", time: blockingData.blockingTime });
    }
  }
});

// delete the hostname from the list
let deleteItem = (siteList, hostname) => {
  const index = findIndexOfUrl(siteList, hostname);
  siteList.splice(index, 1);
};

// find the index of the hosname in the list
let findIndexOfUrl = (sitesList, hostname) => {
  for (let i = 0; i < sitesList.length; ++i) {
    if (hostname === sitesList[i]) {
      return i;
    }
  }

  return null;
};

let checkIncludes = (site, sitesList) => {
  if (sitesList.includes(site)) {
    throw new Error("URL hostname is already in the list");
  }

  sitesList.push(site);
};

// returns null if the URL is not in correct format
let extractHostname = (url) => {
  try {
    if (url.startsWith("chrome-extension:")) {
      throw new Error("Got chrome-extension:// url");
    }

    // adding "https://" if the string does not start with that
    if (!url.startsWith("https://") && !url.startsWith("http://")) {
      url = "https://" + url;
    }

    let flag = false;
    url.split(".").forEach(function (number) {
      if (number.length === 0) {
        flag = true;
      }
    });
    if (flag || !url.includes(".")) {
      throw new Error("URL is not in the correct format.");
    }

    const hostnameLastArray = new URL(url).hostname.split(".").splice(-2); // DRY!
    const hostname = hostnameLastArray[0] + "." + hostnameLastArray[1];

    return hostname;
  } catch (error) {
    console.log("Errorr in the url: ", url);
    console.log(error);
    throw new Error(`URL ${url} is not in the correct format.`); // change later
  }
};

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
