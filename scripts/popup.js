const inputField = document.getElementById("url-in");
const addButton = document.getElementById("btn-add");

const modeButton = document.getElementById("btn-mode");
const secondsCounter = document.getElementById("seconds-counter");
const incrementArrowButton = document.getElementById("btn-increment-arrow");
const decrementArrowButton = document.getElementById("btn-decrement-arrow");

const urlList = document.getElementById("url-list"); // wrapper div for the list of URLs

preload();
//console.log(sites)
//renderList();

addButton.addEventListener("click", inputEvent); // site url input
inputField.addEventListener("keypress", function(event){
  if (event.key === "Enter") {
    event.preventDefault();
    inputEvent();
  }
});

function inputEvent() {
  chrome.runtime.sendMessage({text: "set to list", url: inputField.value}, (response) => {
    console.log("Popup response:", response);
    if (response.type === "ERROR") {
      document.getElementById("error-p").textContent = response.message;
    }
    else {
      addElementToDisplay(response.hostname);
      document.getElementById("error-p").textContent = "";
      inputField.value = "";
    }
  });
}

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

// getting sites array from the memory and dispalying them (because of asynchronious behaviour)
function preload () {
  chrome.runtime.sendMessage({text: "get blocking time"})
  .then(response => {
    secondsCounter.value = response.time;
  });

  chrome.runtime.sendMessage({text: "get list mode"})
  .then(response => {
    // console.log("Current mode is blocklist:", response.mode);
    modeButton.textContent = response.mode ? "Blocklist" : "Allowlist";
    return chrome.runtime.sendMessage({text: "get current list", mode: response.mode});
  })
  .then(response => {
    // console.log("Returned response to 'get current list'", response);
    // console.log("List returned to the popup.js:", response.list);
    renderList(response.list);
  });

  // copying the current tab url to the input field
  chrome.tabs.query({active: true, currentWindow: true}).then(tabs => {
    console.log(tabs[0].url);
    inputField.value = tabs[0].url;
  })
}

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