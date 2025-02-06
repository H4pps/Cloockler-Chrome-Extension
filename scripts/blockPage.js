let TIME_KEY = "savedTime";
const timerCountdown = document.querySelector("#timer-countdown");

const getStartingTime = async () => {
  const storageData = await chrome.storage.session.get(TIME_KEY);
  console.log("savedTime in session storage:", storageData[TIME_KEY]);
  if (typeof storageData[TIME_KEY] === "undefined") {
    const response = await chrome.runtime.sendMessage({
      text: "get blocking time",
    });
    return response.time;
  }

  return storageData[TIME_KEY];
};

const convertSecondsToTimerText = (durationInSeconds) => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;

  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const clearSessionStorageIfLoaded = async () => {
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length > 0 && navEntries[0].type !== "reload") {
    // deleting the time key if the page is closed
    console.log("clearing the time key:", TIME_KEY);
    await chrome.storage.session.remove(TIME_KEY);
  }
}

chrome.tabs.query({ active: true, currentWindow: true }).then(async (tabs) => {
  TIME_KEY += tabs[0].id;
  await clearSessionStorageIfLoaded();

  getStartingTime().then((time) => {
    console.log("time in blockpage:", time);
    timerCountdown.textContent = convertSecondsToTimerText(time);

    function updateTimer() {
      --time;

      if (time >= 0) {
        chrome.storage.session.set({ [TIME_KEY]: time });
        timerCountdown.textContent = convertSecondsToTimerText(time);
      }
    }

    setTimeout(() => {
      updateTimer();
      setInterval(updateTimer, 1000);
    }, 400);
  });
});

window.addEventListener("load", () => {
  clearSessionStorageIfLoaded();
});
