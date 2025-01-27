import {AbstractHoneypotIntegration} from "./AbstractHoneypotIntegration.js";
import net from "net";
import {splitIpAddress} from "../utils/ip-utils.js";
import {HoneypotServer} from "../CreateHoneypot.js";
import {mergeConfigs} from "../utils/config-utils.js";
import {debugLog} from "../utils/log-utils.js";

const TELNET_BANNER = 'Welcome to Telnet Honeypot\r\n';

export class HoneypotTelnetServerIntegration extends AbstractHoneypotIntegration {

  #server

  /**
   * @type {HoneypotServerConfig}
   */
  #config = {
    port: 23
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

    const server = net.createServer((socket) => {

      const ip = splitIpAddress(socket.remoteAddress);

      debugLog(`[Telnet] New connection from ${ip}`)

      if (!ip) {
        debugLog("[Telnet] Invalid IP address. Connection will be closed.")
        socket.destroy()
        return;
      }

      socket.on('error', (err) => {
        debugLog(`[Telnet] Socket error from ${ip}: ${err.message}`)
      });

      if (honeypotServer.whitelist.contains(ip)) {
        debugLog(`[Telnet] IP ${ip} is whitelisted. Closing connection.`)
        socket.destroy()
        return
      }

      honeypotServer.blacklist.add(ip, config.banDurationMs)

      socket.write(TELNET_BANNER)
      socket.write('login: ')

      socket.on('data', (data) => {
        const input = data.toString().trim()
        debugLog(`[Telnet] Input from ${ip}: ${input}`)
        socket.write('Invalid login.\r\nlogin: ')
      })

      setTimeout(() => {
        socket.destroy()
        debugLog(`[Telnet] Connection from ${ip} has been closed.`)
      }, 10000)
    });

    this.#server = server;
  }

  listen() {
    this.#server
      .listen(this.#config.port, this.#config.host, () => {
        console.log(`[Telnet] Honeypot is listening on port ${this.#config.host}:${this.#config.port}`);
      })
      .on("error", (err) => {
        console.error(`[Telnet] Error: ${err.message}`);
      });
  }
}
