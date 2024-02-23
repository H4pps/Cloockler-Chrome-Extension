//const blocklistSavingID = "blocklistSaved";
const blocklistSavingID = "savedSites";
const allowlistSavingID = "allowlistSaved";
let isBlocklistMode = true;

let blockingTime;
const maxBlockingTime = 60;
const minBlockingTime = 5;

const sites = {
    blocklist: ["monkeytype.com", "typeracer.com"],
    allowlist: ["github.com", "codeforces.com"]
};

const tabIdToPreviousHostname = new Map();

chrome.runtime.onUpdateAvailable.addListener(() => {
    console.log("updating extension to the newest version");
    chrome.runtime.reload();
});

chrome.runtime.onStartup.addListener(() => {
    sites.blocklist = loadSiteList(blocklistSavingID);
    sites.allowlist = loadSiteList(allowlistSavingID);
    blockignTime = 15; // leave for now
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log("Current list in the background.js", sites.blocklist);
    if (message.text === "get list mode") { // asking for the blocklist/allowlist mode
        sendResponse({mode: isBlocklistMode});
    } 
    else if (message.text === "change list mode") { // setting the blocklist/allowlist mode
        console.log("Mode changed");
        isBlocklistMode = !isBlocklistMode;
        sendResponse({mode: isBlocklistMode});
    }
    else if (message.text === "get current list") { // sending the list with the given mode
        response = {list: []};
        response.list = message.mode? sites.blocklist : sites.allowlist;

        sendResponse(response);
    }
    else if (message.text === "set to list") { // adding site to blocklist/allowlist
        try {
            const hostname = extractHostname(message.url);
            if (isBlocklistMode) {
                checkIncludes(hostname, sites.blocklist);
                //saveSitesListToMemory(blocklistSavingID, sites.blocklist);
            } else {
                checkIncludes(hostname, sites.allowlist);
                //saveSitesListToMemory(allowlistSavingID, sites.allowlist);
            }
            sendResponse({type: "OK", hostname: hostname});
        } catch(error) {
            sendResponse({type: "ERROR", message: error.message});
        }
    } 
    else if (message.text === "delete from list") {
        if (isBlocklistMode) {
            deleteItem(sites.blocklist, message.url);
            //saveSiteListToMemory(blocklistSavingID, sites.blocklist);
        } else {
            deleteItem(sites.allowlist, message.url);
            //saveSiteListToMemory(allowlistSavingID, sites.allowlist);
        }
    }
    else if (message.text === "get blocking time") {
        sendResponse({time: blockingTime});
    }
    else if (message.text === "set blocking time") {
        console.log("New time:", message.time);
        if (message.time >= minBlockingTime && message.time <= maxBlockingTime) {
            blockingTime = message.time;
            sendResponse({type: "OK", time: blockingTime});
        } 
        else {
            sendResponse({type: "ERROR", time: blockingTime});
        }
    }  
});

let deleteItem = (siteList, hostname) => {
    const index = findIndexOfUrl(siteList, hostname);
    siteList.splice(index, 1);

    //saveSiteListToMemory();
}

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

let extractHostname = (url) => { // returns null if the URL is not in correct format
    try {
        if (!url.startsWith("https://") && !url.startsWith('http://')) { // adding "https://" if the string does not start with that
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
        throw new Error("URL is not in the correct format.");
    }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { // executes every time when the tab was updated/added
    if (changeInfo.status === 'complete') { // loading of the tab was complete
        // chrome.storage.sync.get([blocklistSavingID]).then((data) => {
        //     loadSiteList(blocklistSavingID, data);
        //     const hostnameLastArray = (new URL(tab.url)).hostname.split('.').splice(-2); // getting high-domain of the url
        //     const hostname = hostnameLastArray[0] + '.' + hostnameLastArray[1];

        //     if (sites.blocklist.includes(hostname) && !equalPreviousURL(tabId, hostname)) {
        //         const msgStart = {
        //             text: "start blocking event",
        //             time: blockingTime,
        //             hostname: hostname
        //         }

        //         chrome.tabs.sendMessage(tab.id, msgStart);
        //     }

        //     tabIdToPreviousHostname.set(tabId, hostname);
        // });

        // const hostnameLastArray = (new URL(tab.url)).hostname.split('.').splice(-2); // getting high-domain of the url
        // const hostname = hostnameLastArray[0] + '.' + hostnameLastArray[1];
        if (!tab.url.startsWith("chrome://")) { // #CHANGE with filtering later
            const hostname = extractHostname(tab.url);

            if (checkBlocking(hostname) && !equalPreviousURL(tabId, hostname)) {
                const msgStart = {
                    text: "start blocking event",
                    time: blockingTime,
                    hostname: hostname
                }

                chrome.tabs.sendMessage(tab.id, msgStart);
            }

            tabIdToPreviousHostname.set(tabId, hostname);   
        }
    }
});

let checkBlocking = hostname => {
    if (isBlocklistMode) {
        return sites.blocklist.includes(hostname);
    }

    return !sites.allowlist.includes(hostname);
}

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    tabIdToPreviousHostname.delete(tabId);
});

function equalPreviousURL(tabId, hostname) {
    previousURL = tabIdToPreviousHostname.get(tabId);

    return hostname === previousURL;
}

let loadSiteList = (sitesSavingID) => {
    chrome.storage.sync.get([sitesSavingID],(data) => {
        if (typeof data[sitesSavingID] === "undefined") { // checks if the key exists
            //saveSitesListToMemory(sites); // defining the value in the memory
            console.log("There is no sites in the memory")

            return [];
        } else {
            return JSON.parse(data[sitesSavingID]);
        }
    });
};

let saveSiteListToMemory = (sitesSavingID, siteList) => { // saving sites to the local storage memory
    chrome.storage.sync.set({[sitesSavingID]: JSON.stringify(siteList)});
};
