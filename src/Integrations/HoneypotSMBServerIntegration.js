import {AbstractHoneypotIntegration} from "./AbstractHoneypotIntegration.js";
import {HoneypotServer} from "../CreateHoneypot.js";
import {mergeConfigs} from "../utils/config-utils.js";
import {debugLog} from "../utils/log-utils.js";
import net from "net";

const SMB_BANNER = Buffer.from([
  0xFF, 0x53, 0x4D, 0x42, // "SMB" Header
  0x72, // Command (Negotiate Protocol)
]);

export class HoneypotSMBServerIntegration extends AbstractHoneypotIntegration {
  #server;

  /**
   * @type {HoneypotServerConfig}
   */
  #config = {
    port: 445,
  };

  constructor(config) {
    super();
    this.config = mergeConfigs(this.config, config);
  }

  /**
   * @return {HoneypotServerConfig}
   */
  get config() {
    return this.#config;
  }

  set config(config) {
    this.#config = config;
  }

  /**
   * @param {HoneypotServer} honeypotServer
   */
  create(honeypotServer) {
    const config = mergeConfigs(honeypotServer.config, this.config);

    this.#server = net.createServer((socket) => {
      const ip = socket.remoteAddress;

      debugLog(`[SMB] New connection from ${ip}`);

      if (!ip) {
        debugLog("[SMB] Invalid IP address. Connection closed.");
        socket.destroy();
        return;
      }

      socket.on("error", (err) => {
        debugLog(`[SMB] Socket error from ${ip}: ${err.message}`);
      });

      if (honeypotServer.whitelist.contains(ip)) {
        debugLog(`[SMB] IP ${ip} is whitelisted. Closing connection.`);
        socket.destroy();
        return;
      }

      honeypotServer.blacklist.add(ip, config.banDurationMs);

      // Simuliere SMB-Protokoll
      socket.write(SMB_BANNER);

      socket.on("data", (data) => {
        debugLog(`[SMB] Data from ${ip}: ${data.toString("hex")}`);
      });

      // Verbindung nach 10 Sekunden beenden
      setTimeout(() => {
        socket.destroy();
        debugLog(`[SMB] Connection from ${ip} has been closed.`);
      }, 10000);
    });
  }

  listen() {
    this.#server
      .listen(this.#config.port, () => {
        console.log(`[SMB] Honeypot is listening on port ${this.#config.port}`);
      })
      .on("error", (err) => {
        console.error(`[SMB] Error: ${err.message}`);
      });
  }
}
