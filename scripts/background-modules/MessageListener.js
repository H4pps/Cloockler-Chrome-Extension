export class MessageListener {
  #manager;

  constructor(dataManager) {
    this.#manager = dataManager;
  }

  getMessage(message) {
    switch (message.text) {
      case "get list mode":
      default:
    }
  }
}