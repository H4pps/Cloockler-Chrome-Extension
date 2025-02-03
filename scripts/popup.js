import { getBlockingTime, getList, getListMode } from "./popup-modules/popup-messages.js";  
import { ListManager } from "./popup-modules/ListManager.js";

const inputField = document.querySelector("#url-input");
const addButton = document.querySelector("#url-add-btn");

const modeButton = document.querySelector("#mode-btn");
const secondsCounter = document.querySelector("#seconds-counter");
const incrementArrowButton = document.querySelector("#btn-increment-arrow");
const decrementArrowButton = document.querySelector("#btn-decrement-arrow");

const urlList = document.querySelector("#url-list"); // wrapper div for the list of URLs

let currentMode = "BlockList";
let blockingTime = 15;
let listManager;

window.onload = async () => {
  blockingTime = await getBlockingTime();
  secondsCounter.value = blockingTime;

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

incrementArrowButton.addEventListener("click", event => {
  chrome.runtime.sendMessage({text: "set blocking time", time: parseInt(secondsCounter.value) + 1})
  .then(response => {
    secondsCounter.value = response.time;
  });
});

decrementArrowButton.addEventListener("click", event => {
  chrome.runtime.sendMessage({text: "set blocking time", time: parseInt(secondsCounter.value) - 1})
  .then(response => {
    secondsCounter.textContent = response.time;
  });
});

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