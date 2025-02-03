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
      mode: mode,
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

export const setBlockingTimeMessage = async (time) => {
  try {
    console.log("sending seconds:", time);
    const response = await chrome.runtime.sendMessage({
      text: "set blocking time",
      time: time,
    });

    console.log("response type:", response.type);
    console.log("response time:", response.time);
    return response;
  } catch (error) {
    console.error("Error setting blocking time:", error);
    throw error;
  }
};