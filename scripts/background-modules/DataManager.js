import { saveToBlockData, extractHostname } from "./utils.js";

const MAX_BLOCKING_TIME = 60;
const MIN_BLOCKING_TIME = 10;
export class DataManager {
  #activeList;
  #blocklist;
  #allowlist;
  #blockingTime;
  #isBlocklistMode;

  constructor(data) {
    this.#blocklist = new Set(data.blocklist);
    this.#allowlist = new Set(data.allowlist);
    this.#blockingTime = data.blockingTime;
    this.#isBlocklistMode = data.isBlocklistMode;

    this.#setActiveList();
  }

  get blockingMode() { // returns true if blocklist mode is active, otherwise false
    return this.#isBlocklistMode;
  }

  get blockingTime() {
    return this.#blockingTime;
  }
  set blockingTime(time) {
    if (time < MIN_BLOCKING_TIME || time > MAX_BLOCKING_TIME) {
      throw new Error("Time is out of range");
    }

    this.#blockingTime = time;
    this.#saveData();
  }

  get activeList() {
    return this.#activeList;
  }

  // returns added hostname
  addUrl(url) {
    const hostname = extractHostname(url);

    if (this.#activeList.has(hostname)) {
      throw new Error("URL hostname is already in the list");
    }

    this.#activeList.add(hostname);
    this.#saveData();

    return hostname;
  }

  containsUrl(url) {
    const hostname = extractHostname(url);
    return this.#activeList.has(hostname);
  }

  deleteHostname(hostname) {
    this.#activeList.delete(hostname);
    this.#saveData();
  }

  changeMode() {
    this.#isBlocklistMode = !this.#isBlocklistMode;
    this.#setActiveList();
  }

  #setActiveList() {
    this.#activeList = this.#isBlocklistMode ? this.#blocklist : this.#allowlist;
  }

  #saveData() {
    const savedData = {
      blocklist: Array.from(this.#blocklist),
      allowlist: Array.from(this.#allowlist),
      blockingTime: this.#blockingTime,
      isBlocklistMode: this.#isBlocklistMode,
    };

    saveToBlockData(savedData);
  }
}