const timerCountdown = document.querySelector("#timer-countdown");

chrome.runtime.sendMessage({text: "get blocking time"})
.then(response => {
  let durationInSeconds = response.time; // setting time for the countdown time
  timerCountdown.textContent = convertSecondsToTimerText(durationInSeconds);

  function updateTimer() {
    --durationInSeconds;

    if (durationInSeconds < 0) {
      clearInterval(timerInterval);
    } else {
      timerCountdown.textContent = convertSecondsToTimerText(durationInSeconds);
    }
  }

  // Update the timer every second
  let timerInterval = setInterval(updateTimer, 1000);
});

let convertSecondsToTimerText = durationInSeconds => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;

  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}