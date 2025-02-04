const MAX_BLOCKING_TIME = 60;
const MIN_BLOCKING_TIME = 10;
export class DataManager {
  #activeList;
  #blocklist;
  #allowlist;
  #blockingTime;
  #isBlocklistMode;

  constructor(data) {
    this.#blocklist = data.sites.blocklist;
    this.#allowlist = data.sites.allowlist;
    this.#blockingTime = data.blockingTime;
    this.#isBlocklistMode = data.isBlocklistMode;
  }

  setActiveList

}