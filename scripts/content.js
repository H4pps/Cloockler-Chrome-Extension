const localStorageSavedID = "savedSites"; 

chrome.runtime.onMessage.addListener(getMessage);
function getMessage(message, sender, sendResponse) {
    let sites = [];
    console.log("Message received");
    if (message.text === "Start update event") {
        console.log("Update started");
        console.log(sites);
        getSitesListFromMemory();
        
        if (sites.includes((new URL(message.url)).hostname)) {
            console.log("BLOCKING!");
        }
    } else if (message.text === "Stop update event") {

    } else if (message.text === "Update memory" ) {
        
    }
}

// Same function is in the popup.js, mb somehow link these files together #CHANGE
function getSitesListFromMemory() { // the whole function can be more efficient, but it's okay for now #CHANGE
    const sitesFromMemory = JSON.parse(localStorage.getItem(localStorageSavedID)); // null if we don't have saved sites in local storage
    if (sitesFromMemory) { // null checking
        sites = sitesFromMemory;
    }
}