let previousHostname = null;
chrome.runtime.onMessage.addListener(getMessage);

function getMessage(message, sender, sendResponse) {
    if (message.text === "start blocking event") {
        previousHostname = message.hostname; // preventing blocking the same hostname several times in a row

        let durationInSeconds = message.time; // setting time for the countdown timer

        const blockingWindow = document.createElement("div");
        blockingWindow.id = "blocking-window-blocking-extension";

        const timer = document.createElement("div");
        timer.id = "blocking-timer-section-blocking-extension";
        const timerHeader = document.createElement("h1");
        timerHeader.id = "timer-header-blocking-extension";
        timerHeader.textContent = "You still have time to change your mind";
        const timerCountdown = document.createElement("h1");
        timerCountdown.id = "timer-countdown-blocking-extension";
        timerCountdown.textContent = convertSecondsToTimerText(durationInSeconds);

        timer.appendChild(timerHeader); // composing a blocking window HTML object
        timer.appendChild(timerCountdown);
        blockingWindow.appendChild(timer);
        document.body.appendChild(blockingWindow);

        function updateTimer() {
            --durationInSeconds;

            if (durationInSeconds < 0) {
                clearInterval(timerInterval);
                blockingWindow.remove();
            } else {
                timerCountdown.textContent = convertSecondsToTimerText(durationInSeconds);
            }
        }

        // Update the timer every second
        let timerInterval = setInterval(updateTimer, 1000);
    } 
}

function convertSecondsToTimerText(durationInSeconds) {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}