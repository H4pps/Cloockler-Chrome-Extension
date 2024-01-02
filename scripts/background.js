const sitesSavingID = "savedSites";

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') { // loading of the tab was complete
        chrome.storage.sync.get([sitesSavingID],(data) => {
            let sites = [];
            if (typeof data[sitesSavingID] != "undefined") {
                sites = JSON.parse(data[sitesSavingID]);
            }

            if (sites.includes((new URL(tab.url)).hostname)) {
                const msgStart = {
                    text: "Start blocking event",
                    url: tab.url
                }

                chrome.tabs.sendMessage(tab.id, msgStart)  
            }
        });
    }
});