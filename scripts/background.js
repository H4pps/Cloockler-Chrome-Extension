console.log("BACKGROUND SCRIPT WAS LOADED");
const dataSavingID = "dataSaving";
const previousTabMapSavingID = "prevTabMap";
let programData = {
    sites: {
        blocklist: [],
        allowlist: []
    },
    blockingTime: 15,
    isBlocklistMode: true
}

const maxBlockingTime = 60;
const minBlockingTime = 10;

let tabIdToPreviousHostname = new Map(); 

let saveDataToMemory = (data, savingID) => {
    chrome.storage.sync.set({[savingID]: JSON.stringify(data)});
}

let getProgramData = savingID => {
    chrome.storage.sync.get([savingID])
    .then(data => {
        if (typeof data[savingID] === "undefined") {
            console.log(`There is no data with ID ${savingID} in the memory`);
            programData = {
                sites: {
                    blocklist: [],
                    allowlist: []
                },
                blockingTime: 15,
                isBlocklistMode: true
            }
        } else {
            programData = JSON.parse(data[savingID]);
        }
    });
}

let saveTabIdMap = savingID => {
    // making an array from map
    const mapArray = Array.from(tabIdToPreviousHostname.entries());
    chrome.storage.local.set({[savingID]: mapArray});
}

let getTabIdMap = savingID => {
    chrome.storage.local.get([savingID])
    .then(data => {
        if (typeof data[savingID] === "undefined") {
            console.log("There is no saved Map in the storage");
            tabIdToPreviousHostname = new Map();
        } else {
            tabIdToPreviousHostname = new Map(data[savingID]);
        }
    });
}

// loading blocking data from the chrome storage
getProgramData(dataSavingID);
getTabIdMap(previousTabMapSavingID);

chrome.runtime.onUpdateAvailable.addListener(() => {
    console.log("updating extension to the newest version");
    chrome.runtime.reload();
});

chrome.runtime.onStartup.addListener(() => {
    getProgramData(dataSavingID);

    // removing data from the previous session
    chrome.storage.local.remove(previousTabMapSavingID);
    getTabIdMap(previousTabMapSavingID);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.text === "get list mode") { // asking for the blocklist/allowlist mode
        sendResponse({mode: programData.isBlocklistMode});
    } 
    else if (message.text === "change list mode") { // setting the blocklist/allowlist mode
        programData.isBlocklistMode = !programData.isBlocklistMode;
        saveDataToMemory(programData, dataSavingID);
        sendResponse({mode: programData.isBlocklistMode});
    }
    else if (message.text === "get current list") { // sending the list with the given mode
        let response = {list: []};
        response.list = message.mode? programData.sites.blocklist : programData.sites.allowlist;

        sendResponse(response);
    }
    else if (message.text === "set to list") { // adding site to blocklist/allowlist
        try {
            const hostname = extractHostname(message.url);
            if (programData.isBlocklistMode) {
                checkIncludes(hostname, programData.sites.blocklist);
                saveDataToMemory(programData, dataSavingID);
            } else {
                checkIncludes(hostname, programData.sites.allowlist);
                saveDataToMemory(programData, dataSavingID);
            }
            sendResponse({type: "OK", hostname: hostname});
        } catch(error) {
            sendResponse({type: "ERROR", message: "URL is not in the correct format."});
        }
    } 
    else if (message.text === "delete from list") {
        if (programData.isBlocklistMode) {
            deleteItem(programData.sites.blocklist, message.url);
            saveDataToMemory(programData, dataSavingID);
        } else {
            deleteItem(programData.sites.allowlist, message.url);
            saveDataToMemory(programData, dataSavingID);
        }
    }
    else if (message.text === "get blocking time") {
        sendResponse({time: programData.blockingTime});
    }
    else if (message.text === "set blocking time") {
        if (message.time >= minBlockingTime && message.time <= maxBlockingTime) {
            programData.blockingTime = message.time;
            saveDataToMemory(programData, dataSavingID);
            sendResponse({type: "OK", time: programData.blockingTime});
        } 
        else {
            sendResponse({type: "ERROR", time: programData.blockingTime});
        }
    }  
});

// delete the hostname from the list
let deleteItem = (siteList, hostname) => {
    const index = findIndexOfUrl(siteList, hostname);
    siteList.splice(index, 1);
}

// find the index of the hosname in the list
let findIndexOfUrl = (sitesList, hostname) => {
    for (let i = 0; i < sitesList.length; ++i) {
        if (hostname === sitesList[i]) {
            return i;
        }
    }

    return null;
}

let checkIncludes = (site, sitesList) => {
    if (sitesList.includes(site)) {
        throw new Error("URL hostname is already in the list");
    }

    sitesList.push(site);
}



// returns null if the URL is not in correct format
let extractHostname = (url) => {
    try {
        if (url.startsWith("chrome-extension:")) {
            throw new Error("Got chrome-extension:// url");
        }

        // adding "https://" if the string does not start with that
        if (!url.startsWith("https://") && !url.startsWith('http://')) {
            url = "https://" + url;
        }
        
        let flag = false;
        url.split('.').forEach(function(number) {
            if (number.length === 0) {
                flag = true;
            }
        });
        if (flag || !url.includes('.')) {
            throw new Error("URL is not in the correct format.");
        }

        const hostnameLastArray = (new URL(url)).hostname.split('.').splice(-2); // DRY!
        const hostname = hostnameLastArray[0] + '.' + hostnameLastArray[1];

        return hostname;
    } catch (error) {
        console.log("Errorr in the url: ", url);
        console.log(error);
        throw new Error(`URL ${url} is not in the correct format.`); // change later
    }
}

// executes every time when the tab was updated/added
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.url.startsWith("chrome://") && !tab.url.startsWith("chrome-extension://")) {
        if (changeInfo.status === 'complete') {
            const hostname = extractHostname(tab.url);
            console.log("Previous: ", tabIdToPreviousHostname.get(tabId));
            console.log("To: ", tab.url);
            if (checkBlocking(hostname) && !equalPreviousURL(tabId, hostname) && hostname != "google.com") {
                // adding the tabId to the map of all current tabs
                // (preventing blocking the same website serveral times in a row)
                tabIdToPreviousHostname.set(tabId, hostname); 
                saveTabIdMap(previousTabMapSavingID);
                console.log("Blocking");
                console.log("Blocking time: ", programData.blockingTime);

                const navigatingURL = tab.url;
                chrome.tabs.update(tab.id, {url: "blockPage/blockPage.html"})
                .then(() => {  
                    setTimeout(() => {
                        // checking if the tab was closed while timeout
                        if (tabIdToPreviousHostname.has(tab.id)) {
                            chrome.tabs.update(tab.id, {url: navigatingURL})
                        }
                    }, programData.blockingTime * 1000 + 200);
                });
            } 
        }
    }
});

let checkBlocking = hostname => {
    if (programData.isBlocklistMode) {
        return programData.sites.blocklist.includes(hostname);
    }

    return !programData.sites.allowlist.includes(hostname);
}

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    tabIdToPreviousHostname.delete(tabId);
    saveTabIdMap(previousTabMapSavingID);
});

function equalPreviousURL(tabId, hostname) {
    return hostname === tabIdToPreviousHostname.get(tabId);
}