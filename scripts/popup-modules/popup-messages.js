export const getBlockingTime = async () => { 
  try {
    const response = await chrome.runtime.sendMessage({
      text: "get blocking time",
    });

    return response.time;
  } catch (error) {
    console.error("Error getting blocking time:", error);
    throw error;
  }
};

export const setBlockingTimeMessage = async (time) => {
  try {
    const response = await chrome.runtime.sendMessage({
      text: "set blocking time",
      time: time,
    });

    return response;
  } catch (error) {
    console.error("Error setting blocking time:", error);
    throw error;
  }
};

export const getListMode = async () => {
  try {
    const response = await chrome.runtime.sendMessage({
      text: "get list mode",
    });

    return response.mode ? "BlockList" : "AllowList";
  } catch (error) {
    console.error("Error getting list mode:", error);
    throw error;
  }
};

export const getList = async (mode) => {
  try {
    const response = await chrome.runtime.sendMessage({
      text: "get current list",
      mode: mode === "BlockList",
    });

    return response.list;
  } catch (error) {
    console.error("Error getting list:", error);
    throw error;
  }
};

export const deleteFromListMessage = async (url) => { 
  try {
    await chrome.runtime.sendMessage({
      text: "delete from list",
      url: url,
    });
  } catch (error) {
    console.error("Error deleting from list:", error);
    throw error;
  } 
};

export const setToListMessage = async (url) => {
  try {
    const response = await chrome.runtime.sendMessage({
      text: "set to list",
      url: url,
    });

    return response;
  } catch (error) {
    console.error("Error setting to list:", error);
    throw error;
  }  
};

export const changeListModeMessage = async () => {
  try {
    const response = await chrome.runtime.sendMessage({
      text: "change list mode",
    });

    return response.mode ? "BlockList" : "AllowList";
  } catch (error) {
    console.error("Error changing list mode:", error);
    throw error;
  }
}