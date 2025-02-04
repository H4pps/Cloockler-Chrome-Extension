export class DataManager {
  static MAX_BLOCKING_TIME = 60;
  static MIN_BLOCKING_TIME = 10;

  constructor(data) {
    this.blocklist = data.sites.blocklist;
    this.allowlist = data.sites.allowlist;
    this.blockingTime = data.blockingTime;
    this.isBlocklistMode = data.isBlocklistMode;
  }
}