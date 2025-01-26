import {AbstractHoneypotIntegration} from "./Integrations/AbstractHoneypotIntegration.js";
import {IPList} from "./IPList.js";
import {createApiServer} from "./ApiServer.js";
import {mergeConfigs} from "./utils/config-utils.js";

const DEFAULT_BAN_DURATION_MS = 60 * 60 * 24 * 1000
const DEFAULT_API_SERVER_PORT = 3477
const TICK_MS = 1000

export class HoneypotServer {

  /**
   * @type {AbstractHoneypotIntegration[]}
   */
  #integrations = []

  blacklist = new IPList()
  whitelist = new IPList()

  /**
   * @type {HoneypotServerConfig}
   */
  #config = {
    port: DEFAULT_API_SERVER_PORT,
    banDurationMs: DEFAULT_BAN_DURATION_MS
  }
  #apiServer

  /**
   * @param {AbstractHoneypotIntegration[]} abstractHoneypotIntegration
   * @param {HoneypotServerConfig} config
   */
  constructor(abstractHoneypotIntegration, config) {
    config ??= {}
    this.#integrations = abstractHoneypotIntegration
    this.#config = mergeConfigs(this.#config, config)
  }

  /**
   * @return {HoneypotServerConfig}
   */
  get config() {
    return this.#config
  }

  /**
   * @return {ApiServer}
   */
  get apiServer() {
    return this.#apiServer ??= createApiServer(this)
  }

  /**
   * @return {Promise<HoneypotServer>}
   */
  async run() {
    for (const integration of this.#integrations) {
      await integration.create(this)
      await integration.listen()
    }

    setInterval(() => {
      const now = this.blacklist.getCurrentTimestamp()
      const keys = this.blacklist.ipV4
      for (const key of keys) {
        const timestamp = this.blacklist.getIpV4Timestamp(key)
        if (timestamp + this.#config.banDurationMs <= now) {
          this.blacklist.del(key)
        }
      }

      for (const key of this.blacklist.ipV6) {
        const timestamp = this.blacklist.getIpV6Timestamp(key)
        if (timestamp <= now) {
          this.blacklist.del(key)
        }
      }
    }, TICK_MS)

    this.apiServer.listen()
    return this
  }
}

/**
 * @param {AbstractHoneypotIntegration[]} abstractHoneypotIntegrations
 * @param {HoneypotServerConfig} config
 * @return {HoneypotServer}
 */
export const createHoneypot = (abstractHoneypotIntegrations, config) => {
  return new HoneypotServer(abstractHoneypotIntegrations, config)
}
