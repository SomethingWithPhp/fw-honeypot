import {readConfig} from "./src/Config.js";
import {createHoneypot} from "./src/CreateHoneypot.js";
import {HoneypotSshServerIntegration} from "./src/Integrations/HoneypotSshServerIntegration.js";
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {HoneypotSmtpServerIntegration} from "./src/Integrations/HoneypotSmtpServerIntegration.js";
import {HoneypotTelnetServerIntegration} from "./src/Integrations/HoneypotTelnetServerIntegration.js";
import {HoneypotMySQLServerIntegration} from "./src/Integrations/HoneypotMySQLServerIntegration.js";
import {HoneypotSMBServerIntegration} from "./src/Integrations/HoneypotSMBServerIntegration.js";
import {IPList} from "./src/IPList.js";

const config = readConfig(resolve(dirname(fileURLToPath(import.meta.url)), '.env.json'))
const prefilledBlacklist = IPList.loadFromFile(resolve(dirname(fileURLToPath(import.meta.url)), 'blacklist.json'))
const prefilledWhitelist = IPList.loadFromFile(resolve(dirname(fileURLToPath(import.meta.url)), 'whitelist.json'))
config.honeypot.blacklist = prefilledBlacklist
config.honeypot.whitelist = prefilledWhitelist

const integrationMap = {
  HoneypotSshServerIntegration,
  HoneypotSmtpServerIntegration,
  HoneypotTelnetServerIntegration,
  HoneypotMySQLServerIntegration,
  HoneypotSMBServerIntegration
}

/**
 * @type {AbstractHoneypotIntegration[]}
 */
const integrations = config.integrations.map((integration) => {
  if (typeof integration === 'string') {
    integration = {
      name: integration
    }
  }
  return new integrationMap[integration.name](integration.config)
})

await createHoneypot(integrations, config.honeypot).run()
