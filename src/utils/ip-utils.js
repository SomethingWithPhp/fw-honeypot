import ipRegex from 'ip-regex';

export class IpAddress {

  #ipV4
  #ipV6

  constructor(ipV4, ipV6) {
    this.#ipV4 = ipV4 ?? null
    this.#ipV6 = ipV6 ?? null
  }

  get ipV4() {
    return this.#ipV4
  }

  get ipV6() {
    return this.#ipV6
  }

  toString() {
    return [this.#ipV4, this.#ipV6].filter(Boolean).join('/') || 'No IP address'
  }
}

/**
 * @param {string} remoteAddress
 * @return {IpAddress|null}
 */
export const splitIpAddress = (remoteAddress) => {
  const matchesIpV4 = remoteAddress.match(ipRegex.v4())

  if (matchesIpV4) {
    return new IpAddress(matchesIpV4[0])
  }

  const matchesIpV6 = remoteAddress.match(ipRegex.v6())

  if (matchesIpV6) {
    return new IpAddress(null, matchesIpV6[0])
  }

  return null
}

const multipliers = [0x1000000, 0x10000, 0x100, 1];
const ip2long = (ip) => ip.split('.').reduce((acc, part, i) => acc + part * multipliers[i], 0)
const long2ip = (longValue) => multipliers.map((m) => Math.floor((longValue % (m * 0x100)) / m)).join('.')
