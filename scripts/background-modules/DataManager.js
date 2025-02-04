import { saveToBlockData } from "./utils";

const MAX_BLOCKING_TIME = 60;
const MIN_BLOCKING_TIME = 10;
export class DataManager {
  #activeList;
  #blocklist;
  #allowlist;
  #blockingTime;
  #isBlocklistMode;

  constructor(data) {
    this.#blocklist = new Set(data.sites.blocklist);
    this.#allowlist = new Set(data.sites.allowlist);
    this.#blockingTime = data.blockingTime;
    this.#isBlocklistMode = data.isBlocklistMode;
  }

  get blockingMode() { // returns true if blocklist mode is active, otherwise false
    return this.#isBlocklistMode;
  }

  get blockingTime() {
    return this.#blockingTime;
  }
  set blockingTime(time) {
    if (time >= MIN_BLOCKING_TIME && time <= MAX_BLOCKING_TIME) {
      this.#blockingTime = time;
    }
  }

  get activeList() {
    return this.#activeList;
  }

  addUrl(url) {
    this.#activeList.add(url);
    this.#saveData();
  }

  deleteUrl(url) {
    this.#activeList.delete(url);
    this.#saveData();
  }

  changeMode() {
    this.#isBlocklistMode = !this.#isBlocklistMode;
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