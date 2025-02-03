import { getBlockingTime, getList, getListMode, setBlockingTimeMessage } from "./popup-modules/popup-messages.js";  
import { ListManager } from "./popup-modules/ListManager.js";

const inputField = document.querySelector("#url-input");
const addButton = document.querySelector("#url-add-btn");

const modeButton = document.querySelector("#mode-btn");
const timeInput = document.querySelector("#time-inp");
const addSecondButton = document.querySelector("#add-time-btn");
const subtractSecondButton = document.querySelector("#subtract-time-btn");

const urlList = document.querySelector("#url-list"); // wrapper div for the list of URLs

let currentMode = "BlockList";
let blockingTime = 15;
let listManager;

window.onload = async () => {
  blockingTime = await getBlockingTime();
  timeInput.value = blockingTime;

  currentMode = await getListMode();
  modeButton.textContent = currentMode;

  const urls = await getList(currentMode);
  const urlWrapper = document.querySelector("#url-list"); 
  listManager = new ListManager(urls, urlWrapper);
  listManager.renderAll();

  chrome.tabs.query({active: true, currentWindow: true}, tabs => { // getting the current tab URL
    inputField.value = tabs[0].url;
  });
}

const addUrl = async () => { // adding url to the list
  const currentUrl = inputField.value;
  const response = await listManager.addUrl(currentUrl);

  const errorWrapper = document.querySelector("#error-p");
  if (response.type === "ERROR") {
    errorWrapper.textContent = response.message;
  }
  else {
    errorWrapper.textContent = "";
    inputField.value = "";
  }
}
addButton.addEventListener("click", addUrl);
inputField.addEventListener("keypress", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    addUrl();
  }
});

const setTime = async (seconds) => {
  const response = await setBlockingTimeMessage(seconds);

  timeInput.value = response.time;
  blockingTime = response.time;
};
addSecondButton.addEventListener("click", () => setTime(blockingTime + 1));
subtractSecondButton.addEventListener("click", () => setTime(blockingTime - 1));
timeInput.addEventListener("keypress", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    setTime(parseInt(timeInput.value));
  }
});

// incrementArrowButton.addEventListener("click", () => {
//   // chrome.runtime.sendMessage({text: "set blocking time", time: parseInt(timeInput.value) + 1})
//   // .then(response => {
//   //   timeInput.value = response.time;
//   // });

// });
// subtractSecondButton.addEventListener("click", event => {

// decrementArrowButton.addEventListener("click", event => {
//   chrome.runtime.sendMessage({text: "set blocking time", time: parseInt(timeInput.value) - 1})
//   .then(response => {
//     timeInput.textContent = response.time;
//   });
// });

modeButton.addEventListener("click", event => {
  chrome.runtime.sendMessage({text: "change list mode"})
  .then(response => {
    modeButton.textContent = response.mode ? "Blocklist" : "Allowlist";
    return chrome.runtime.sendMessage({text: "get current list", mode: response.mode});
  })
  .then(response => {
    renderList(response.list);
  })
});


let renderList = siteList => {
  urlList.innerHTML = "";
  for (let i = 0; i < siteList.length; ++i) {
    addElementToDisplay(siteList[i]);
  }
};

let addElementToDisplay = URL => { // adding an HTML object representing the new element (with given URL)
  const newItem = document.createElement("div"); // the wrap for the URL and delete button
  const ID = Math.random(); // setting a random id to the HTML object
  newItem.id = "item-" + ID;
  newItem.className = 'list-item';

  const itemUrl = document.createElement("span"); // displaying URL
  itemUrl.className = "url-span";
  itemUrl.textContent = URL;
  const deleteButton = document.createElement("button"); // delete button
  deleteButton.className = "delete-button";
  deleteButton.textContent = "✕"
  deleteButton.onclick = () => { // setting the delete function
    chrome.runtime.sendMessage({text: "delete from list", url: itemUrl.textContent});
    deleteDisplayItem(ID);
  }

  newItem.appendChild(itemUrl);
  newItem.appendChild(deleteButton);

  urlList.appendChild(newItem);
};

let deleteDisplayItem = ID => { // deleting ab HTML object representing deleted element
  let listContainer = document.getElementById("url-list");
  var itemToDelete = document.getElementById('item-' + ID);
  listContainer.removeChild(itemToDelete);
};