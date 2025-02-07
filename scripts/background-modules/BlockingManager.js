import { isChromeUrl, extractHostname } from "./utils.js";

const BLOCK_PAGE_PATH = "./pages/blockPage.html";

export class BlockingManager {
  #dataManager;
  #prevHosts;
  #timeouts;

  constructor(dataManager, prevHosts) {
    this.#dataManager = dataManager;
    this.#prevHosts = prevHosts;
    this.#timeouts = new Map();
  }

  processTab(tab) {
    if (!isChromeUrl(tab.url)) {
      this.#clearTabTimeout(tab.id);

      if (this.#shouldBlock(tab)) {
        this.#block(tab);
      } else {
        this.#prevHosts.set(tab.id, extractHostname(tab.url));
      }
    } else {
      this.#prevHosts.set(tab.id, "chromeUrl");
    } 
  }

  deleteTab(tabId) {
    this.#prevHosts.delete(tabId);
    this.#timeouts.delete(tabId);
  }

  #shouldBlock(tab) {
    return (
      this.#dataManager.containsUrl(tab.url) &&
      (!this.#prevHosts.get(tab.id) === undefined || 
      this.#prevHosts.get(tab.id) !== extractHostname(tab.url))
    );
  }

  #block(tab) {
    this.#temporarilyBlock(tab);
  }

  #clearTabTimeout(tabId) {
    if (this.#timeouts.has(tabId)) {
      clearTimeout(this.#timeouts.get(tabId));
    }
  }

  #temporarilyBlock(tab) {
    chrome.tabs.update(tab.id, { url: BLOCK_PAGE_PATH }).then(() => {
      const newTimeoutId = setTimeout(() => {
        if (this.#prevHosts.has(tab.id)) {
          this.#prevHosts.set(tab.id, extractHostname(tab.url));
          chrome.tabs.update(tab.id, { url: tab.url });
          this.#timeouts.delete(tab.id);
        }
      }, this.#dataManager.blockingTime * 1000 + 200);

      this.#timeouts.set(tab.id, newTimeoutId);
    });
  }
}
