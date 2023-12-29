const inputField = document.getElementById("url-in");
const addButton = document.getElementById("btn-add");
const localStorageSavedID = "savedSites";
let sites = []; // can be done with a map in the future #CHANGE
getSitesListFromMemory();
console.log(sites)

addButton.addEventListener("click", function() {
    const site = inputField.value; // getting the string from intput field
    
    if (isCorrectURL(site) && !sites.includes(site)) {
        sites.push(site);
        saveSitesListToMemory(); // can be changed later to save to only on closing the window #CHANGE
    }

    console.log(sites);
});

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

function saveSitesListToMemory() {
    localStorage.setItem(localStorageSavedID, JSON.stringify(sites));
}
