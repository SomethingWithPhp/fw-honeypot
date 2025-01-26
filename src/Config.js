import {readFileSync} from "node:fs";

/**
 * @param {string} path
 * @return {HoneypotEnvironmentConfig}
 */
export const readConfig = (path) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    console.error(e)
  }
  return {}
}
