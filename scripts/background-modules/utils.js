const programDataKey = "dataSaving";

export const loadBlockData = async () => {
  try {
    const loadedData = await chrome.storage.sync.get(programDataKey);
    if (typeof loadedData[programDataKey] === "undefined") {
      console.log("There is no block data in the storage");
      return {
        blocklist: [],
        allowlist: [],
        blockingTime: 15,
        isBlocklistMode: true,
      };
    }

    return JSON.parse(loadedData[programDataKey]);
  } catch (error) {
    console.error(
      `Error loading program data (key: ${programDataKey}):`,
      error
    );
    throw error;
  }
};

export const saveToBlockData = async (data) => { // will be called only form background.js 
  try {
    chrome.storage.sync.set({programDataKey: JSON.stringify(data) });
  } catch (error) {
    console.error(`Error saving program data (key: ${programDataKey}):`, error);
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
