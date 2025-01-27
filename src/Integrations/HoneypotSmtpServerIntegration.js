import {AbstractHoneypotIntegration} from "./AbstractHoneypotIntegration.js";
import {HoneypotServer} from "../CreateHoneypot.js";
import {mergeConfigs} from "../utils/config-utils.js";
import {SMTPServer} from "smtp-server";
import {debugLog} from "../utils/log-utils.js";
import {splitIpAddress} from "../utils/ip-utils.js";

export class HoneypotSmtpServerIntegration extends AbstractHoneypotIntegration {

  #server

  /**
   * @type {HoneypotServerConfig}
   */
  #config = {
    port: 25
  }

  constructor(config) {
    super()
    this.config = mergeConfigs(this.config, config)
  }

  /**
   * @return {HoneypotServerConfig}
   */
  get config() {
    return this.#config
  }

  set config(config) {
    this.#config = config
  }

  /**
   * @param {HoneypotServer} honeypotServer
   */
  create(honeypotServer) {

    /**
     * @type {HoneypotServerConfig}
     */
    const config = mergeConfigs(honeypotServer.config, this.config)
    this.config = config

    const server = new SMTPServer({
      name: 'mail.local',
      banner: 'welcome',
      logger: false,
      disabledCommands: ['AUTH'],
      onData(stream, session, callback) {
        stream.pipe(process.stdout)
        //stream.resume()
        stream.on("end", callback)
      },
      onRcptTo(address, session, callback) {
        debugLog(`Recipient: ${address.address}`)
        return callback()
      },
      onMailFrom(address, session, callback) {
        debugLog(`Mail from: ${address.address}`)
        return callback()
      },
      onConnect(session, callback) {
        const ip = splitIpAddress(session.remoteAddress)
        debugLog(`Connection attempt from ${ip} - ${session.clientHostname}`);

        if (honeypotServer.whitelist.contains(ip)) {
          debugLog(`IP ${ip} is whitelisted.`);
        } else {
          honeypotServer.blacklist.add(ip, config.banDurationMs)
        }
        callback()
      },
    });

    this.#server = server
  }

  listen() {
    this.#server
      .listen(this.#config.port, this.#config.host, () => {
        console.log(`[SMTP] Honeypot is listening on port ${this.#config.host}:${this.#config.port}`);
      })
  }
}
