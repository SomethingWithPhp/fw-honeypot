import http from "http";
import {mergeCidr} from "cidr-tools";

export class ApiServer {

  /**
   * @type {http.Server}
   */
  #server

  /**
   * @type {HoneypotServer}
   */
  #honeypotServer

  constructor(honeypotServer) {
    this.#honeypotServer = honeypotServer
  }

  /**
   * @param {HoneypotServer} honeypotServer
   * @return {ApiServer}
   */
  static create(honeypotServer) {
    const that = new this(honeypotServer)

    const apiServer = http.createServer((req, res) => {

      if (req.method === 'GET') {
        const [, blacklist, version, json] = req.url.split('/')
        if (
          blacklist === 'blacklist'
          && ['v4', 'v6', 'json', undefined].includes(version)
          && ['json', undefined].includes(json)
        ) {
          res.writeHead(200, {'Content-Type': 'text/plain'})
          const useIpv4 = ['v4', 'json'].includes(version) || version === undefined
          const useIpv6 = ['v6', 'json'].includes(version) || version === undefined
          const asJson = [json, version].includes('json')
          const mode = useIpv4 && useIpv6 ? 'both' : (useIpv4 ? 'ipV4' : 'ipV6')
          const both = mode === 'both'
          const response = {}
          let webResponse

          if (useIpv4) {
            response.ipV4 = mergeCidr(honeypotServer.blacklist.ipV4)
          }
          if (useIpv6) {
            response.ipV6 = mergeCidr(honeypotServer.blacklist.ipV6)
          }

          if (asJson) {
            webResponse = JSON.stringify(both ? response : response[mode])
          } else {
            if (response.ipV4) response.ipV4 = response.ipV4.join("\n")
            if (response.ipV6) response.ipV6 = response.ipV6.join("\n")
            webResponse = Object.values(response).filter(Boolean).join("\n")
          }
          res.write(webResponse)
          res.end()
          return
        }
      }

      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Not Found');
    });

    that.#server = apiServer
    return that
  }

  /**
   * @param {number} [port]
   * @return {ApiServer}
   */
  listen(port, host) {
    port ??= this.#honeypotServer.config.port
    host ??= this.#honeypotServer.config.host
    this.#server.listen(port, host, () => {
      console.log(`[API-SERVER] listening on port ${host}:${port}`);
    });
    return this
  }
}

/**
 * @param {HoneypotServer} honeypot
 * @return {ApiServer}
 */
export const createApiServer = (honeypot) => {
  return ApiServer.create(honeypot)
}
