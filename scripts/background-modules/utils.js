const BLOCK_KEY = "dataSaving";

export const loadBlockData = async () => {
  try {
    const loadedData = await chrome.storage.sync.get(BLOCK_KEY);
    if (typeof loadedData[BLOCK_KEY] === "undefined") {
      console.log("There is no block data in the storage");
      return {
        blocklist: [],
        allowlist: [],
        blockingTime: 15,
        isBlocklistMode: true,
      };
    }

    return JSON.parse(loadedData[BLOCK_KEY]);
  } catch (error) {
    console.error(
      `Error loading program data (key: ${BLOCK_KEY}):`,
      error
    );
    throw error;
  }
};

export const saveToBlockData = async (data) => { // will be called only form background.js 
  try {
    console.log("SAVED DATA");
    chrome.storage.sync.set({ [BLOCK_KEY]: JSON.stringify(data) });
  } catch (error) {
    console.error(`Error saving program data (key: ${BLOCK_KEY}):`, error);
    throw error;
  }
};

export const scanTabMap = async () => {
  try {
    const scannedTabs = await chrome.tabs.query({});

    const tabMap = new Map();
    for (const tab of scannedTabs) {
      tabMap.set(tab.id, tab.url);
    }

    return tabMap;
  } catch (error) {
    console.log("Error scanning tab map:", error);
    throw error;
  }
};

// returns null if the URL is not in correct format
export const extractHostname = (url) => {
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
      throw new Error();
    }

    const hostnameLastArray = new URL(url).hostname.split(".").splice(-2); // DRY!
    const hostname = hostnameLastArray[0] + "." + hostnameLastArray[1];

    return hostname;
  } catch (error) {
    console.log("Errorr in the url: ", url);
    console.log(error);
    throw new Error("URL is not in the correct format."); // change later
  }
};