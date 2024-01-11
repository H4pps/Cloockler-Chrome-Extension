chrome.runtime.onUpdateAvailable.addListener(function() {
    console.log("updating extension to the newest version");
    chrome.runtime.reload();
});

const sitesSavingID = "savedSites";
const tabIdToPreviousHostname = new Map();

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') { // loading of the tab was complete
        chrome.storage.sync.get([sitesSavingID],(data) => {
            let sites = [];
            if (typeof data[sitesSavingID] != "undefined") {
                sites = JSON.parse(data[sitesSavingID]);
            }
            
            const hostname = (new URL(tab.url)).hostname; // getting the hostname
            if (sites.includes(hostname) && !equalPreviousURL(tabId, hostname)) {
                const msgStart = {
                    text: "Start blocking event",
                    hostname: hostname
                }

                chrome.tabs.sendMessage(tab.id, msgStart);
            }

            tabIdToPreviousHostname.set(tabId, hostname);
        });
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    tabIdToPreviousHostname.delete(tabId);
});

function equalPreviousURL(tabId, hostname) {
    previousURL = tabIdToPreviousHostname.get(tabId);

    return hostname === previousURL;
}