export const getBlockingTime = async () => {
  try {
    const response = await chrome.runtime.sendMessage({
      text: "get list mode",
    });

    console.log("received blocking time:", response.time);
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

    console.log("received list mode:", response.mode);
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

    console.log("received list:", response.list);
    return response.list;
  } catch (error) {
    console.error("Error getting list:", error);
    throw error;
  }
};
