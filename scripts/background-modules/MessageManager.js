export class MessageManager {
  #dataManager;
  #response; // will be filled after each getMessage

  constructor(dataManager) {
    this.#dataManager = dataManager;
  }

  getMessage(message, sendResponse) {
    switch (message.text) {
      case "get list mode":
        this.#getListMode();
        break;
      case "change list mode":
        this.#changeListMode();
        break;
      case "get current list":
        this.#getCurrentList(message.url);
        break;
      case "set to list":
        this.#setToList(message.url);
        break;
      case "delete from list":
        this.#deleteFromList(message.url);
        break;
      case "get blocking time":
        this.#getBlockingTime();
        break;
      case "set blocking time":
        this.#setBlockingTime(message.time);
        break;
      default:
        throw new Error("Unknown message type.");
    }

    sendResponse(this.#response);
  }

  #getListMode() {
    this.#response = { mode: this.#dataManager.blockingMode };
  }

  #changeListMode() {
    this.#dataManager.changeMode();
    this.#response = { mode: this.#dataManager.blockingMode };
  }

  #getCurrentList() {
    const urlSet = this.#dataManager.activeList;
    this.#response = { list: Array.from(urlSet) };
  }

  #setToList(url) {
    try {
      const hostname = this.#dataManager.addUrl(url);
      this.#response = { type: "OK", hostname: hostname };
    } catch (error) {
      this.#response = { type: "ERROR", message: error.message };
    }
  }

  #deleteFromList(hostname) {
    this.#dataManager.deleteHostname(hostname);
  }

  #getBlockingTime() {
    this.#response = { time: this.#dataManager.blockingTime };
  }

  #setBlockingTime(time) {
    try {
      this.#dataManager.blockingTime = time;
      this.#response = { type: "OK", time: this.#dataManager.blockingTime };
    } catch (error) {
      this.#response = { type: "ERROR", time: this.#dataManager.blockingTime };
    }
  }
}
