const inputField = document.getElementById("url-in");
const addButton = document.getElementById("btn-add");
const sitesSavingID = "savedSites";
//let sites = []; // can be done with a map in the future #CHANGE

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

// add handling only the hostname inputs like "google.com", add further validation like find dots etc
function inputEvent() {
    chrome.runtime.sendMessage({text: "set to list", url: inputField.value}, (response) => {
        console.log("Popup response:", response);
        if (response.type === "ERROR") {
            document.getElementById("error-p").textContent = response.message;
        } else {
            addElementToDisplay(response.hostname);
            document.getElementById("error-p").textContent = "";
            inputField.value = "";
        }
    });
}

// function extractHostname(url) { // return null if the URL is not in correct format
//     try {
//         if (!url.startsWith("https://") && !url.startsWith('http://')) { // adding "https://" if the string does not start with that
//             url = "https://" + url;
//         }
        
//         let flag = false;
//         url.split('.').forEach(function(number) {
//             if (number.length === 0) {
//                 flag = true;
//             }
//         });
//         if (flag || !url.includes('.')) {
//             throw new Error("URL is not in the correct format.");
//         }

//         const hostnameLastArray = (new URL(url)).hostname.split('.').splice(-2);
//         const hostname = hostnameLastArray[0] + '.' + hostnameLastArray[1];

//         return hostname;
//     } catch (error) {
//         throw new Error("URL is not in the correct format.");
//     }
// }

// getting sites array from the memory and dispalying them (because of asynchronious behaviour)
function preload() {
    chrome.runtime.sendMessage({text: "get list mode"})
    .then((response) => {
        // console.log("Current mode is blocklist:", response.mode);
        return response.mode;
    })
    .then((mode) => {
        // console.log("Mode passed to .then: ", mode);
        return chrome.runtime.sendMessage({text: "get current list", mode: mode});
    })
    .then((response) => {
        // console.log("Returned response to 'get current list'", response);
        // console.log("List returned to the popup.js:", response.list);
        renderList(response.list);
    });
    // chrome.storage.sync.get([sitesSavingID],(data) => {
    //     if (typeof data[sitesSavingID] === "undefined") {
    //         saveSitesListToMemory(sites); // defining the value in the memory
    //     } else {
    //         sites = JSON.parse(data[sitesSavingID]);
    //     }

    //     renderList(sites);
    // });
}

let renderList = (siteList) => {
    for (let i = 0; i < siteList.length; ++i) {
        addElementToDisplay(siteList[i]);
    }
};

let addElementToDisplay = (URL) => { // adding an HTML object representing the new element (with given URL)
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
        deleteItem(ID, itemUrl.textContent);
    }

    newItem.appendChild(itemUrl);
    newItem.appendChild(deleteButton);

    urlList.appendChild(newItem);
};

let deleteItem = (ID, Url) => {
    const index = findIndexOfUrl(sites, Url);
    if (index != null) {
        deleteDisplayItem(ID);
        sites.splice(index, 1);

        saveSitesListToMemory();
    } else {
        console.error(`ERROR 1: don't have that URL in the database. URL: ${Url}`);
        console.log(sites);
    }
};

let findIndexOfUrl = (sites, Url) => {
    for (let i = 0; i < sites.length; ++i) {
        if (Url === sites[i]) {
            return i;
        }
    }

    return null
};

let deleteDisplayItem = (ID) => { // deleting ab HTML object representing deleted element
    let listContainer = document.getElementById("url-list");
    var itemToDelete = document.getElementById('item-' + ID);
    listContainer.removeChild(itemToDelete);
};