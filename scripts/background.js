chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') { // loading of the tab was complete
        const msgStart = {
            text: "Start update event",
            url: tab.url
        }

        chrome.tabs.sendMessage(tab.id, msgStart)  
    }
});