import {readFileSync} from "node:fs";

/**
 * @param {string} path
 * @param {boolean} [ignoreError=false]
 * @return {HoneypotEnvironmentConfig}
 */
export const readConfig = (path, ignoreError = false) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    if (!ignoreError) {
      console.error(e)
    }
  }
  return {}
}
