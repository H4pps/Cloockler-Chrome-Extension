const programDataKey = "dataSaving";
const tabMapKey = "prevTabMap";

export const loadBlockData = async () => {
  try {
    const loadedData = await chrome.storage.sync.get(programDataKey);
    if (typeof loadedData[programDataKey] === "undefined") {
      console.log("There is no block data in the storage");
      return {
        sites: {
          blocklist: [],
          allowlist: []
        },
        blockingTime: 15,
        isBlocklistMode: true
      };
    }

    return JSON.parse(loadedData[programDataKey]);
  } catch (error) {
    console.error(`Error loading program data (key: ${programDataKey}):`, error);
    throw error;
  }
};

export const loadTabMap = async () => {
  try {
    const loadedData = await chrome.storage.local.get(tabMapKey);
    if (typeof loadedData[tabMapKey] === "undefined") {
      console.log("There is no tab map in the storage");
      return new Map();
    }

    return new Map(loadedData[tabMapKey]);
  } catch (error) {
    console.error(`Error loading tab map (key: ${tabMapKey}):`, error);
    throw error;
  }
};
