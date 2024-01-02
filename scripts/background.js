const sitesSavingID = "savedSites";

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') { // loading of the tab was complete
        chrome.storage.sync.get([sitesSavingID],(data) => {
            let sites = [];
            if (typeof data[sitesSavingID] != "undefined") {
                sites = JSON.parse(data[sitesSavingID]);
            }

            const hostname = (new URL(tab.url)).hostname; // getting the hostname
            if (sites.includes(hostname)) {
                const msgStart = {
                    text: "Start blocking event",
                    hostname: hostname
                }

                chrome.tabs.sendMessage(tab.id, msgStart)  
            }
        });
    }
});