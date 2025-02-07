import {
  getBlockingTime,
  getList,
  getListMode,
  setBlockingTimeMessage,
  changeListModeMessage,
} from "./popup-modules/popup-messages.js";
import { ListManager } from "./popup-modules/ListManager.js";

const inputField = document.querySelector("#url-input");
const addButton = document.querySelector("#url-add-btn");

const modeButton = document.querySelector("#mode-btn");
const timeInput = document.querySelector("#time-inp");
const addSecondButton = document.querySelector("#add-time-btn");
const subtractSecondButton = document.querySelector("#subtract-time-btn");

let blockingMode = "BlockList";
let blockingTime = 15;
let listManager;

// adding the url to the list
const addUrl = async () => {
  const currentUrl = inputField.value;
  const response = await listManager.addUrl(currentUrl);

  const errorWrapper = document.querySelector("#error-p");
  if (response.type === "ERROR") {
    errorWrapper.textContent = response.message;
  } else {
    errorWrapper.textContent = "";
    inputField.value = "";
  }
};
addButton.addEventListener("click", addUrl);
inputField.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addUrl();
  }
});

// setting the blocking time
const setTime = async (seconds) => {
  const response = await setBlockingTimeMessage(seconds);

  timeInput.value = response.time;
  blockingTime = response.time;
};
addSecondButton.addEventListener("click", () => setTime(blockingTime + 1));
subtractSecondButton.addEventListener("click", () => setTime(blockingTime - 1));

timeInput.addEventListener("blur", () => setTime(parseInt(timeInput.value)));
timeInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    setTime(parseInt(timeInput.value));
    event.target.blur();
  }
});

// changing the list mode
modeButton.addEventListener("click", async () => {
  blockingMode = await changeListModeMessage();
  modeButton.textContent = blockingMode;

  const anotherUrls = await getList(blockingMode);
  listManager.setUrls(anotherUrls);
  listManager.renderAll();
});

// loading data from the background
window.onload = async () => {
  blockingTime = await getBlockingTime();
  timeInput.value = blockingTime;

  blockingMode = await getListMode();
  modeButton.textContent = blockingMode;

  const urls = await getList(blockingMode);
  const urlWrapper = document.querySelector("#url-list");
  listManager = new ListManager(urls, urlWrapper);
  listManager.renderAll();

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // getting the current tab URL
    inputField.value = tabs[0].url;
  });
};
