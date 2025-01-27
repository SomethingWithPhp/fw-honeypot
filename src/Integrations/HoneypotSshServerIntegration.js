import {AbstractHoneypotIntegration} from "./AbstractHoneypotIntegration.js";
import net from "net";
import {splitIpAddress} from "../utils/ip-utils.js";
import {HoneypotServer} from "../CreateHoneypot.js";
import {mergeConfigs} from "../utils/config-utils.js";
import {debugLog} from "../utils/log-utils.js";

const SSH_BANNER = 'SSH-2.0-OpenSSH_8.6\r\n';

export class HoneypotSshServerIntegration extends AbstractHoneypotIntegration {

  #server

  /**
   * @type {HoneypotServerConfig}
   */
  #config = {
    port: 22
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
   * @param {HoneypotServer} server
   */
  create(honeypotServer) {

    /**
     * @type {HoneypotServerConfig}
     */
    const config = mergeConfigs(honeypotServer.config, this.config)
    this.config = config

    const server = net.createServer((socket) => {

      const ip = splitIpAddress(socket.remoteAddress)

      debugLog(`New connection from ${ip}`);

      if (!ip) {
        debugLog("Invalid IP address. Connection will be closed.");
        socket.destroy();
        return
      }

      socket.on('error', (err) => {
        debugLog(`Socket error from ${ip}: ${err.message}`);
      });

      if (honeypotServer.whitelist.contains(ip)) {
        debugLog(`IP ${ip} is whitelisted. Closing connection.`);
        socket.destroy();
        return
      }

      honeypotServer.blacklist.add(ip, config.banDurationMs)
      socket.write(SSH_BANNER);

      setTimeout(() => {
        socket.destroy();
        debugLog(`Connection from ${ip} has been closed.`);
      }, 5000)
    });

    this.#server = server
  }

  listen() {
    this.#server
      .listen(this.#config.port, this.#config.host, () => {
        console.log(`[SSH] Honeypot is listening on port ${this.#config.host}:${this.#config.port}`);
      })
      .on("error", (err) => {
        console.error(`Error: ${err.message}`);
      })
  }
}
