import {debugLog} from "./utils/log-utils.js";
import {IpAddress} from "./utils/ip-utils.js";
import {readConfig} from "./Config.js";

export class IPList {

  #list = {
    v4: {},
    v6: {}
  }

  /**
   * @return {string[]}
   */
  get ipV4() {
    return Object.keys(this.#list.v4)
  }

  /**
   * @return {string[]}
   */
  get ipV6() {
    return Object.keys(this.#list.v6)
  }

  static loadFromFile(path) {

    const content = readConfig(path + '', true)
    const that = new this()

    const fill = (ips) => {

      if (!Array.isArray(ips)) {
        ips = []
      }
      return Object.fromEntries(ips.map((ip) => {
        return [ip, true]
      }))
    }
    that.#list.v4 = fill(content.ipV4)
    that.#list.v6 = fill(content.ipV6)
    return that
  }

  /**
   * @param {IpAddress} ip
   * @return {boolean}
   */
  contains(ip) {
    return !!((ip.ipV4 && this.#list.v4[ip.ipV4])
      || (ip.ipV6 && this.#list.v6[ip.ipV6]));
  }

  /**
   * @param {IpAddress} ip
   * @return {IPList}
   */
  add(ip, banDuration) {
    debugLog(`Add ip ${ip} to blacklist.`);
    const now = this.getCurrentTimestamp()
    if (ip.ipV4 && this.#list.v4[ip.ipV4] !== true) this.#list.v4[ip.ipV4] = now + banDuration
    if (ip.ipV6 && this.#list.v6[ip.ipV6] !== true) this.#list.v6[ip.ipV6] = now + banDuration
    return this
  }

  /**
   * @return {number}
   */
  getCurrentTimestamp() {
    return Date.now()
  }

  /**
   * @param {string} ip
   * @return {number}
   */
  getIpV4Timestamp(ip) {
    return this.#list.v4[ip]
  }

  /**
   * @param {string} ip
   * @return {number}
   */
  getIpV6Timestamp(ip) {
    return this.#list.v6[ip]
  }

  /**
   * @param {string} ip
   * @return {IPList}
   */
  del(ip) {
    if (this.#list.v4[ip]) {
      delete this.#list.v4[ip];
      debugLog(`Removed IPv4: ${ip}`);
    } else if (this.#list.v6[ip]) {
      delete this.#list.v6[ip];
      debugLog(`Removed IPv6: ${ip}`);
    }

    return this
  }
}
