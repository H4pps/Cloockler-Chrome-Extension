let openBlockPage = () => {
    const blockPage = chrome.runtime.getUrl("blockPage.html");
    
    window.location.href = blockPage;

    setTimeout(function() {
        window.history.back();
    }, 5000);
}

openBlockPage();