const inputField = document.getElementById("url-in");
const addButton = document.getElementById("btn-add");
const localStorageSavedID = "savedSites";
let sites = []; // can be done with a map in the future #CHANGE

getSitesListFromMemory();
console.log(sites)
renderList();

addButton.addEventListener("click", inputEvent);
inputField.addEventListener("keypress", function(event){
    if (event.key === "Enter") {
        event.preventDefault();
        inputEvent();
    }
});

function inputEvent() {
    const site = inputField.value; // getting the string from intput field
    
    if (isCorrectURL(site) && !sites.includes(site)) {
        sites.push(site);
        addElementToDisplay(document.getElementById("url-list"), site);
        saveSitesListToMemory(); // can be changed later to save to only on closing the window #CHANGE
    }

    inputField.value = "";
    console.log(sites);
}

function isCorrectURL(URL) { // change later to connection check #CHANGE
    if (URL == "") {
        console.log("ERROR: empty URL!");
        return false;
    }

    return true;
}

function getSitesListFromMemory() { // the whole function can be more efficient, but it's okay for now #CHANGE
    const sitesFromMemory = JSON.parse(localStorage.getItem(localStorageSavedID));
    if (sitesFromMemory) { // null checking
        sites = sitesFromMemory;
    }
}

function saveSitesListToMemory() { // saving sites to the local storage memory
    localStorage.setItem(localStorageSavedID, JSON.stringify(sites));
}

function renderList() {
    const urlList = document.getElementById("url-list");
    for (let i = 0; i < sites.length; ++i) {
        addElementToDisplay(urlList, sites[i]);
    }
}

function addElementToDisplay(urlList, URL) { // adding an HTML object representing the new element (with given URL)
    const newItem = document.createElement("div"); // wrap for the URL and delete button
    const ID = Math.random(); // setting a random id to the HTML object
    newItem.id = "item-" + ID;
    newItem.className = 'list-item';
    
    const itemUrl = document.createElement("span"); // displaying URL
    itemUrl.className = "url-span";
    itemUrl.textContent = URL;
    const deleteButton = document.createElement("button"); // delete button
    deleteButton.className = "delete-button";
    deleteButton.textContent = "✕"
    deleteButton.onclick = function() { // setting the delete
        deleteItem(ID, itemUrl.textContent);
    }

    newItem.appendChild(itemUrl);
    newItem.appendChild(deleteButton);

    urlList.appendChild(newItem);
}

function deleteItem(ID, Url) {
    const index = findIndexOfUrl(Url);
    if (index != null) {
        deleteDisplayItem(ID);
        sites.splice(index, 1);

        saveSitesListToMemory();
    } else {
        console.error(`ERROR 1: don't have that URL in the database. URL: ${Url}`);
        console.log(sites);
    }
}

function findIndexOfUrl(Url) {
    for (let i = 0; i < sites.length; ++i) {
        if (Url === sites[i]) {
            return i;
        }
    }

    return null
}

function deleteDisplayItem(ID) { // deleting ab HTML object representing deleted element
    let listContainer = document.getElementById("url-list");
    var itemToDelete = document.getElementById('item-' + ID);
    listContainer.removeChild(itemToDelete);
}