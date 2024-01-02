chrome.runtime.onMessage.addListener(getMessage);
function getMessage(message, sender, sendResponse) {
    if (message.text === "Start blocking event") {
        const blockingWindow = document.createElement("div");
        blockingWindow.id = "blocking-window";
        document.body.appendChild(blockingWindow);

        console.log("added blocking window");
    } 
}